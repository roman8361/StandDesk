import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useGetAdminStats, useListClasses, useListTeachers } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
type TeacherRow = {
  id: number;
  username: string;
  name: string;
  email: string;
  createdAt: string;
};

async function readErrorMessage(res: Response, fallback: string) {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = await res.json().catch(() => null);
    if (data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string") {
      return (data as { error: string }).error;
    }
  }
  const text = await res.text().catch(() => "");
  return text ? fallback : fallback;
}

export default function AdminDashboard() {
  const { apiFetch } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: classes, isLoading: classesLoading } = useListClasses();
  const { data: teachers, isLoading: teachersLoading, refetch } = useListTeachers();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ username: "", password: "", name: "", email: "" });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ username: "", password: "", name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, res.status === 401 ? "Сессия недоступна. Перезайдите как admin." : "Ошибка создания учителя"));
      }
      setForm({ username: "", password: "", name: "", email: "" });
      await Promise.all([refetch(), queryClient.invalidateQueries({ queryKey: ["/api/admin/teachers"] })]);
      toast({ title: "Учитель создан" });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Ошибка создания учителя", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id: number) => {
    if (!confirm("Удалить этого учителя?")) return;
    try {
      const res = await apiFetch(`/api/admin/teachers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, res.status === 401 ? "Сессия недоступна. Перезайдите как admin." : "Ошибка удаления учителя"));
      }
      await Promise.all([refetch(), queryClient.invalidateQueries({ queryKey: ["/api/admin/teachers"] })]);
      toast({ title: "Учитель удалён" });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Ошибка удаления учителя", variant: "destructive" });
    }
  };

  const startEditTeacher = (teacher: TeacherRow) => {
    setEditId(teacher.id);
    setEditForm({ username: teacher.username, password: "", name: teacher.name, email: teacher.email });
  };

  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/admin/teachers/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, res.status === 401 ? "Сессия недоступна. Перезайдите как admin." : "Ошибка редактирования учителя"));
      }
      setEditId(null);
      setEditForm({ username: "", password: "", name: "", email: "" });
      await Promise.all([refetch(), queryClient.invalidateQueries({ queryKey: ["/api/admin/teachers"] })]);
      toast({ title: "Учитель обновлён" });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Ошибка редактирования учителя", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Панель администратора</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Всего учителей</CardTitle>
            </CardHeader>
            <CardContent>{statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{stats?.totalTeachers}</div>}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Всего классов</CardTitle>
            </CardHeader>
            <CardContent>{statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{stats?.totalClasses}</div>}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Всего учеников</CardTitle>
            </CardHeader>
            <CardContent>{statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{stats?.totalStudents}</div>}</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Создать учётку учителя</CardTitle>
            <CardDescription>Добавьте логин, пароль и имя. Email необязателен.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateTeacher}>
              <Input placeholder="Логин" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              <Input placeholder="Пароль" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <Input placeholder="Имя" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={submitting}>{submitting ? "Создание..." : "Создать учителя"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {editId !== null && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Редактировать учителя</CardTitle>
              <CardDescription>Можно изменить логин, имя, email и пароль. Пароль оставьте пустым, если менять не нужно.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleEditTeacher}>
                <Input placeholder="Логин" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
                <Input placeholder="Новый пароль" type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                <Input placeholder="Имя" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                <Input placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditId(null)} disabled={submitting}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Сохранение..." : "Сохранить"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Учителя</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Логин</TableHead>
                    <TableHead>Регистрация</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachersLoading ? Array(3).fill(0).map((_, i) => <TableRow key={i}><TableCell><Skeleton className="h-4 w-24" /></TableCell><TableCell><Skeleton className="h-4 w-32" /></TableCell><TableCell><Skeleton className="h-4 w-24" /></TableCell><TableCell /></TableRow>) : (teachers as TeacherRow[] | undefined)?.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-4">Нет учителей</TableCell></TableRow> : (teachers as TeacherRow[] | undefined)?.map((t) => <TableRow key={t.id}><TableCell className="font-medium">{t.name}</TableCell><TableCell>{t.username}</TableCell><TableCell>{format(new Date(t.createdAt), "dd.MM.yyyy")}</TableCell><TableCell className="text-right space-x-2"><Button variant="ghost" size="sm" onClick={() => startEditTeacher(t)}>Редактировать</Button><Button variant="ghost" size="icon" onClick={() => handleDeleteTeacher(t.id)}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>)}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Классы</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Учитель</TableHead>
                    <TableHead>Учеников</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classesLoading ? Array(3).fill(0).map((_, i) => <TableRow key={i}><TableCell><Skeleton className="h-4 w-12" /></TableCell><TableCell><Skeleton className="h-4 w-24" /></TableCell><TableCell><Skeleton className="h-4 w-8" /></TableCell></TableRow>) : classes?.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-4">Нет классов</TableCell></TableRow> : classes?.map((c) => <TableRow key={c.id}><TableCell><Link href={`/classes/${c.id}`} className="text-primary hover:underline font-medium">{c.name}</Link></TableCell><TableCell>{c.teacherName || "—"}</TableCell><TableCell>{c.studentCount}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
