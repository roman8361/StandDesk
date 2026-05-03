import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">О нас</h1>
          <Card>
            <CardContent className="pt-6 space-y-4 text-lg leading-8 text-muted-foreground">
              <p>
                «Конторки» — это удобный сервис для учителей, которые хотят быстро и аккуратно вести
                информацию об учениках, классах и рассадке.
              </p>
              <p>
                Мы делаем простой и понятный инструмент, который экономит время, помогает держать
                данные в порядке и делает работу с классом спокойнее и удобнее.
              </p>
              <p>
                Наша цель — чтобы у учителя всё нужное было под рукой: логины, классы, карточки
                учеников и актуальная информация в одном месте.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}