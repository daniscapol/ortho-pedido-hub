import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

const AgendaSidebar = () => {
  const { data: orders } = useOrders();
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getOrdersForDate = (date: Date) => {
    if (!orders) return [];
    return orders.filter(order => {
      const orderDate = new Date(order.deadline);
      return format(orderDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "producao":
        return "bg-primary/10 text-primary border-primary/20";
      case "pronto":
        return "bg-success/10 text-success border-success/20";
      case "entregue":
        return "bg-muted/10 text-muted-foreground border-muted/20";
      default:
        return "bg-secondary/10 text-secondary-foreground border-secondary/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "producao":
        return "Em Produção";
      case "pronto":
        return "Pronto";
      case "entregue":
        return "Entregue";
      default:
        return status;
    }
  };

  return (
    <Card className="w-80 h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="w-5 h-5" />
            Agenda
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(weekStart, "MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {days.map((day) => {
          const dayOrders = getOrdersForDate(day);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <div key={day.toISOString()} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {format(day, "EEE", { locale: ptBR })}
                  </span>
                  <span className={`text-lg font-bold ${isToday ? 'text-primary bg-primary/10 px-2 py-1 rounded-full' : 'text-foreground'}`}>
                    {format(day, "d")}
                  </span>
                </div>
                {dayOrders.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {dayOrders.length} caso{dayOrders.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="space-y-1 ml-2">
                {dayOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="text-xs">
                    <div className="font-medium text-foreground truncate">
                      {order.prosthesis_type} | Dr. {order.dentist} | Paciente {order.patients?.name}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs mt-1 ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                ))}
                {dayOrders.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{dayOrders.length - 3} mais...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AgendaSidebar;