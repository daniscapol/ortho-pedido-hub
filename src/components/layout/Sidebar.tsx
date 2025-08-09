import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Users, Building2, Building, Calendar, Phone, Shield } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { usePermissions } from "@/hooks/usePermissions";

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
  const { data: profile } = useProfile();
  const { canAccess } = usePermissions();

  const allMenuItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/",
      active: location.pathname === "/",
      permission: "home"
    },
    {
      icon: LayoutGrid,
      label: "Pedidos",
      path: "/pedidos",
      active: location.pathname === "/pedidos",
      permission: "pedidos"
    },
    {
      icon: ToothIcon,
      label: "Pacientes",
      path: "/pacientes",
      active: location.pathname === "/pacientes",
      permission: "pacientes"
    },
    {
      icon: Users,
      label: "Dentistas",
      path: "/dentistas",
      active: location.pathname === "/dentistas",
      permission: "dentistas"
    },
    {
      icon: Building,
      label: "Clínicas",
      path: "/clinicas",
      active: location.pathname === "/clinicas",
      permission: "clinicas"
    },
    {
      icon: Building2,
      label: "Filiais",
      path: "/filiais",
      active: location.pathname === "/filiais",
      permission: "filiais"
    },
    {
      icon: Calendar,
      label: "Agenda",
      path: "/agenda",
      active: location.pathname === "/agenda",
      permission: "agenda"
    },
    {
      icon: Phone,
      label: "Contato",
      path: "/contato",
      active: location.pathname === "/contato",
      permission: "contato"
    }
  ];

  // Filter menu items based on user permissions
  const menuItems = allMenuItems.filter(item => canAccess(item.permission));

  return (
    <aside className="w-48 bg-slate-800 border-r border-slate-700 h-screen">
      <div className="p-4 pt-6">
        {/* Logo clicável no topo do sidebar */}
        <div 
          className="flex items-center space-x-2 mb-6 cursor-pointer hover:bg-slate-700 p-2 rounded-lg transition-colors"
          onClick={() => navigate("/")}
        >
          <img 
            src="/lovable-uploads/956eb550-8153-4346-818f-2025375f1a50.png" 
            alt="SB Odontologia Especializada" 
            className="w-8 h-8 object-contain rounded-lg"
          />
          <div>
            <h1 className="text-sm font-semibold text-white">SB Odontologia</h1>
            <p className="text-xs text-slate-300">ESPECIALIZADA</p>
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

        {/* Admin Button - só aparece para super admin */}
        {canAccess("admin") && (
          <div className="mt-6 pt-4 border-t border-slate-600">
            <Button
              variant={location.pathname === "/admin" ? "secondary" : "ghost"}
              className={`w-full justify-start h-10 text-sm ${
                location.pathname === "/admin"
                  ? "bg-orange-600 text-white font-medium hover:bg-orange-700" 
                  : "text-orange-300 hover:bg-orange-600/20 hover:text-orange-200"
              }`}
              onClick={() => navigate("/admin")}
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>
        )}

      </div>
    </aside>
  );
};

export default Sidebar;