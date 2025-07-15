import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderTimeline } from "@/hooks/useOrderTimeline";
import { Clock, Plus, RefreshCw } from "lucide-react";

interface OrderTimelineProps {
  orderId: string;
}

const OrderTimeline = ({ orderId }: OrderTimelineProps) => {
  const { data: timeline, isLoading } = useOrderTimeline(orderId);

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Pendente",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock
      },
      producao: {
        label: "Em Produção",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: RefreshCw
      },
      pronto: {
        label: "Pronto",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: Plus
      },
      entregue: {
        label: "Entregue",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Plus
      }
    };

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const getActionLabel = (action: string) => {
    return action === "create" ? "Pedido criado" : "Status alterado";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Linha do Tempo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Linha do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nenhum histórico encontrado para este pedido.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Linha do Tempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border"></div>
          
          <div className="space-y-6">
            {timeline.map((event, index) => {
              const statusInfo = getStatusInfo(event.status);
              const Icon = statusInfo.icon;
              const isFirst = index === 0;
              const isLast = index === timeline.length - 1;

              return (
                <div key={event.id} className="relative flex items-start space-x-4">
                  {/* Ícone do status */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-background
                    ${isFirst ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                  `}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Conteúdo do evento */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {getActionLabel(event.action)}
                      </span>
                      <Badge className={`text-xs ${statusInfo.color}`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTimeline;