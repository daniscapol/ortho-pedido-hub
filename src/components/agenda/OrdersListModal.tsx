import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/hooks/useOrders";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface OrdersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  title: string;
  onOrderClick: (order: Order) => void;
}

const OrdersListModal = ({ isOpen, onClose, orders, title, onOrderClick }: OrdersListModalProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'producao': return 'bg-blue-100 text-blue-800'
      case 'pronto': return 'bg-green-100 text-green-800'
      case 'entregue': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'producao': return 'Em Produção'
      case 'pronto': return 'Pronto'
      case 'entregue': return 'Entregue'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800'
      case 'media': return 'bg-yellow-100 text-yellow-800'
      case 'baixa': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      "Coroa Emax": "border-l-4 border-l-blue-500 bg-blue-50",
      "Coroa Impressa": "border-l-4 border-l-green-500 bg-green-50",
      "Coroa sobre Implante": "border-l-4 border-l-purple-500 bg-purple-50",
      "Inlay/Onlay Emax": "border-l-4 border-l-orange-500 bg-orange-50",
      "Inlay/Olay Implante": "border-l-4 border-l-pink-500 bg-pink-50",
      "Facetas": "border-l-4 border-l-indigo-500 bg-indigo-50",
    }
    return colors[type as keyof typeof colors] || "border-l-4 border-l-gray-500 bg-gray-50"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            <Badge variant="secondary">{orders.length} pedidos</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum pedido encontrado nesta categoria
            </div>
          ) : (
            orders.map((order) => (
              <Card 
                key={order.id}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-shadow",
                  getTypeColor(order.prosthesis_type)
                )}
                onClick={() => onOrderClick(order)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="font-medium">{order.prosthesis_type}</div>
                      <div className="text-sm text-gray-600">
                        Dr(a). {order.dentist} • {order.patients?.nome_completo}
                      </div>
                      <div className="text-xs text-gray-500">
                        Prazo: {format(parseISO(order.deadline), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="text-xs text-gray-500">
                        Criado: {format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrdersListModal;