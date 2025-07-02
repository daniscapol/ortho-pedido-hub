import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnalyticsData {
  ordersOverTime: Array<{ date: string; count: number }>;
  statusDistribution: Array<{ status: string; count: number; color: string }>;
  prosthesisTypes: Array<{ type: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
  monthlyRevenue: Array<{ month: string; orders: number }>;
}

const chartConfig = {
  count: {
    label: "Pedidos",
    color: "hsl(var(--primary))",
  },
  orders: {
    label: "Pedidos",
    color: "hsl(var(--primary))",
  },
};

const statusColors = {
  pending: "#f59e0b",
  producao: "#3b82f6", 
  pronto: "#10b981",
  entregue: "#6b7280"
};

export const AnalyticsSection = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics-data'],
    queryFn: async (): Promise<AnalyticsData> => {
      // Buscar todos os pedidos
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Pedidos ao longo do tempo (últimos 30 dias)
      const endDate = new Date();
      const startDate = subDays(endDate, 29);
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      const ordersOverTime = dateRange.map(date => {
        const dayOrders = orders.filter(order => 
          format(new Date(order.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        return {
          date: format(date, 'dd/MM', { locale: ptBR }),
          count: dayOrders.length
        };
      });

      // Distribuição por status
      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusLabels = {
        pending: "Pendente",
        producao: "Produção", 
        pronto: "Pronto",
        entregue: "Entregue"
      };

      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status: statusLabels[status as keyof typeof statusLabels] || status,
        count: count as number,
        color: statusColors[status as keyof typeof statusColors] || "#64748b"
      }));

      // Tipos de próteses mais pedidas
      const prosthesisCounts = orders.reduce((acc, order) => {
        acc[order.prosthesis_type] = (acc[order.prosthesis_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const prosthesisTypes = Object.entries(prosthesisCounts)
        .map(([type, count]) => ({ type, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Distribuição por prioridade
      const priorityCounts = orders.reduce((acc, order) => {
        acc[order.priority] = (acc[order.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count: count as number
      }));

      // Pedidos por mês (últimos 6 meses)
      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const date = subDays(new Date(), i * 30);
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === date.getMonth() && 
                 orderDate.getFullYear() === date.getFullYear();
        });
        
        return {
          month: format(date, 'MMM', { locale: ptBR }),
          orders: monthOrders.length
        };
      }).reverse();

      return {
        ordersOverTime,
        statusDistribution,
        prosthesisTypes,
        priorityDistribution,
        monthlyRevenue
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos ao Longo do Tempo */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pedidos dos Últimos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <LineChart data={analytics.ordersOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tipos de Próteses Mais Pedidas */}
        <Card>
          <CardHeader>
            <CardTitle>Próteses Mais Pedidas</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={analytics.prosthesisTypes} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  dataKey="type" 
                  type="category" 
                  tick={{ fontSize: 10 }} 
                  width={80}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Prioridade */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={analytics.priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="priority" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pedidos por Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orders" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};