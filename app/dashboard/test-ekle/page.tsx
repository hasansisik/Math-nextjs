"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const questionTypes = [
  { value: "Çoktan Seçmeli", label: "Çoktan Seçmeli Test" },
  { value: "Eşleştirme", label: "Eşleştirme Soruları" },
  { value: "Sıralama", label: "Sıralama Soruları" },
  { value: "Kesir", label: "Kesir Soruları" },
]

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
      fractions: z.array(
        z.object({
          expression: z.string(),
          answer: z.string()
        })
      ).optional(),
    })
  ),
})

export default function TestEklePage() {
  const [selectedCategory, setSelectedCategory] = useState("")

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      questions: [{ title: "", question: "", options: [], correctAnswer: "", fractions: [] }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  })

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
                  <Select onValueChange={field.onChange}>
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
                      onChange={(e) => field.onChange(e.target.value.split("\n"))}
                    />
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

      case "Kesir":
        return (
          <div className="space-y-6">
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
            
            {/* Fractions Array */}
            <div className="space-y-4">
              {form.watch(`questions.${index}.fractions`, []).map((_, fractionIndex) => (
                <div key={fractionIndex} className="grid gap-6 md:grid-cols-2 p-4 border rounded-lg relative">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      const currentFractions = form.getValues(`questions.${index}.fractions`) || []
                      form.setValue(
                        `questions.${index}.fractions`,
                        currentFractions.filter((_, i) => i !== fractionIndex)
                      )
                    }}
                  >
                    ×
                  </Button>
                  <FormField
                    control={form.control}
                    name={`questions.${index}.fractions.${fractionIndex}.expression`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kesir İfadesi {fractionIndex + 1}</FormLabel>
                        <FormControl>
                          <Input placeholder="Örn: 6x1/2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`questions.${index}.fractions.${fractionIndex}.answer`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doğru Cevap {fractionIndex + 1}</FormLabel>
                        <FormControl>
                          <Input placeholder="Örn: 13/2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const currentFractions = form.getValues(`questions.${index}.fractions`) || []
                form.setValue(`questions.${index}.fractions`, [
                  ...currentFractions,
                  { expression: "", answer: "" }
                ])
              }}
            >
              Kesir Ekle
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto">
      <Card className="bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Test Ekle</CardTitle>
          <CardDescription>
            Yeni bir test oluşturmak için formu doldurun.
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
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          setSelectedCategory(value)
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Soru tipini seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {questionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  onClick={() => append({ title: "", question: "", options: [], correctAnswer: "", fractions: [] })}
                >
                  Yeni Soru Ekle
                </Button>

                <Button type="submit" className="w-full sm:w-auto">
                  Testi Kaydet
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}