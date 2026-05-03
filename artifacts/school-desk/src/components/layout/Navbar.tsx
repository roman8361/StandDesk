import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export function Navbar() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    setLocation("/");
  };

  return (
    <header className="border-b border-border bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Логотип" className="h-8 w-8" />
          <span className="font-bold text-xl text-primary tracking-tight">Конторки</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/about">
            <Button variant="ghost" className="text-foreground">О нас</Button>
          </Link>
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link href="/admin">
                  <Button variant="ghost" className="text-foreground">Панель управления</Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-foreground">Мои классы</Button>
                </Link>
              )}
              <Link href="/materials">
                <Button variant="ghost" className="text-foreground">Метод. материалы</Button>
              </Link>
              <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">{user.name}</span>
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                Выйти
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button data-testid="button-login-nav">Войти</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
