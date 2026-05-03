import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateClass, useCreateStudent, getListClassesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Название класса обязательно").max(10, "Слишком длинное название"),
  studentCount: z.coerce.number().min(1, "Минимум 1 ученик").max(50, "Максимум 50 учеников"),
});

export default function CreateClass() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createClass = useCreateClass();
  const createStudent = useCreateStudent();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      studentCount: 20,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const newClass = await createClass.mutateAsync({ data: values });
      for (let i = 0; i < values.studentCount; i++) {
        await createStudent.mutateAsync({
          id: newClass.id,
          data: {
            fullName: `Ученик ${i + 1}`,
          },
        });
      }
      queryClient.invalidateQueries({ queryKey: getListClassesQueryKey() });
      toast({ title: "Класс успешно создан" });
      setLocation(`/classes/${newClass.id}`);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Ошибка при создании класса",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Создать новый класс</CardTitle>
            <CardDescription>
              Введите название класса и количество учеников. Карточки учеников будут созданы автоматически.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название класса (например: 5Б)</FormLabel>
                      <FormControl>
                        <Input placeholder="5Б" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Количество учеников</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={50} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Создание..." : "Создать класс"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setLocation("/dashboard")} disabled={isSubmitting}>
                    Отмена
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}