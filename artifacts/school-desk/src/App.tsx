import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import Home from "./pages/home";
import AboutPage from "./pages/about";
import LoginPage from "./pages/login";
import Dashboard from "./pages/dashboard";
import AdminDashboard from "./pages/admin";
import CreateClass from "./pages/create-class";
import ClassDetail from "./pages/class-detail";
import StudentDetail from "./pages/student-detail";
import MaterialsPage from "./pages/materials";
import NotFound from "@/pages/not-found";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Загрузка...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {user ? (
          user.role === "admin" ? <Redirect to="/admin" /> : <Redirect to="/dashboard" />
        ) : (
          <Home />
        )}
      </Route>
      <Route path="/about" component={AboutPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard">
        {user ? <Dashboard /> : <Redirect to="/login" />}
      </Route>
      <Route path="/admin">
        {user?.role === "admin" ? <AdminDashboard /> : <Redirect to="/login" />}
      </Route>
      <Route path="/classes/new">
        {user ? <CreateClass /> : <Redirect to="/login" />}
      </Route>
      <Route path="/classes/:id">
        {user ? <ClassDetail /> : <Redirect to="/login" />}
      </Route>
      <Route path="/students/:id">
        {user ? <StudentDetail /> : <Redirect to="/login" />}
      </Route>
      <Route path="/materials">
        {user ? <MaterialsPage /> : <Redirect to="/login" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <AppRoutes />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
