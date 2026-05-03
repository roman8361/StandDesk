import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { BookOpen, FileText, Paperclip, Trash2, Upload, Plus, X } from "lucide-react";

type Material = {
  id: number;
  title: string;
  content: string | null;
  fileName: string | null;
  filePath: string | null;
  fileSize: number | null;
  fileType: string | null;
  createdById: number;
  createdAt: string;
  authorName: string | null;
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export default function MaterialsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: materials, isLoading } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
    queryFn: async () => {
      const res = await fetch("/api/materials", { credentials: "include" });
      if (!res.ok) throw new Error("Ошибка загрузки материалов");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/materials/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Ошибка удаления");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      toast({ title: "Материал удалён" });
    },
    onError: () => toast({ title: "Ошибка удаления", variant: "destructive" }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Введите заголовок", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      if (file) formData.append("file", file);

      const res = await fetch("/api/materials", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Ошибка создания");
      }
      setTitle("");
      setContent("");
      setFile(null);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      toast({ title: "Материал добавлен" });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Ошибка", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Методические материалы</h1>
            <p className="text-muted-foreground mt-1">Учебные материалы и документы для учителей</p>
          </div>
          {user?.role === "admin" && (
            <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
              {showForm ? <><X className="w-4 h-4 mr-2" />Отмена</> : <><Plus className="w-4 h-4 mr-2" />Добавить материал</>}
            </Button>
          )}
        </div>

        {user?.role === "admin" && showForm && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle>Новый материал</CardTitle>
              <CardDescription>Добавьте текст и при необходимости прикрепите файл</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Заголовок *</label>
                  <Input
                    placeholder="Название материала"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Содержание</label>
                  <textarea
                    className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Текст материала..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Файл (необязательно, до 20 МБ)</label>
                  {file ? (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                      <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setFile(null)} className="h-6 w-6">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 p-3 border-2 border-dashed rounded-md cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Нажмите для выбора файла</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setTitle(""); setContent(""); setFile(null); }}>
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

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-48 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !materials || materials.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-border shadow-sm">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Материалов пока нет</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {user?.role === "admin"
                ? "Добавьте первый методический материал с помощью кнопки выше."
                : "Администратор ещё не добавил методические материалы."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map((m) => (
              <Card key={m.id} className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg leading-tight">{m.title}</CardTitle>
                        <CardDescription className="mt-0.5">
                          {m.authorName} · {format(new Date(m.createdAt), "d MMMM yyyy", { locale: ru })}
                        </CardDescription>
                      </div>
                    </div>
                    {user?.role === "admin" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => {
                          if (confirm("Удалить этот материал?")) deleteMutation.mutate(m.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {(m.content || m.fileName) && (
                  <CardContent className="pt-0 space-y-3">
                    {m.content && (
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    )}
                    {m.fileName && m.filePath && (
                      <a
                        href={`/api/uploads/${m.filePath}`}
                        download={m.fileName}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted/50 hover:bg-muted text-sm transition-colors"
                      >
                        <Paperclip className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-medium text-primary truncate max-w-[300px]">{m.fileName}</span>
                        {m.fileSize && (
                          <span className="text-muted-foreground shrink-0">{formatFileSize(m.fileSize)}</span>
                        )}
                      </a>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
