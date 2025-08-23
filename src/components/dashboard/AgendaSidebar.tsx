import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { usePermissions } from "@/hooks/usePermissions";
import { getStatusColor, getStatusLabel } from "@/lib/status-config";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

const AgendaSidebar = () => {
  const { data: orders } = useOrders();
  const { isSuperAdmin } = usePermissions();
  const isAdminMaster = isSuperAdmin();
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getOrdersForDate = (date: Date) => {
    if (!orders) return [];
    return orders.filter(order => {
      const orderDate = new Date(order.deadline);
      return format(orderDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  return (
    <Card className="w-full h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="w-5 h-5" />
            Agenda
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(weekStart, "MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName) => (
            <div key={dayName} className="text-center text-xs font-medium text-muted-foreground py-2">
              {dayName}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayOrders = getOrdersForDate(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <div key={day.toISOString()} className="min-h-[80px] border border-border rounded-lg p-2 space-y-1">
                <div className="text-center">
                  <span className={`text-sm font-bold ${isToday ? 'text-primary bg-primary/10 px-2 py-1 rounded-full' : 'text-foreground'}`}>
                    {format(day, "d")}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {dayOrders.slice(0, 2).map((order) => (
                    <div key={order.id} className="text-xs">
                      <div className="truncate text-foreground font-medium">
                        {order.patients?.nome_completo}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(order.status)}`}
                      >
                        {getStatusLabel(order.status, isAdminMaster)}
                      </Badge>
                    </div>
                  ))}
                  {dayOrders.length > 2 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{dayOrders.length - 2}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgendaSidebar;