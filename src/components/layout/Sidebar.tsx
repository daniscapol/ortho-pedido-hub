import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, Users, Building2, Calendar } from "lucide-react";

// Ícone customizado de dente
const ToothIcon = ({ className, ...props }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 2C8.5 2 6 4.5 6 8v4c0 2 1 4 2 5s2 2 4 2 3-1 4-2 2-3 2-5V8c0-3.5-2.5-6-6-6z"/>
    <path d="M10 18c0 1.1-.9 2-2 2s-2-.9-2-2"/>
    <path d="M16 18c0 1.1-.9 2-2 2s-2-.9-2-2"/>
  </svg>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: LayoutGrid,
      label: "Pedidos",
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
      icon: ToothIcon,
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
    <aside className="w-56 bg-slate-800 border-r border-slate-700 h-screen flex-shrink-0">
      <div className="p-4 pt-6">
        {/* Logo clicável no topo do sidebar */}
        <div 
          className="flex items-center space-x-2 mb-6 cursor-pointer hover:bg-slate-700 p-2 rounded-lg transition-colors"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-slate-800 font-bold text-sm">SB</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">SB</h1>
            <p className="text-xs text-slate-300">PRÓTESE</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={item.active ? "secondary" : "ghost"}
                className={`w-full justify-start h-10 text-sm ${
                  item.active 
                    ? "bg-slate-700 text-white font-medium" 
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="w-4 h-4 mr-2" />
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