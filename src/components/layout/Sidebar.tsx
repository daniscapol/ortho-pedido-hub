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
    <aside className="w-48 bg-slate-800 border-r border-slate-700 h-screen">
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

        {/* Seção de Contato */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
            Contato
          </h3>
          
          <div className="space-y-3 text-xs text-slate-300 px-2">
            <div>
              <div>(11) 3862-0951</div>
              <div>(11) 3865-5283</div>
              <div>(11) 97643-4191</div>
              <div className="mt-1">contato@sbodontologiaespecializada.com.br</div>
            </div>
            
            <div className="pt-2">
              <div className="font-medium text-slate-200 mb-1">HORÁRIO DE FUNCIONAMENTO</div>
              <div>Segunda a Sexta das 8:00h às 19:30h</div>
              <div className="text-yellow-400 mt-1">* Atendimento somente com horário agendado</div>
            </div>
            
            <div className="pt-2 text-slate-400">
              <div>SB Odontologia Especializada – CROSP 13802</div>
              <div>Resp. Técnico: Ricardo Barbosa – CROSP 102412</div>
            </div>
            
            {/* Botão WhatsApp */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start mt-3 text-green-400 hover:text-green-300 hover:bg-slate-700"
              onClick={() => window.open('https://api.whatsapp.com/send?phone=5511976434191&text=Ol%C3%A1,%20gostaria%20de%20maiores%20informa%C3%A7%C3%B5es%20sobre%20a%20SB%20Odontologia', '_blank')}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;