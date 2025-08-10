import Sidebar from "@/components/layout/Sidebar";
import NewOrderForm from "@/components/forms/NewOrderForm";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { User, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

const NewOrder = () => {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { signOut } = useAuth();
  
  // Enable real-time notifications
  useRealtimeNotifications();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex sticky top-0 z-10">
          {/* Main header content - now full width and centered */}
          <div className="flex-1 flex items-center justify-end px-6">
            
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-slate-700">
                    <User className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Olá, {profile?.name || 'Usuário'}!</div>
                      <div className="text-xs text-slate-300">
                        SB Prótese Odontológica - {profile?.role === 'admin' ? 'Matriz Zone Sul' : 'Dentista'}
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

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  ← Voltar
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Novo Pedido</h1>
                  <p className="text-muted-foreground">Preencha as informações para criar um novo pedido de prótese</p>
                </div>
              </div>

              <NewOrderForm />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;