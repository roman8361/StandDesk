import { useParams, useLocation, Link } from "wouter";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Navbar } from "@/components/layout/Navbar";
import { useGetStudent, getGetStudentQueryKey, useUpdateStudent, getListStudentsQueryKey } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(1, "ФИО обязательно"),
  age: z.coerce.number().nullable().optional(),
  height: z.coerce.number().nullable().optional(),
  weight: z.coerce.number().nullable().optional(),
  vision: z.string().nullable().optional(),
});

export default function StudentDetail() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: student, isLoading } = useGetStudent(id, { query: { enabled: !!id, queryKey: getGetStudentQueryKey(id) } });
  const updateStudent = useUpdateStudent();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      age: null,
      height: null,
      weight: null,
      vision: "",
    },
  });

  const initRef = useRef<number | null>(null);

  useEffect(() => {
    if (student && initRef.current !== student.id) {
      form.reset({
        fullName: student.fullName,
        age: student.age,
        height: student.height,
        weight: student.weight,
        vision: student.vision || "",
      });
      initRef.current = student.id;
    }
  }, [student, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateStudent.mutate(
      {
        id,
        data: values,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetStudentQueryKey(id) });
          if (student?.classId) {
            queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey(student.classId) });
          }
          toast({ title: "Данные сохранены" });
          setLocation(`/classes/${student?.classId}`);
        },
        onError: () => {
          toast({ title: "Ошибка при сохранении", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          {student?.classId ? (
             <Link href={`/classes/${student.classId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
               <ArrowLeft className="w-4 h-4 mr-1" />
               Назад к классу
             </Link>
          ) : (
            <Skeleton className="h-5 w-32" />
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Карточка ученика</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ФИО</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Возраст</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Рост (см)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Вес (кг)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vision"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Зрение (например: 1.0)</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1" disabled={updateStudent.isPending}>
                      {updateStudent.isPending ? "Сохранение..." : "Сохранить"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setLocation(`/classes/${student?.classId}`)}
                      disabled={updateStudent.isPending}
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}