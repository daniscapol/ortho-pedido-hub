import Header from "@/components/layout/Header";
import StatusCard from "@/components/dashboard/StatusCard";
import OrdersTable from "@/components/dashboard/OrdersTable";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral dos pedidos e atividades</p>
          </div>
          <div className="flex gap-2">
            <Button size="lg" onClick={() => window.location.href = '/novo-pedido'}>
              + Novo Pedido Rápido
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = '/novo-pedido-avancado'}>
              📋 Pedido Completo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard
            title="Pedidos Pendentes"
            status="pendente"
            color="yellow"
            icon="⏳"
          />
          <StatusCard
            title="Em Produção"
            status="producao"
            color="blue"
            icon="⚙️"
          />
          <StatusCard
            title="Prontos"
            status="pronto"
            color="green"
            icon="✅"
          />
          <StatusCard
            title="Entregues"
            status="entregue"
            color="red"
            icon="📦"
          />
        </div>

        <OrdersTable />
      </main>
    </div>
  );
};

export default Dashboard;