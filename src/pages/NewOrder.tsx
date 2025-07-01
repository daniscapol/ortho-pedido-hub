import Header from "@/components/layout/Header";
import NewOrderForm from "@/components/forms/NewOrderForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NewOrder = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
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
      </main>
    </div>
  );
};

export default NewOrder;