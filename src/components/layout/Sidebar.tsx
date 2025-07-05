import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, Users, UserCheck, Building2, Calendar } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: LayoutGrid,
      label: "Gerenciar pedidos",
      path: "/",
      active: location.pathname === "/"
    },
    {
      icon: Users,
      label: "Dentistas",
      path: "/dentistas",
      active: location.pathname === "/dentistas"
    },
    {
      icon: UserCheck,
      label: "Pacientes",
      path: "/pacientes",
      active: location.pathname === "/pacientes"
    },
    {
      icon: Building2,
      label: "Filiais",
      path: "/filiais",
      active: location.pathname === "/filiais"
    },
    {
      icon: Calendar,
      label: "Agenda",
      path: "/agenda",
      active: location.pathname === "/agenda"
    }
  ];

  return (
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">SB</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">SB</h1>
            <p className="text-sm text-sidebar-foreground/60">PRÓTESE ODONTOLÓGICA</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={item.active ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 ${
                  item.active 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;