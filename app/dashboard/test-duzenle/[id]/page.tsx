"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/redux/store"
import { Formik, Field, FieldArray, Form } from 'formik'
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { updateExam, updateMatching, updatePlacement, updateFraction } from "@/redux/actions/questionActions"

export default function TestDuzenlePage({ params }: { params: { id: string } }) {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const { questions: tests } = useSelector((state: RootState) => state.question)
  const dispatch = useDispatch()
  const { toast } = useToast()
  const resolvedParams = use(params)

  const test = tests?.find((item) => {
    if (item.exams && item.exams._id === resolvedParams.id) {
      return item.exams;
    }
    if (item.matching && item.matching._id === resolvedParams.id) {
      return item.matching;
    }
    if (item.placement && item.placement._id === resolvedParams.id) {
      return item.placement;
    }
    if (item.fraction && item.fraction._id === resolvedParams.id) {
      return item.fraction;
    }
    return false;
  });

  const testData = test?.exams || test?.matching || test?.placement || test?.fraction;

  useEffect(() => {
    if (testData) {
      setSelectedCategory(testData.category);
      if (test?.exams) setSelectedType("exams");
      else if (test?.matching) setSelectedType("matchings");
      else if (test?.placement) setSelectedType("placements");
      else if (test?.fraction) setSelectedType("fractions");
    }
  }, [testData, test]);

  const handleSubmit = async (values: any, { resetForm }: any) => {
    if (!selectedCategory || !selectedType) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen bir soru tipi seçin",
      })
      return
    }

    try {
      let formattedValues
      
      if (selectedType === "matchings") {
        formattedValues = {
          title: values.title,
          description: values.description,
          accuracy: values.accuracy,
          completionRate: values.completionRate,
          questionsCount: values.questions.length,
          questions: values.questions.map((q: any) => ({
            title: q.title,
            question: Array.isArray(q.question) ? q.question : [],
            correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer : []
          }))
        }
      } else if (selectedType === "placements") {
        formattedValues = {
          title: values.title,
          description: values.description,
          accuracy: values.accuracy,
          completionRate: values.completionRate,
          category: "Sıralama",
          questionsCount: values.questions.length,
          questions: values.questions.map((q: any) => ({
            title: q.title,
            type: q.direction === "Büyükten küçüğe doğru sıralayınız" ? ">" : "<",
            correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer.map(Number) : [],
            direction: q.direction
          }))
        }
      } else if (selectedType === "fractions") {
        formattedValues = {
          title: values.title,
          description: values.description,
          accuracy: values.accuracy,
          completionRate: values.completionRate,
          questionsCount: values.questions.length,
          questions: values.questions.map((q: any) => ({
            title: q.title || "",
            question: q.question.map((question: any) => ({
              mixedFraction: question.mixedFraction || "",
              parts: {
                A: question.parts?.A || "",
                B: question.parts?.B || "",
                C: question.parts?.C || ""
              },
              answer: question.answer || ""
            }))
          }))
        }
      } else {
        formattedValues = {
          title: values.title,
          description: values.description,
          accuracy: values.accuracy,
          completionRate: values.completionRate,
          questionsCount: values.questions.length,
          questions: values.questions.map((q: any) => ({
            question: q.question || "",
            options: Array.isArray(q.options) ? q.options : [],
            correctAnswer: q.correctAnswer || ""
          }))
        }
      }

      let actionResult
      switch (selectedType) {
        case "exams":
          actionResult = await dispatch(updateExam({ id: resolvedParams.id, payload: formattedValues }))
          break
        case "matchings":
          actionResult = await dispatch(updateMatching({ id: resolvedParams.id, payload: formattedValues }))
          break
        case "placements":
          actionResult = await dispatch(updatePlacement({ id: resolvedParams.id, payload: formattedValues }))
          break
        case "fractions":
          actionResult = await dispatch(updateFraction({ id: resolvedParams.id, payload: formattedValues }))
          break
        default:
          console.error("Unknown type:", selectedType)
          return
      }

      if (actionResult.type.endsWith('/fulfilled')) {
        toast({
          title: "Başarılı",
          description: "Soru başarıyla güncellendi",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Soru güncellenirken bir hata oluştu",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Bir hata oluştu",
      })
    }
  }

  const renderQuestionFields = (index: number, { values, setFieldValue }: any) => {
    if (selectedType === "fractions") {
      return (
        <div>
          <FieldArray name={`questions.${index}.question`}>
            {({ push: pushQuestion, remove: removeQuestion }: any) => (
              <div className="space-y-4 mt-4">
                {Array.isArray(values.questions[index].question) && values.questions[index].question.map((_: any, fractionIndex: number) => (
                  <div key={fractionIndex} className="grid gap-6 md:grid-cols-2 p-4 border rounded-lg relative">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => removeQuestion(fractionIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div>
                      <label className="block text-sm font-medium mb-1">Kesir İfadesi {fractionIndex + 1}</label>
                      <Field
                        name={`questions.${index}.question.${fractionIndex}.mixedFraction`}
                        as={Input}
                        placeholder="Örn: 6x1/2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cevap</label>
                      <Field
                        name={`questions.${index}.question.${fractionIndex}.answer`}
                        as={Input}
                        placeholder="Cevabı giriniz..."
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Parçalar (AxB/C)</label>
                      <div className="grid grid-cols-3 gap-4">
                        <Field
                          name={`questions.${index}.question.${fractionIndex}.parts.A`}
                          as={Input}
                          placeholder="A"
                        />
                        <Field
                          name={`questions.${index}.question.${fractionIndex}.parts.B`}
                          as={Input}
                          placeholder="B"
                        />
                        <Field
                          name={`questions.${index}.question.${fractionIndex}.parts.C`}
                          as={Input}
                          placeholder="C"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => pushQuestion({
                      mixedFraction: "",
                      parts: {
                        A: "",
                        B: "",
                        C: ""
                      },
                      answer: ""
                    })}
                  >
                    Yeni Kesir Ekle
                  </Button>
                </div>
              </div>
            )}
          </FieldArray>
        </div>
      )
    }

    switch (selectedType) {
      case "exams":
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Soru</label>
              <Field
                name={`questions.${index}.question`}
                as="textarea"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Soruyu giriniz..."
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-1">Seçenekler (Her seçeneği virgülle ayırın)</label>
              <Field
                name={`questions.${index}.options`}
                as="textarea"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Seçenek 1,Seçenek 2,Seçenek 3,Seçenek 4"
                onChange={(e: any) => {
                  const options = e.target.value ? e.target.value.split(',').map(opt => opt.trim().replace(/^\s+|\s+$/g, '')) : []
                  setFieldValue(`questions.${index}.options`, options)
                }}
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">Doğru Cevap</label>
              <Select onValueChange={(value) => setFieldValue(`questions.${index}.correctAnswer`, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Doğru cevabı seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "matchings":
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Soru Başlığı</label>
              <Field
                name={`questions.${index}.title`}
                as={Input}
                placeholder="Eşleştirme sorusunun başlığını giriniz..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Eşleştirilecek İfadeler</label>
              <Field
                name={`questions.${index}.question`}
                as="textarea"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="İfade 1, İfade 2, İfade 3, İfade 4"
                onChange={(e: any) => {
                  const values = e.target.value.split(",").map(item => item.trim());
                  setFieldValue(`questions.${index}.question`, values);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Doğru Eşleştirmeler</label>
              <Field
                name={`questions.${index}.correctAnswer`}
                as="textarea"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Cevap 1, Cevap 2, Cevap 3, Cevap 4"
                onChange={(e: any) => {
                  const values = e.target.value.split(",").map(item => item.trim());
                  setFieldValue(`questions.${index}.correctAnswer`, values);
                }}
              />
            </div>
          </div>
        )

      case "placements":
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Soru Başlığı</label>
              <Field
                name={`questions.${index}.title`}
                as={Input}
                placeholder="Sıralama sorusunun başlığını giriniz..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Sıralama Yönü</label>
              <Select 
                onValueChange={(value) => setFieldValue(`questions.${index}.direction`, value)}
                defaultValue="Büyükten küçüğe doğru sıralayınız"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sıralama yönünü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Büyükten küçüğe doğru sıralayınız">Büyükten Küçüğe</SelectItem>
                  <SelectItem value="Küçükten büyüğe doğru sıralayınız">Küçükten Büyüğe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Sıralanacak Sayılar</label>
              <Field
                name={`questions.${index}.correctAnswer`}
                as="textarea"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="1,2,3,4"
                value={Array.isArray(values.questions[index].correctAnswer) ? values.questions[index].correctAnswer.join(',') : ''}
                onChange={(e: any) => {
                  const inputValue = e.target.value;
                  if (!inputValue) {
                    setFieldValue(`questions.${index}.correctAnswer`, []);
                    return;
                  }
                  const items = inputValue.split(',');
                  setFieldValue(`questions.${index}.correctAnswer`, items);
                }}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderContent = () => {
    if (!testData) {
      return <div className="container mx-auto py-10 text-center">Yükleniyor...</div>
    }

    return (
      <div className="container mx-auto py-10">
        <Formik
          initialValues={{
            title: testData.title || "",
            description: testData.description || "",
            accuracy: testData.accuracy || 0,
            completionRate: testData.completionRate || 0,
            questions: testData.questions || []
          }}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-8">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Başlık</label>
                  <Field name="title" as={Input} placeholder="Test başlığını giriniz..." />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Açıklama</label>
                  <Field
                    name="description"
                    as="textarea"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Test açıklamasını giriniz..."
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Sorular</h2>
                <FieldArray name="questions">
                  {({ push, remove }: any) => (
                    <div className="space-y-4">
                      {values.questions.map((_, index) => (
                        <Card key={index}>
                          <CardHeader className="relative">
                            <div className="absolute right-6 top-4">
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => remove(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <CardTitle>Soru {index + 1}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {renderQuestionFields(index, { values, setFieldValue })}
                          </CardContent>
                        </Card>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (selectedType === "fractions") {
                            push({
                              title: "",
                              question: [{
                                mixedFraction: "",
                                parts: { A: "", B: "", C: "" },
                                answer: ""
                              }]
                            })
                          } else if (selectedType === "matchings") {
                            push({
                              title: "",
                              question: [],
                              correctAnswer: []
                            })
                          } else if (selectedType === "placements") {
                            push({
                              title: "",
                              type: ">",
                              correctAnswer: [],
                              direction: "Büyükten küçüğe doğru sıralayınız"
                            })
                          } else {
                            push({
                              question: "",
                              options: [],
                              correctAnswer: ""
                            })
                          }
                        }}
                      >
                        Yeni Soru Ekle
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </div>

              <Button type="submit">
                Güncelle
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    )
  }

  return renderContent()
}
