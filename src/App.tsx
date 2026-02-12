import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import Index from "./pages/Index";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import DonorDashboard from "./pages/dashboard/DonorDashboard";
import ReceiverDashboard from "./pages/dashboard/ReceiverDashboard";
import VolunteerDashboard from "./pages/dashboard/VolunteerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import CreateListing from "./pages/food/CreateListing";
import EditListing from "./pages/food/EditListing";
import FoodDetail from "./pages/food/FoodDetail";
import BrowseFood from "./pages/food/BrowseFood";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ allowedRole, children }: { allowedRole: string; children: React.ReactNode }) {
  const { role, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (role !== allowedRole) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard/donor" element={<ProtectedRoute><RoleRoute allowedRole="donor"><DonorDashboard /></RoleRoute></ProtectedRoute>} />
            <Route path="/dashboard/receiver" element={<ProtectedRoute><RoleRoute allowedRole="receiver"><ReceiverDashboard /></RoleRoute></ProtectedRoute>} />
            <Route path="/dashboard/volunteer" element={<ProtectedRoute><RoleRoute allowedRole="volunteer"><VolunteerDashboard /></RoleRoute></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute><RoleRoute allowedRole="admin"><AdminDashboard /></RoleRoute></ProtectedRoute>} />
            <Route path="/food/create" element={<ProtectedRoute><RoleRoute allowedRole="donor"><CreateListing /></RoleRoute></ProtectedRoute>} />
            <Route path="/food/edit/:id" element={<ProtectedRoute><RoleRoute allowedRole="donor"><EditListing /></RoleRoute></ProtectedRoute>} />
            <Route path="/food/:id" element={<ProtectedRoute><FoodDetail /></ProtectedRoute>} />
            <Route path="/browse" element={<ProtectedRoute><BrowseFood /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
