import { usePermissions } from "@/hooks/usePermissions";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission: string;
  fallback?: React.ReactNode;
}

const RoleProtectedRoute = ({ children, requiredPermission, fallback }: RoleProtectedRouteProps) => {
  const { canAccess, userRole } = usePermissions();

  if (!canAccess(requiredPermission)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-6xl text-muted-foreground">🚫</div>
          <h1 className="text-3xl font-bold text-foreground">Acesso Negado</h1>
          <p className="text-muted-foreground max-w-md">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-muted-foreground">
            Seu perfil atual: <span className="font-medium">{userRole}</span>
          </p>
          <div className="pt-4">
            <button 
              onClick={() => window.history.back()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;