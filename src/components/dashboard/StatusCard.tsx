import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrders } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusCardProps {
  title: string;
  status: string;
  color: "blue" | "yellow" | "green" | "red";
  icon: string;
}

const StatusCard = ({ title, status, color, icon }: StatusCardProps) => {
  const { data: orders, isLoading } = useOrders();
  
  const count = orders ? orders.filter(order => order.status === status).length : 0;
  
  const colorClasses = {
    blue: "bg-primary text-primary-foreground",
    yellow: "bg-warning text-warning-foreground", 
    green: "bg-success text-success-foreground",
    red: "bg-destructive text-destructive-foreground"
  };

  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-12 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <span className="text-sm font-semibold">{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{count}</div>
        <p className="text-xs text-muted-foreground">
          Total de pedidos
        </p>
      </CardContent>
    </Card>
  );
};

export default StatusCard;