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
      <div className="container mx-auto px-4 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Логотип" className="h-8 w-8" />
          <span className="font-bold text-xl text-primary tracking-tight whitespace-nowrap">Конторки</span>
        </Link>
        <nav className="flex flex-1 items-center justify-center gap-1 sm:gap-2">
          <Link href="/about">
            <Button variant="ghost" size="sm" className="text-foreground whitespace-nowrap px-3">
              О нас
            </Button>
          </Link>
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-foreground whitespace-nowrap px-3">
                    Панель управления
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-foreground whitespace-nowrap px-3">
                    Мои классы
                  </Button>
                </Link>
              )}
              <Link href="/materials">
                <Button variant="ghost" size="sm" className="text-foreground whitespace-nowrap px-3">
                  Метод. материалы
                </Button>
              </Link>
            </>
          ) : null}
        </nav>
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <span className="text-sm font-medium text-muted-foreground hidden lg:inline whitespace-nowrap">
                {user.name}
              </span>
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                Выйти
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button data-testid="button-login-nav">Войти</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
