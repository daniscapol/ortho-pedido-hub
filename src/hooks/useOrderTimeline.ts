import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export interface TimelineEvent {
  id: string;
  action: string;
  status: string;
  created_at: string;
  user_id: string;
  user_name?: string;
}

export const useOrderTimeline = (orderId: string) => {
  const queryClient = useQueryClient();

  // Setup realtime subscription para escutar mudanças na timeline
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel('audit_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
          filter: `entity_id=eq.${orderId}`
        },
        (payload) => {
          console.log('New audit log received:', payload);
          // Invalidar a query para refetch os dados
          queryClient.invalidateQueries({ queryKey: ["order-timeline", orderId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, queryClient]);

  return useQuery({
    queryKey: ["order-timeline", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("entity_type", "order")
        .eq("entity_id", orderId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Transform audit logs into timeline events
      const events: TimelineEvent[] = [];
      
      for (const log of data) {
        if (log.action === "create") {
          events.push({
            id: log.id,
            action: "create",
            status: log.new_values?.status || "pedido_solicitado",
            created_at: log.created_at,
            user_id: log.user_id
          });
        } else if (log.action === "update" && log.old_values?.status !== log.new_values?.status) {
          events.push({
            id: log.id,
            action: "status_change",
            status: log.new_values?.status,
            created_at: log.created_at,
            user_id: log.user_id
          });
        }
      }

      // Get user names for all events
      const userIds = [...new Set(events.map(e => e.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);

        if (profiles) {
          events.forEach(event => {
            const profile = profiles.find(p => p.id === event.user_id);
            if (profile) {
              event.user_name = profile.name;
            }
          });
        }
      }

      return events;
    },
    enabled: !!orderId,
  });
};