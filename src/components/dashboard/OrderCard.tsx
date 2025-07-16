import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Package, MapPin } from "lucide-react";
import { Order } from "@/hooks/useOrders";
import { useOrderItems } from "@/hooks/useOrderItems";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const OrderCard = ({ order, onClick }: OrderCardProps) => {
  const { data: orderItems = [] } = useOrderItems(order.id);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning text-warning-foreground";
      case "producao":
        return "bg-primary text-primary-foreground";
      case "pronto":
        return "bg-success text-success-foreground";
      case "entregue":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "producao":
        return "Em Produção";
      case "pronto":
        return "Pronto";
      case "entregue":
        return "Entregue";
      default:
        return status;
    }
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-foreground">
              {order.patients?.name}
            </h3>
            <p className="text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
          </div>
          <Badge className={`text-xs font-medium ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Data do pedido: {format(new Date(order.created_at), "dd/MM/yy", { locale: ptBR })}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <User className="w-4 h-4 mr-2" />
            <span>Dentista: {order.dentist}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Entrega em: {format(new Date(order.deadline), "dd/MM/yy", { locale: ptBR })}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <Package className="w-4 h-4 mr-2" />
            <span>Serviço: {orderItems.length > 0 
              ? `${orderItems.length} produto(s)`
              : order.prosthesis_type
            }</span>
          </div>
          
          {orderItems.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1 ml-6">
              {orderItems.slice(0, 2).map((item, index) => (
                <div key={index}>• {item.product_name}</div>
              ))}
              {orderItems.length > 2 && (
                <div>+ {orderItems.length - 2} outros produtos</div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;