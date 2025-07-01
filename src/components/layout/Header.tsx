import { Button } from "@/components/ui/button";

const Header = () => {
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
            <Button variant="outline" size="sm">
              Perfil
            </Button>
            <Button variant="outline" size="sm">
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;