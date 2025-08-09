import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupportChat } from "@/components/chat/SupportChat";
import { useSupportChat } from "@/hooks/useSupportChat";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";
import Index from "./pages/Index";
import Pedidos from "./pages/Pedidos";
import NewOrder from "./pages/NewOrder";
import NewOrderAdvanced from "./pages/NewOrderAdvanced";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import SupportAdmin from "./pages/SupportAdmin";
import Dentistas from "./pages/Dentistas";
import DentistDetails from "./pages/DentistDetails";
import Patients from "./pages/Patients";
import Agenda from "./pages/Agenda";
import Filiais from "./pages/Filiais";
import Clinicas from "./pages/Clinicas";
import Contato from "./pages/Contato";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { isChatOpen, toggleChat } = useSupportChat();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rota pública para reset de senha */}
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Rotas protegidas */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/pedidos" element={<Pedidos />} />
                    <Route path="/novo-pedido" element={<NewOrder />} />
                    <Route path="/novo-pedido-avancado" element={<NewOrderAdvanced />} />
                    <Route path="/pedido/:id" element={<OrderDetails />} />
                    <Route path="/perfil" element={<Profile />} />
                    <Route path="/admin" element={
                      <RoleProtectedRoute requiredPermission="admin">
                        <Admin />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/admin/suporte" element={
                      <RoleProtectedRoute requiredPermission="supportAdmin">
                        <SupportAdmin />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/dentistas" element={
                      <RoleProtectedRoute requiredPermission="dentistas">
                        <Dentistas />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/dentistas/:id" element={
                      <RoleProtectedRoute requiredPermission="dentistas">
                        <DentistDetails />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/pacientes" element={<Patients />} />
                    <Route path="/agenda" element={<Agenda />} />
                    <Route path="/filiais" element={
                      <RoleProtectedRoute requiredPermission="filiais">
                        <Filiais />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/clinicas" element={
                      <RoleProtectedRoute requiredPermission="clinicas">
                        <Clinicas />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/contato" element={<Contato />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ProtectedRoute>
              } />
            </Routes>
            
            {/* Support Chat - Available globally when authenticated */}
            <ProtectedRoute>
              <SupportChat isOpen={isChatOpen} onToggle={toggleChat} />
            </ProtectedRoute>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
