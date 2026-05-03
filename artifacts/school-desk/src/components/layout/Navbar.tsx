import { Link, useLocation } from "wouter";
import { Show, useClerk } from "@clerk/react";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const { data: user } = useGetMe({ query: { retry: false } });

  return (
    <header className="border-b border-border bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="h-8 w-8" />
          <span className="font-bold text-xl text-primary tracking-tight">Конторки</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Show when="signed-in">
            {user?.role === "admin" ? (
              <Link href="/admin">
                <Button variant="ghost" className="text-foreground">Панель управления</Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button variant="ghost" className="text-foreground">Мои классы</Button>
              </Link>
            )}
            <div className="h-4 w-px bg-border mx-2"></div>
            <span className="text-sm font-medium text-muted-foreground mr-2">{user?.name}</span>
            <Button variant="outline" onClick={() => signOut(() => setLocation("/"))}>
              Выйти
            </Button>
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Зарегистрироваться</Button>
            </Link>
          </Show>
        </nav>
      </div>
    </header>
  );
}