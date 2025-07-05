import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Bell, User, LogOut, Settings, UserCheck, Calendar, Mail, Phone } from "lucide-react";
import { useDentists, Dentist } from "@/hooks/useDentists";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DentistCardProps {
  dentist: Dentist;
  onClick: () => void;
}

const DentistCard = ({ dentist, onClick }: DentistCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{dentist.name || 'Dentista'}</CardTitle>
              <p className="text-sm text-muted-foreground">{dentist.email}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {dentist._count?.orders || 0} pedidos
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{dentist.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Desde {format(new Date(dentist.created_at), "MMM yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Dentistas = () => {
  const { data: dentists, isLoading } = useDentists();
  const { data: profile } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await signOut();
  };

  const handleDentistClick = (dentist: Dentist) => {
    navigate(`/dentistas/${dentist.id}`);
  };

  // Filtrar dentistas baseado na busca
  const filteredDentists = useMemo(() => {
    if (!dentists) return [];
    
    if (searchQuery.trim()) {
      return dentists.filter(dentist => 
        dentist.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dentist.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return dentists;
  }, [dentists, searchQuery]);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex">          
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="flex items-center gap-4 flex-1 max-w-4xl">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Input
                    placeholder="Pesquise um dentista pelo nome ou email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                <Bell className="w-5 h-5" />
              </Button>
              
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

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                Gerenciamento de Dentistas
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {filteredDentists.length} dentista{filteredDentists.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Search and filters section */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" className="text-foreground">
              Lista de Dentistas
            </Button>
          </div>

          {/* Dentists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredDentists.length > 0 ? (
              filteredDentists.map((dentist) => (
                <DentistCard 
                  key={dentist.id} 
                  dentist={dentist} 
                  onClick={() => handleDentistClick(dentist)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery ? 'Nenhum dentista encontrado' : 'Nenhum dentista cadastrado'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Tente ajustar sua pesquisa para encontrar dentistas.' 
                    : 'Quando dentistas se cadastrarem, eles aparecerão aqui.'
                  }
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dentistas;