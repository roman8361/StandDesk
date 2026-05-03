import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              Управление <span className="text-primary">учебными местами</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Простой и удобный инструмент для учителей. Управляйте рассадкой учеников за конторками, отслеживайте их параметры и сохраняйте здоровье школьников.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                Войти в систему
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                О нас
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 text-left">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Учёт учеников</h3>
              <p className="text-muted-foreground text-sm">Ведите базу данных роста, веса и зрения каждого ученика для правильной рассадки.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Удобные классы</h3>
              <p className="text-muted-foreground text-sm">Группируйте учеников по классам для быстрого доступа к нужной информации.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Надёжность</h3>
              <p className="text-muted-foreground text-sm">Данные надёжно защищены и доступны вам с любого устройства в любой момент.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
