import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const OrdersTable = () => {
  const { data: orders, isLoading } = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      producao: "bg-blue-100 text-blue-800 border-blue-200",
      pronto: "bg-green-100 text-green-800 border-green-200", 
      entregue: "bg-gray-100 text-gray-800 border-gray-200"
    };

    const labels = {
      pending: "Pendente",
      producao: "Produção",
      pronto: "Pronto",
      entregue: "Entregue"
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    updateOrderStatus.mutate({ id: orderId, status: newStatus });
  };

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
                <tr key={order.id} className="border-b border-border/50">
                  <td className="py-3 px-2 text-sm font-mono text-foreground">
                    {order.id.slice(-8)}
                  </td>
                  <td className="py-3 px-2 text-sm text-foreground">
                    {order.patients?.name || 'N/A'}
                  </td>
                  <td className="py-3 px-2 text-sm text-foreground">{order.dentist}</td>
                  <td className="py-3 px-2 text-sm text-foreground">{order.prosthesis_type}</td>
                  <td className="py-3 px-2">{getStatusBadge(order.status)}</td>
                  <td className="py-3 px-2 text-sm text-foreground">
                    {format(new Date(order.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-2">
                      {order.status !== 'entregue' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const nextStatus = {
                              pending: 'producao',
                              producao: 'pronto',
                              pronto: 'entregue'
                            }[order.status] || order.status;
                            handleStatusChange(order.id, nextStatus);
                          }}
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
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersTable;