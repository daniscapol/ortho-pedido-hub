import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import OrderTimeline from "@/components/order/OrderTimeline";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useOrderItems } from "@/hooks/useOrderItems";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/auth/AuthProvider";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { signOut } = useAuth();
  const updateOrderStatus = useUpdateOrderStatus();

  // Enable real-time notifications
  useRealtimeNotifications();

  const handleLogout = async () => {
    await signOut();
  };

  const order = orders?.find(o => o.id === id);
  const { data: orderItems = [] } = useOrderItems(id);
  const isAdmin = profile?.role === 'admin';

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
      <Badge className={`text-lg px-4 py-2 ${colors[status as keyof typeof colors] || colors.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const handleStatusChange = (newStatus: string) => {
    if (!order) return;
    updateOrderStatus.mutate({ id: order.id, status: newStatus });
  };

  if (ordersLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="fixed top-0 left-0 h-full z-40">
          <Sidebar />
        </div>
        
        <div className="flex-1 flex flex-col ml-48">
          {/* Header */}
          <header className="bg-slate-800 border-b border-slate-700 h-16 flex sticky top-0 z-10">
            <div className="flex-1 flex items-center justify-between px-6">
              <div></div> {/* Espaço para balancear com a sidebar */}
              <div className="flex items-center gap-4">
                <NotificationDropdown />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-slate-700">
                      <User className="w-5 h-5" />
                      <div className="text-left">
                        <div className="text-sm font-medium">Olá, {profile?.name || 'Usuário'}!</div>
                        <div className="text-xs text-slate-300">
                          SB Prótese Odontológica - {profile?.role === 'admin' ? 'Filial Zone Sul' : 'Dentista'}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate("/perfil")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            <div className="container mx-auto max-w-4xl space-y-6">
              <Skeleton className="h-8 w-64" />
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="fixed top-0 left-0 h-full z-40">
          <Sidebar />
        </div>
        
        <div className="flex-1 flex flex-col ml-48">
          {/* Header */}
          <header className="bg-slate-800 border-b border-slate-700 h-16 flex sticky top-0 z-10">
            <div className="flex-1 flex items-center justify-between px-6">
              <div></div> {/* Espaço para balancear com a sidebar */}
              <div className="flex items-center gap-4">
                <NotificationDropdown />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-slate-700">
                      <User className="w-5 h-5" />
                      <div className="text-left">
                        <div className="text-sm font-medium">Olá, {profile?.name || 'Usuário'}!</div>
                        <div className="text-xs text-slate-300">
                          SB Prótese Odontológica - {profile?.role === 'admin' ? 'Filial Zone Sul' : 'Dentista'}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate("/perfil")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            <div className="container mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Pedido não encontrado</h1>
              <Button onClick={() => navigate("/")}>
                Voltar ao Dashboard
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="fixed top-0 left-0 h-full z-40">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col ml-48">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex sticky top-0 z-10">
          <div className="flex-1 flex items-center justify-between px-6">
            <div></div> {/* Espaço para balancear com a sidebar */}
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-slate-700">
                    <User className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Olá, {profile?.name || 'Usuário'}!</div>
                      <div className="text-xs text-slate-300">
                        SB Prótese Odontológica - {profile?.role === 'admin' ? 'Filial Zone Sul' : 'Dentista'}
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/perfil")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" onClick={() => navigate("/")}>
                ← Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Pedido #{order.id.slice(-8)}
                </h1>
                <p className="text-muted-foreground">
                  Criado em {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status e Ações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Status do Pedido
                {getStatusBadge(order.status)}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Linha do Tempo */}
          <OrderTimeline orderId={order.id} />

          {/* Dados do Paciente */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">{order.patients?.nome_completo}</p>
                  <p className="text-sm text-muted-foreground">CPF: {order.patients?.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tel: {order.patients?.telefone_contato}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: {order.patients?.email_contato}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dentista</p>
                    <p>{order.dentist}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Prioridade</p>
                    <Badge variant="outline">{order.priority}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Prazo</p>
                    <p>{format(new Date(order.deadline), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {order.delivery_address && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Endereço de Entrega</p>
                      <p className="text-sm">{order.delivery_address}</p>
                    </div>
                  )}
                  {order.observations && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Observações Gerais</p>
                      <p className="text-sm bg-muted p-3 rounded-lg">{order.observations}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Produtos do Pedido */}
          {orderItems.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Produtos do Pedido ({orderItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {orderItems.map((item, index) => (
                    <div key={item.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{item.product_name}</h4>
                          <p className="text-muted-foreground">{item.prosthesis_type}</p>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {item.material && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Material</p>
                            <p className="text-sm">{item.material}</p>
                          </div>
                        )}
                        {item.color && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Cor</p>
                            <p className="text-sm">{item.color}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Quantidade</p>
                          <p className="text-sm">{item.quantity}</p>
                        </div>
                      </div>

                      {item.selected_teeth.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Dentes Selecionados</p>
                          <div className="flex flex-wrap gap-2">
                            {item.selected_teeth.map((tooth) => (
                              <Badge key={tooth} variant="secondary" className="text-xs">
                                {tooth}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.observations && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Observações do Produto</p>
                          <p className="text-sm bg-muted p-3 rounded-lg">{item.observations}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            // Fallback para pedidos antigos sem produtos separados
            order.prosthesis_type !== 'multiplos' && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Serviço</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tipo de Prótese</p>
                        <p>{order.prosthesis_type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Material</p>
                        <p>{order.material || 'Não especificado'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Cor</p>
                        <p>{order.color || 'Não especificado'}</p>
                      </div>
                    </div>
                  </div>

                  {order.selected_teeth.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Dentes Selecionados
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {order.selected_teeth.map((tooth) => (
                          <Badge key={tooth} variant="secondary">
                            {tooth}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )}

          {/* Imagens do Pedido */}
          {order.order_images && order.order_images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Documentação Visual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {order.order_images.map((image) => (
                    <Dialog key={image.id}>
                      <DialogTrigger asChild>
                        <div className="relative cursor-pointer group">
                          <img
                            src={`${supabase.storage.from('order-images').getPublicUrl(image.image_url).data.publicUrl}`}
                            alt="Imagem do pedido"
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-medium">Ver detalhes</span>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>Imagem do Pedido</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <img
                            src={`${supabase.storage.from('order-images').getPublicUrl(image.image_url).data.publicUrl}`}
                            alt="Imagem do pedido"
                            className="w-full max-h-96 object-contain rounded-lg"
                          />
                          {image.annotations && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Anotações:</h4>
                              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                                {JSON.stringify(image.annotations, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderDetails;