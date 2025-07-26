import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Users, Building2, Calendar, Phone, Shield, Package } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

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

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile } = useProfile();
  const { state } = useSidebar();
  
  const collapsed = state === "collapsed";

  const mainMenuItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
    },
    {
      icon: LayoutGrid,
      label: "Pedidos",
      path: "/pedidos",
    },
    {
      icon: Users,
      label: "Dentistas",
      path: "/dentistas",
    },
    {
      icon: ToothIcon,
      label: "Pacientes",
      path: "/pacientes",
    },
    {
      icon: Building2,
      label: "Filiais",
      path: "/filiais",
    },
    {
      icon: Calendar,
      label: "Agenda",
      path: "/agenda",
    },
    {
      icon: Phone,
      label: "Contato",
      path: "/contato",
    }
  ];

  const adminMenuItems = [
    {
      icon: Shield,
      label: "Painel Admin",
      path: "/admin",
    },
    {
      icon: Package,
      label: "Suporte Admin",
      path: "/support-admin",
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50";
  };

  return (
    <Sidebar 
      className={collapsed ? "w-14" : "w-60"} 
      collapsible="icon"
    >
      <SidebarContent>
        {/* Logo */}
        <div className="p-4 border-b">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-sidebar-accent/50 p-2 rounded-lg transition-colors"
            onClick={() => navigate("/")}
          >
            <img 
              src="/lovable-uploads/956eb550-8153-4346-818f-2025375f1a50.png" 
              alt="SB Odontologia Especializada" 
              className="w-8 h-8 object-contain rounded-lg"
            />
            {!collapsed && (
              <div>
                <h1 className="text-sm font-semibold">SB Odontologia</h1>
                <p className="text-xs text-muted-foreground">ESPECIALIZADA</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild
                    className={getNavClassName(item.path)}
                  >
                    <button onClick={() => navigate(item.path)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu Admin - apenas para administradores */}
        {profile?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild
                      className={getNavClassName(item.path)}
                    >
                      <button onClick={() => navigate(item.path)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};