"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"

const formSchema = z.object({
  title: z.string().min(2, { message: "Başlık en az 2 karakter olmalıdır" }),
  category: z.string(),
  description: z.string().optional(),
  questions: z.array(
    z.object({
      title: z.string().min(2, { message: "Soru başlığı en az 2 karakter olmalıdır" }),
      question: z.string().min(2, { message: "Soru en az 2 karakter olmalıdır" }),
      options: z.array(z.string()).optional(),
      correctAnswer: z.string().or(z.array(z.string())).or(z.array(z.number())),
    })
  ),
})

export default function TestDuzenlePage({ params }: { params: { id: string } }) {
  const [selectedCategory, setSelectedCategory] = useState("")
  
  // Get tests from Redux state
  const { questions: tests } = useSelector((state: RootState) => state.question);

  // ID'ye göre testi buluyoruz
  const test = tests?.find((item) => {
    if (item.exams && item.exams._id === params.id) return item.exams;
    if (item.matching && item.matching._id === params.id) return item.matching;
    if (item.placement && item.placement._id === params.id) return item.placement;
    return false;
  });

  const testData = test?.exams || test?.matching || test?.placement;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: testData?.title || "",
      category: testData?.category || "",
      description: testData?.desc || "",
      questions: testData?.questions || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  })

  useEffect(() => {
    if (testData) {
      setSelectedCategory(testData.category)
    }
  }, [testData])

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  const renderQuestionFields = (index: number) => {
    switch (selectedCategory) {
      case "Çoktan Seçmeli":
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name={`questions.${index}.question`}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Soru</FormLabel>
                  <FormControl>
                    <Input placeholder="Soruyu giriniz..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.options`}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Seçenekler (Her satıra bir seçenek yazın)</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="A) Seçenek 1&#10;B) Seçenek 2&#10;C) Seçenek 3&#10;D) Seçenek 4"
                      value={field.value?.join("\n")}
                      onChange={(e) => field.onChange(e.target.value.split("\n"))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.correctAnswer`}
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Doğru Cevap</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value as string}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Doğru cevabı seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      case "Eşleştirme":
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name={`questions.${index}.title`}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Soru Başlığı</FormLabel>
                  <FormControl>
                    <Input placeholder="Eşleştirme sorusunun başlığını giriniz..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.question`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eşleştirilecek İfadeler</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="İfade 1&#10;İfade 2&#10;İfade 3&#10;İfade 4"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value.split("\n"))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.correctAnswer`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doğru Eşleştirmeler</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Cevap 1&#10;Cevap 2&#10;Cevap 3&#10;Cevap 4"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value.split("\n"))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      case "Kesir":
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name={`questions.${index}.title`}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Soru Başlığı</FormLabel>
                  <FormControl>
                    <Input placeholder="Kesir sorusunun başlığını giriniz..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.question`}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Kesir İfadesi</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: 6x1/2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.correctAnswer`}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Doğru Cevap</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: 13/2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      case "Sıralama":
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name={`questions.${index}.title`}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Soru Başlığı</FormLabel>
                  <FormControl>
                    <Input placeholder="Sıralama sorusunun başlığını giriniz..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.correctAnswer`}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Sıralanacak Sayılar/İfadeler</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="1&#10;2&#10;3&#10;4"
                      value={field.value?.join("\n")}
                      onChange={(e) => {
                        const values = e.target.value.split("\n").map(Number)
                        field.onChange(values)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      default:
        return null
    }
  }

  if (!testData) {
    return <div>Test bulunamadı</div>
  }

  return (
    <div className="container mx-auto">
      <Card className="bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Test Düzenle</CardTitle>
          <CardDescription>
            Test içeriğini düzenleyebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Test Başlığı</FormLabel>
                      <FormControl>
                        <Input placeholder="Test başlığını giriniz..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Kategori</FormLabel>
                      <Input value={field.value} disabled />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Açıklama</FormLabel>
                      <FormControl>
                        <textarea 
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Test açıklamasını giriniz..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Bu alan isteğe bağlıdır.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                {fields.map((field, index) => (
                  <Card key={field.id} className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="mb-6 flex items-center justify-between">
                        <h4 className="text-lg font-medium">Soru {index + 1}</h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            Soruyu Sil
                          </Button>
                        )}
                      </div>
                      {renderQuestionFields(index)}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ title: "", question: "", options: [], correctAnswer: "" })}
                >
                  Yeni Soru Ekle
                </Button>

                <Button type="submit" className="w-full sm:w-auto">
                  Değişiklikleri Kaydet
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
