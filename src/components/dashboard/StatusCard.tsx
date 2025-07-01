import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusCardProps {
  title: string;
  count: number;
  color: "blue" | "yellow" | "green" | "red";
  icon: string;
}

const StatusCard = ({ title, count, color, icon }: StatusCardProps) => {
  const colorClasses = {
    blue: "bg-primary text-primary-foreground",
    yellow: "bg-warning text-warning-foreground", 
    green: "bg-success text-success-foreground",
    red: "bg-destructive text-destructive-foreground"
  };

  return (
    <Card>
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
      </CardContent>
    </Card>
  );
};

export default StatusCard;