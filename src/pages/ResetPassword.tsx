import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Capturar todos os parâmetros da URL incluindo fragmentos
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    // Combinar parâmetros de query e hash
    const allParams: Record<string, string> = {};
    params.forEach((value, key) => allParams[key] = value);
    hashParams.forEach((value, key) => allParams[key] = value);
    
    console.log('All URL parameters:', allParams);
    console.log('Current URL:', window.location.href);
    
    const accessToken = allParams.access_token || searchParams.get('access_token');
    const refreshToken = allParams.refresh_token || searchParams.get('refresh_token');
    const type = allParams.type || searchParams.get('type');
    const error = allParams.error || searchParams.get('error');
    const errorDescription = allParams.error_description || searchParams.get('error_description');
    
    console.log('Extracted tokens:', {
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      type,
      error,
      errorDescription
    });

    // Se há um erro nos parâmetros da URL
    if (error) {
      console.log('Error in URL params:', error, errorDescription);
      toast({
        title: "Link inválido",
        description: errorDescription || "Este link de recuperação é inválido ou expirou.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    // Para recuperação de senha, verificamos se temos os tokens
    if (!accessToken || !refreshToken) {
      console.log('Missing tokens for password recovery');
      toast({
        title: "Link inválido", 
        description: "Este link de recuperação é inválido ou expirou.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Configurar a sessão com os tokens recebidos
    console.log('Setting session with tokens...');
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    }).then(({ data, error }) => {
      console.log('Set session result:', { data, error });
      if (error) {
        console.error('Error setting session:', error);
        toast({
          title: "Link inválido",
          description: "Este link de recuperação é inválido ou expirou.",
          variant: "destructive",
        });
        navigate("/");
      } else {
        console.log('Session set successfully for password recovery');
        toast({
          title: "Link válido",
          description: "Agora você pode definir uma nova senha.",
          variant: "default",
        });
      }
    });
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A confirmação da senha deve ser igual à nova senha.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "Senha alterada com sucesso! 🎉",
        description: "Sua senha foi redefinida. Você será redirecionado para o login.",
      });

      // Fazer logout e redirecionar para login
      await supabase.auth.signOut();
      
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao redefinir senha. Tente novamente.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nova Senha
          </CardTitle>
          <CardDescription>
            Digite sua nova senha para o Sistema SB Prótese
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>• A senha deve ter pelo menos 6 caracteres</p>
              <p>• Use uma combinação de letras, números e símbolos</p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Alterando senha..." : "Redefinir Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;