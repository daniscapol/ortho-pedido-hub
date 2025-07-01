import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  patient: string;
  dentist: string;
  type: string;
  status: "pendente" | "producao" | "pronto" | "entregue";
  date: string;
  deadline: string;
}

const OrdersTable = () => {
  const orders: Order[] = [
    {
      id: "P001",
      patient: "Maria Silva",
      dentist: "Dr. João Santos",
      type: "Coroa Cerâmica",
      status: "producao",
      date: "2024-01-15",
      deadline: "2024-01-22"
    },
    {
      id: "P002", 
      patient: "Carlos Oliveira",
      dentist: "Dra. Ana Costa",
      type: "Prótese Total",
      status: "pendente",
      date: "2024-01-16",
      deadline: "2024-01-25"
    },
    {
      id: "P003",
      patient: "Fernanda Lima",
      dentist: "Dr. Pedro Alves",
      type: "Implante",
      status: "pronto",
      date: "2024-01-10",
      deadline: "2024-01-20"
    }
  ];

  const getStatusBadge = (status: Order["status"]) => {
    const variants = {
      pendente: "secondary",
      producao: "default", 
      pronto: "outline",
      entregue: "outline"
    } as const;

    const colors = {
      pendente: "bg-warning text-warning-foreground",
      producao: "bg-primary text-primary-foreground",
      pronto: "bg-success text-success-foreground", 
      entregue: "bg-muted text-muted-foreground"
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Paciente</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Dentista</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tipo</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Prazo</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border/50">
                  <td className="py-3 px-2 text-sm font-mono text-foreground">{order.id}</td>
                  <td className="py-3 px-2 text-sm text-foreground">{order.patient}</td>
                  <td className="py-3 px-2 text-sm text-foreground">{order.dentist}</td>
                  <td className="py-3 px-2 text-sm text-foreground">{order.type}</td>
                  <td className="py-3 px-2">{getStatusBadge(order.status)}</td>
                  <td className="py-3 px-2 text-sm text-foreground">{order.deadline}</td>
                  <td className="py-3 px-2">
                    <Button variant="outline" size="sm">
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersTable;