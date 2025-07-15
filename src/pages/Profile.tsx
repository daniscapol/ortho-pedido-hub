import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading, refetch } = useProfile();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: profile?.name || "",
  });

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: editData.name })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso!",
      });

      setIsEditing(false);
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
        <main className="flex-1 p-6 pt-24">
            <div className="container mx-auto max-w-2xl space-y-6">
              <Skeleton className="h-8 w-48" />
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-24" />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" onClick={() => navigate("/")}>
                ← Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
                <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
              </div>
            </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Informações da Conta */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled />
                </div>
                <div>
                  <Label>Tipo de Conta</Label>
                  <div className="pt-2">
                    <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                      {profile?.role === 'admin' ? 'Administrador' : 'Dentista'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Nome</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite seu nome"
                  />
                ) : (
                  <Input value={profile?.name || ""} disabled />
                )}
              </div>

              <div className="flex gap-2 pt-4">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave}>
                      Salvar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({ name: profile?.name || "" });
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Editar Perfil
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas da Conta */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Conta criada em:</p>
                  <p className="font-medium">
                    {profile?.created_at ? 
                      new Date(profile.created_at).toLocaleDateString('pt-BR') : 
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última atualização:</p>
                  <p className="font-medium">
                    {profile?.updated_at ? 
                      new Date(profile.updated_at).toLocaleDateString('pt-BR') : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações da Conta */}
          <Card>
            <CardHeader>
              <CardTitle>Ações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Para alterar sua senha ou excluir sua conta, entre em contato com o administrador do sistema.</p>
              </div>
            </CardContent>
        </Card>
        </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;