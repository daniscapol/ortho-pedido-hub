import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from './AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (isSignUp) {
      const { error } = await signUp(email, password)
      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message === "User already registered" 
            ? "Este email já está cadastrado"
            : "Erro ao criar conta. Tente novamente.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Conta criada!",
          description: "Sua conta foi criada com sucesso. Faça login para continuar.",
        })
        setIsSignUp(false)
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message === "Invalid login credentials" 
            ? "Email ou senha incorretos"
            : "Erro ao fazer login. Tente novamente.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login realizado",
          description: "Bem-vindo ao Sistema SB Prótese!",
        })
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sistema SB Prótese
          </CardTitle>
          <CardDescription>
            {isSignUp ? "Crie sua conta para acessar o sistema" : "Entre com sua conta para acessar o sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (isSignUp ? "Criando conta..." : "Entrando...") : (isSignUp ? "Criar Conta" : "Entrar")}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isLoading}
            >
              {isSignUp ? "Já tem uma conta? Faça login" : "Não tem conta? Cadastre-se"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm