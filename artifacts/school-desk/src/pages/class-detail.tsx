import { useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useGetClass, getGetClassQueryKey, useListStudents, getListStudentsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, UserRound } from "lucide-react";

export default function ClassDetail() {
  const params = useParams();
  const id = Number(params.id);
  const [sortBy, setSortBy] = useState("name-asc");

  const { data: classData, isLoading: classLoading } = useGetClass(id, { query: { enabled: !!id, queryKey: getGetClassQueryKey(id) } });
  const { data: students, isLoading: studentsLoading } = useListStudents(id, { query: { enabled: !!id, queryKey: getListStudentsQueryKey(id) } });
  const sortedStudents = useMemo(() => {
    if (!students) return [];
    return [...students].sort((a, b) => {
      switch (sortBy) {
        case "name-desc":
          return b.fullName.localeCompare(a.fullName, "ru");
        case "age-asc":
          return (a.age ?? Number.MAX_SAFE_INTEGER) - (b.age ?? Number.MAX_SAFE_INTEGER);
        case "age-desc":
          return (b.age ?? -1) - (a.age ?? -1);
        case "height-asc":
          return (a.height ?? Number.MAX_SAFE_INTEGER) - (b.height ?? Number.MAX_SAFE_INTEGER);
        case "height-desc":
          return (b.height ?? -1) - (a.height ?? -1);
        case "name-asc":
        default:
          return a.fullName.localeCompare(b.fullName, "ru");
      }
    });
  }, [students, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Назад к классам
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {classLoading ? (
                <Skeleton className="h-10 w-32 mb-2" />
              ) : (
                <h1 className="text-3xl font-bold tracking-tight">Класс {classData?.name}</h1>
              )}
              {classLoading ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <p className="text-muted-foreground">Учеников: {classData?.studentCount}</p>
              )}
            </div>
            <div className="w-full sm:w-[260px]">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Сортировка</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name-asc">По ФИО: А → Я</option>
                <option value="name-desc">По ФИО: Я → А</option>
                <option value="age-asc">По возрасту: по возрастанию</option>
                <option value="age-desc">По возрасту: по убыванию</option>
                <option value="height-asc">По росту: по возрастанию</option>
                <option value="height-desc">По росту: по убыванию</option>
              </select>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">ФИО</TableHead>
                <TableHead>Возраст</TableHead>
                <TableHead>Рост (см)</TableHead>
                <TableHead>Вес (кг)</TableHead>
                <TableHead>Зрение</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : !students || students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Нет учеников
                  </TableCell>
                </TableRow>
              ) : (
                sortedStudents.map((student) => (
                  <TableRow key={student.id} className="group">
                    <TableCell className="font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <UserRound className="w-4 h-4" />
                      </div>
                      {student.fullName}
                    </TableCell>
                    <TableCell>{student.age || "—"}</TableCell>
                    <TableCell>{student.height || "—"}</TableCell>
                    <TableCell>{student.weight || "—"}</TableCell>
                    <TableCell>{student.vision || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/students/${student.id}`}>
                        <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          Редактировать
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
}