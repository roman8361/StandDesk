import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useListClasses, getListClassesQueryKey, useDeleteClass } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Trash2, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: classes, isLoading } = useListClasses();
  const deleteClass = useDeleteClass();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Удалить этот класс?")) {
      deleteClass.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListClassesQueryKey() });
            toast({ title: "Класс удален" });
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Мои классы</h1>
          <Link href="/classes/new">
            <Button>Создать класс</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-[180px]">
                <CardHeader>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : !classes || classes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-border shadow-sm">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">У вас пока нет классов</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Создайте свой первый класс, чтобы начать добавлять учеников и отслеживать их данные для рассадки.
            </p>
            <Link href="/classes/new">
              <Button>Создать класс</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Link key={cls.id} href={`/classes/${cls.id}`}>
                <Card className="hover-elevate cursor-pointer h-full transition-all border-border shadow-sm hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-2xl text-primary">{cls.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive -mt-2 -mr-2"
                        onClick={(e) => handleDelete(e, cls.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      {cls.studentCount} {cls.studentCount % 10 === 1 && cls.studentCount % 100 !== 11 ? 'ученик' : 
                                        [2,3,4].includes(cls.studentCount % 10) && ![12,13,14].includes(cls.studentCount % 100) ? 'ученика' : 'учеников'}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="text-xs text-muted-foreground border-t border-border pt-4 mt-auto">
                    Обновлено: {format(new Date(cls.updatedAt), "d MMMM yyyy", { locale: ru })}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}