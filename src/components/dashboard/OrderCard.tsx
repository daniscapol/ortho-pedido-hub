import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Package, MapPin } from "lucide-react";
import { Order } from "@/hooks/useOrders";
import { useOrderItems } from "@/hooks/useOrderItems";
import { usePermissions } from "@/hooks/usePermissions";
import { getStatusColor, getStatusLabel } from "@/lib/status-config";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const OrderCard = ({ order, onClick }: OrderCardProps) => {
  const { data: orderItems = [] } = useOrderItems(order.id);
  const { isSuperAdmin } = usePermissions();
  const isAdminMaster = isSuperAdmin();

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-foreground">
              {order.patients?.nome_completo}
            </h3>
            <p className="text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
          </div>
          <Badge className={`text-xs font-medium ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status, isAdminMaster)}
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
                <div key={index}>• {item.product_name} ({item.prosthesis_type})</div>
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