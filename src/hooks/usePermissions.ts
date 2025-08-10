import { useProfile } from "./useProfile";

export type UserRole = "admin_master" | "admin_filial" | "admin_clinica" | "dentist";

interface Permission {
  canAccess: (role?: UserRole) => boolean;
  label: string;
  path: string;
}

const PERMISSIONS: Record<string, Permission> = {
  home: {
    canAccess: () => true,
    label: "Dashboard",
    path: "/"
  },
  pedidos: {
    canAccess: () => true,
    label: "Pedidos", 
    path: "/pedidos"
  },
  pacientes: {
    canAccess: () => true,
    label: "Pacientes",
    path: "/pacientes"
  },
  agenda: {
    canAccess: () => true,
    label: "Agenda",
    path: "/agenda"
  },
  contato: {
    canAccess: () => true,
    label: "Contato",
    path: "/contato"
  },
  dentistas: {
    canAccess: (role) => role !== "dentist",
    label: "Dentistas",
    path: "/dentistas"
  },
  clinicas: {
    canAccess: (role) => role === "admin_master" || role === "admin_filial" || role === "admin_clinica",
    label: "Clínicas",
    path: "/clinicas"
  },
  filiais: {
    canAccess: (role) => role === "admin_master" || role === "admin_filial",
    label: "Matrizes",
    path: "/filiais"
  },
  admin: {
    canAccess: (role) => role === "admin_master",
    label: "Admin",
    path: "/admin"
  },
  supportAdmin: {
    canAccess: (role) => role === "admin_master",
    label: "Suporte Admin",
    path: "/admin/suporte"
  }
};

export const usePermissions = () => {
  const { data: profile } = useProfile();
  const userRole = profile?.role_extended as UserRole;

  const canAccess = (permission: string): boolean => {
    const perm = PERMISSIONS[permission];
    if (!perm) return false;
    return perm.canAccess(userRole);
  };

  const getAccessibleRoutes = () => {
    return Object.entries(PERMISSIONS)
      .filter(([_, perm]) => perm.canAccess(userRole))
      .map(([key, perm]) => ({ key, ...perm }));
  };

  const isAdmin = () => {
    return userRole === "admin_master" || userRole === "admin_filial" || userRole === "admin_clinica";
  };

  const isSuperAdmin = () => {
    return userRole === "admin_master";
  };

  return {
    canAccess,
    getAccessibleRoutes,
    isAdmin,
    isSuperAdmin,
    userRole
  };
};