import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useOrderItems } from "@/hooks/useOrderItems";
import { usePermissions } from "@/hooks/usePermissions";
import { getStatusColor, getStatusLabel, canChangeStatus } from "@/lib/status-config";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const OrderRow = ({ order }: { order: any }) => {
  const { data: orderItems = [] } = useOrderItems(order.id);
  const updateOrderStatus = useUpdateOrderStatus();
  const { isSuperAdmin } = usePermissions();
  const isAdminMaster = isSuperAdmin();

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!canChangeStatus(isAdminMaster)) return;
    updateOrderStatus.mutate({ id: orderId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={getStatusColor(status)}>
        {getStatusLabel(status, isAdminMaster)}
      </Badge>
    );
  };

  const getDisplayType = () => {
    if (orderItems.length > 0) {
      return orderItems.length === 1 
        ? orderItems[0].prosthesis_type 
        : `${orderItems.length} produtos`;
    }
    return order.prosthesis_type;
  };

  return (
    <tr className="border-b border-border/50">
      <td className="py-3 px-2 text-sm font-mono text-foreground">
        {order.id.slice(-8)}
      </td>
      <td className="py-3 px-2 text-sm text-foreground">
        {order.patients?.nome_completo || 'N/A'}
      </td>
      <td className="py-3 px-2 text-sm text-foreground">{order.dentist}</td>
      <td className="py-3 px-2 text-sm text-foreground">
        <div>
          <span>{getDisplayType()}</span>
          {orderItems.length > 1 && (
            <div className="text-xs text-muted-foreground">
              {orderItems.slice(0, 2).map(item => item.product_name).join(', ')}
              {orderItems.length > 2 && '...'}
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-2">{getStatusBadge(order.status)}</td>
      <td className="py-3 px-2 text-sm text-foreground">
        {format(new Date(order.deadline), 'dd/MM/yyyy', { locale: ptBR })}
      </td>
      <td className="py-3 px-2">
        <div className="flex gap-2">
          {canChangeStatus(isAdminMaster) && order.status !== 'entregue' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const nextStatus = {
                  pedido_solicitado: 'baixado_verificado',
                  baixado_verificado: 'projeto_realizado',
                  projeto_realizado: 'projeto_modelo_realizado',
                  projeto_modelo_realizado: 'aguardando_entrega',
                  aguardando_entrega: 'entregue'
                }[order.status] || order.status;
                handleStatusChange(order.id, nextStatus);
              }}
              disabled={updateOrderStatus.isPending}
            >
              Avançar
            </Button>
          )}
          <Button variant="outline" size="sm">
            <a href={`/pedido/${order.id}`}>Ver</a>
          </Button>
        </div>
      </td>
    </tr>
  );
};

const OrdersTable = () => {
  const { data: orders, isLoading } = useOrders();


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Paciente</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Dentista</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tipo</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Prazo</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersTable;