import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@/hooks/useOrders";
import { useDentistProfile } from "@/hooks/useDentistProfile";
import { useOrderItems } from "@/hooks/useOrderItems";
import { usePermissions } from "@/hooks/usePermissions";
import { getStatusColor, getStatusLabel } from "@/lib/status-config";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal = ({ order, isOpen, onClose }: OrderDetailsModalProps) => {
  const navigate = useNavigate();
  const { data: orderItems = [] } = useOrderItems(order?.id);
  const { data: dentistProfile } = useDentistProfile(order?.user_id);
  const { isSuperAdmin } = usePermissions();
  const isAdminMaster = isSuperAdmin();
  
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-left">
            {order.patients?.nome_completo}
          </DialogTitle>
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-slate-600">
                Pedido: #{order.id.slice(0, 8)}
              </Badge>
              <Badge className={getStatusColor(order.status)}>
                {getStatusLabel(order.status, isAdminMaster)}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button onClick={() => navigate(`/pedido/${order.id}`)}>
                Ver detalhes completos
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Data e Hora do Pedido */}
          <div>
            <p className="text-sm text-muted-foreground">
              <strong>Data e Hora do Pedido:</strong> {format(new Date(order.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>

          {/* Informações do Dentista */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Informações do Dentista</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Dentista:</strong> <span className="text-muted-foreground">{order.dentist}</span></p>
              <p><strong>E-mail:</strong> <span className="text-muted-foreground">{dentistProfile?.email || 'E-mail não disponível'}</span></p>
              <p><strong>Telefone:</strong> <span className="text-muted-foreground">{dentistProfile?.telefone || 'Telefone não disponível'}</span></p>
            </div>
          </div>

          {/* Informações do Serviço */}
          {orderItems.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Produtos do Pedido ({orderItems.length})</h3>
              <div className="space-y-3">
                {orderItems.map((item, index) => (
                  <div key={item.id} className="border border-border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">{item.prosthesis_type}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                    </div>
                    
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                       <div><strong>Tipo:</strong> <span className="text-muted-foreground">{item.prosthesis_type}</span></div>
                       {item.material && (
                         <div><strong>Material:</strong> <span className="text-muted-foreground">{item.material}</span></div>
                       )}
                       {item.color && (
                         <div><strong>Cor:</strong> <span className="text-muted-foreground">{item.color}</span></div>
                       )}
                     </div>

                    {item.selected_teeth.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Dentes:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.selected_teeth.map((tooth) => (
                            <Badge key={tooth} variant="secondary" className="text-xs py-0">
                              {tooth}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.observations && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">{item.observations}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Fallback para pedidos antigos
            order.prosthesis_type !== 'multiplos' && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Informações do Serviço</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Serviço:</strong> <span className="text-muted-foreground">{order.prosthesis_type}</span></p>
                  {order.material && (
                    <p><strong>Material:</strong> <span className="text-muted-foreground">{order.material}</span></p>
                  )}
                  {order.color && (
                    <p><strong>Cor:</strong> <span className="text-muted-foreground">{order.color}</span></p>
                  )}
                  <p><strong>Prioridade:</strong> <span className="text-muted-foreground">{order.priority}</span></p>
                  <p><strong>Prazo:</strong> <span className="text-muted-foreground">{format(new Date(order.deadline), "dd/MM/yyyy", { locale: ptBR })}</span></p>
                </div>
              </div>
            )
          )}

          {/* Dentes Selecionados - só mostra se não há produtos ou se é pedido antigo */}
          {(!orderItems.length && order.selected_teeth && order.selected_teeth.length > 0) && (
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Dentes Selecionados</h3>
              <div className="flex flex-wrap gap-2">
                {order.selected_teeth.map((tooth) => (
                  <Badge key={tooth} variant="secondary" className="text-xs">
                    {tooth}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Observações Gerais */}
          {order.observations && (
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Observações Gerais</h3>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {order.observations}
              </p>
            </div>
          )}

          {/* Endereço de Entrega */}
          {order.delivery_address && (
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Endereço de Entrega</h3>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <p className="text-sm text-muted-foreground">
                    {order.delivery_address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Informações do Paciente */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Informações do Paciente</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Nome:</strong> <span className="text-muted-foreground">{order.patients?.nome_completo}</span></p>
              <p><strong>CPF:</strong> <span className="text-muted-foreground">{order.patients?.cpf}</span></p>
              <p><strong>Telefone:</strong> <span className="text-muted-foreground">{order.patients?.telefone_contato}</span></p>
              <p><strong>E-mail:</strong> <span className="text-muted-foreground">{order.patients?.email_contato}</span></p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;