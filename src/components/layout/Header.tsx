import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Shield } from "lucide-react";

const Header = () => {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">SB</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">SB Prótese</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {profile?.role === 'admin' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/admin")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  {profile?.name || 'Usuário'}
                  {profile?.role && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {profile.role === 'admin' ? 'Admin' : 'Dentista'}
                    </Badge>
                  )}
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
      </div>
    </header>
  );
};

export default Header;