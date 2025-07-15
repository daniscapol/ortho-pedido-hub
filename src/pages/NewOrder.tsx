import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import NewOrderForm from "@/components/forms/NewOrderForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NewOrder = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col ml-64">
        <div className="fixed top-0 right-0 left-64 z-40">
          <Header />
        </div>
        
        <main className="flex-1 p-6 pt-20">
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
  );
};

export default NewOrder;