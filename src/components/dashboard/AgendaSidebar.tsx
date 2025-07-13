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
    <Card className="w-full h-fit shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <CalendarDays className="w-6 h-6 text-primary" />
            Agenda Semanal
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className="hover:bg-primary/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="hover:bg-primary/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          {format(weekStart, "MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6 pb-8">
        <div className="grid grid-cols-7 gap-2 mb-6">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName) => (
            <div key={dayName} className="text-center text-sm font-semibold text-muted-foreground py-3 bg-muted/30 rounded-lg">
              {dayName}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayOrders = getOrdersForDate(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <div key={day.toISOString()} className="min-h-[150px] border border-border rounded-xl p-4 space-y-3 bg-background hover:shadow-md transition-all duration-200">
                <div className="text-center">
                  <span className={`text-base font-bold ${isToday ? 'text-white bg-primary px-3 py-1.5 rounded-full shadow-sm' : 'text-foreground'}`}>
                    {format(day, "d")}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {dayOrders.slice(0, 2).map((order) => (
                    <div key={order.id} className="text-xs bg-muted/50 rounded-lg p-2 hover:bg-muted/70 transition-colors">
                      <div className="truncate text-foreground font-medium mb-1">
                        {order.patients?.name}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(order.status)} w-full justify-center`}
                      >
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  ))}
                  {dayOrders.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center bg-muted/30 rounded-lg py-2 font-medium">
                      +{dayOrders.length - 2} mais
                    </div>
                  )}
                  {dayOrders.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      Sem agendamentos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgendaSidebar;