"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDispatch } from "react-redux"
import { createExam, createMatching, createPlacement, createFraction, createSpace } from "@/redux/actions/questionActions"
import { useToast } from "@/hooks/use-toast"
import { Formik, Form, Field, FieldArray } from 'formik'
import { X } from "lucide-react"
import type { AppDispatch } from "@/redux/store"
import { FileUpload } from "@/components/ui/file-upload"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { CldImage } from 'next-cloudinary'

const questionTypes = [
  { value: "Çoktan Seçmeli", label: "Çoktan Seçmeli Test",type:"exams" },
  { value: "Eşleştirme", label: "Eşleştirme Soruları",type:"matchings" },
  { value: "Sıralama", label: "Sıralama Soruları",type:"placements" },
  { value: "Kesir", label: "Cevap Yazma Soruları",type:"fractions" },
  { value: "Boşluk", label: "Boşluk Doldurma Soruları",type:"spaces" },    
]

const baseInitialValues = {
  title: "",
  category: "",
  description: "",
  accuracy: 0,
  completionRate: 0
}

const getInitialValues = (type: string) => {
  switch (type) {
    case "exams":
      return {
        ...baseInitialValues,
        questions: [{
          question: "",
          options: [],
          correctAnswer: ""
        }]
      }
    case "matchings":
      return {
        ...baseInitialValues,
        questions: [{
          title: "",
          question: [],
          correctAnswer: []
        }]
      }
    case "placements":
      return {
        ...baseInitialValues,
        questions: [{
          title: "",
          type: ">",
          correctAnswer: [],
          direction: "Büyükten küçüğe doğru sıralayınız"
        }]
      }
    case "fractions":
      return {
        ...baseInitialValues,
        questions: [{
          title: "",
          question: [{
            mixedFraction: "",
            parts: {
              A: "",
              B: "",
              C: ""
            },
            answer: ""
          }]
        }]
      }
    case "spaces":
      return {
        ...baseInitialValues,
        questions: [{
          title: "",
          question: [{
            optionStart: "",
            optionEnd: "",
            answer: ""
          }]
        }]
      }
    default:
      return {
        ...baseInitialValues,
        questions: [{
          title: "",
          question: "",
          options: [],
          correctAnswer: "",
          fractions: []
        }]
      }
  }
}

export default function TestEklePage() {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedType, setSelectedType] = useState("")
  const { toast } = useToast()
  const [inputType, setInputType] = useState<{ [key: string]: 'text' | 'image' | 'both' }>({})
  const [questionFiles, setQuestionFiles] = useState<{ [key: string]: File[] }>({})
  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: string[] }>({})

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      let formattedValues;

      if (selectedType === "matchings") {
        // Upload all images first
        const uploadPromises = Object.entries(questionFiles).map(async ([index, files]) => {
          if (inputType[index] === 'image' && files.length > 0) {
            const uploadedUrls = await Promise.all(
              files.map(file => uploadToCloudinary(file))
            );
            return { index: Number(index), urls: uploadedUrls };
          }
          return null;
        });

        const uploadResults = (await Promise.all(uploadPromises)).filter(Boolean);

        formattedValues = {
          title: values.title,
          description: values.description,
          accuracy: values.accuracy,
          completionRate: values.completionRate,
          questionsCount: values.questions.length,
          questions: values.questions.map((q: any, index: number) => ({
            title: q.title,
            question: inputType[index] === 'image' 
              ? uploadResults.find(r => r?.index === index)?.urls || []
              : Array.isArray(q.question) ? q.question : q.question,
            correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer : q.correctAnswer
          }))
        };

        // Update uploaded images state for display
        uploadResults.forEach(result => {
          if (result) {
            setUploadedImages(prev => ({
              ...prev,
              [result.index]: result.urls
            }));
          }
        });
      } else if (selectedType === "placements") {
        formattedValues = {
          title: values.title,
          description: values.description,
          accuracy: values.accuracy,
          completionRate: values.completionRate,
          questionsCount: values.questions.length,
          questions: values.questions.map((q: any) => ({
            title: q.title,
            type: q.direction === "Büyükten küçüğe doğru sıralayınız" ? ">" : "<",
            correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer : [],
            direction: q.direction
          }))
        };
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
        };
      } else if (selectedType === "spaces") {
        formattedValues = {
          title: values.title,
          description: values.description,
          accuracy: values.accuracy,
          completionRate: values.completionRate,
          questionsCount: values.questions.length,
          questions: values.questions.map((q: any) => ({
            title: q.title || "",
            question: q.question.map((space: any) => ({
              optionStart: space.optionStart || "",
              optionEnd: space.optionEnd || "",
              answer: space.answer || ""
            }))
          }))
        };
      } else if (selectedType === "exams") {
        formattedValues = {
          title: values.title,
          description: values.description,
          accuracy: values.accuracy,
          completionRate: values.completionRate,
          questionsCount: values.questions.length,
          questions: values.questions.map((q: any, index: number) => ({
            question: inputType[`question_${index}`] === 'image' 
              ? uploadedImages[`question_${index}`] || ""
              : inputType[`question_${index}`] === 'both' && uploadedImages[`question_${index}`]
                ? `${q.question || ""} ${uploadedImages[`question_${index}`].join('; ')}`
                : Array.isArray(q.question) ? q.question[0] || "" : q.question || "",
            options: q.options,
            correctAnswer: q.correctAnswer || ""
          }))
        };
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
        };
      }

      console.log("formattedValues:", formattedValues);
      console.log("Dispatching action for type:", selectedType);

      let actionResult;
      switch (selectedType) {
        case "exams":
          actionResult = await dispatch(createExam(formattedValues));
          break;
        case "matchings":
          actionResult = await dispatch(createMatching(formattedValues));
          break;
        case "placements":
          actionResult = await dispatch(createPlacement(formattedValues));
          break;
        case "fractions":
          actionResult = await dispatch(createFraction(formattedValues));
          break;
        case "spaces":
          actionResult = await dispatch(createSpace(formattedValues));
          break;
        default:
          console.error("Unknown type:", selectedType);
          return;
      }

      console.log("Action Result:", actionResult);
      
      if (actionResult.type.endsWith('/fulfilled')) {
        toast({
          title: "Başarılı",
          description: "Soru başarıyla oluşturuldu",
        });
        resetForm();
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Soru oluşturulurken bir hata oluştu",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Bir hata oluştu",
      });
    }
  };

  const renderQuestionFields = (index: number, { values, setFieldValue }: any) => {
    if (selectedType === "fractions") {
      return (
        <div>
           <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Soru Başlığı</label>
              <Field
                name={`questions.${index}.title`}
                as={Input}
                placeholder="Örnek: 1) Aşağıdaki verilen işlemlerini sonuçları ile eşleştiriniz"
              />
            </div>
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
                      <label className="block text-sm font-medium mb-1">Parçalar (AxC/B)</label>
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
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Soru Tipi</label>
                <Select
                  onValueChange={(value) => {
                    const newType = value as 'text' | 'image' | 'both';
                    setInputType(prev => ({ ...prev, [`question_${index}`]: newType }));
                    if (newType === 'image' || newType === 'both') {
                      setQuestionFiles(prev => ({ ...prev, [`question_${index}`]: [] }));
                    } else {
                      setQuestionFiles(prev => {
                        const newFiles = { ...prev };
                        delete newFiles[`question_${index}`];
                        return newFiles;
                      });
                    }
                  }}
                  defaultValue={inputType[`question_${index}`]}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Soru tipini seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Sadece Metin</SelectItem>
                    <SelectItem value="image">Sadece Görsel</SelectItem>
                    <SelectItem value="both">Metin ve Görsel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(inputType[`question_${index}`] === 'text' || inputType[`question_${index}`] === 'both') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Soru Metni</label>
                  <Field
                    name={`questions.${index}.question`}
                    as="textarea"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Soruyu giriniz..."
                    value={values.questions[index].question ? values.questions[index].question.join(';') : ''}
                    onChange={(e: any) => {
                      const values = e.target.value ? e.target.value.split(';').map((item: string) => item.trim()) : [];
                      setFieldValue(`questions.${index}.question`, values);
                    }}
                  />
                </div>
              )}

              {(inputType[`question_${index}`] === 'image' || inputType[`question_${index}`] === 'both') && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium mb-1">Soru Görseli</label>
                  <FileUpload
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] }}
                    multiple={false}
                    files={questionFiles[`question_${index}`] || []}
                    onFilesChange={(files) => {
                      setQuestionFiles(prev => ({
                        ...prev,
                        [`question_${index}`]: files
                      }));
                      
                      // Automatically upload when a file is selected
                      if (files[0]) {
                        uploadToCloudinary(files[0]).then(imageUrl => {
                          setUploadedImages(prev => ({
                            ...prev,
                            [`question_${index}`]: [imageUrl]
                          }));
                        });
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-4">
                    {Array.isArray(uploadedImages[`question_${index}`]) && uploadedImages[`question_${index}`][0] && (
                      <div className="relative w-[100px] h-[100px]">
                        <CldImage
                          src={uploadedImages[`question_${index}`][0]}
                          width={100}
                          height={100}
                          alt={`Question ${index + 1}`}
                          crop="fill"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                          onClick={() => {
                            setUploadedImages(prev => ({
                              ...prev,
                              [`question_${index}`]: []
                            }));
                            setQuestionFiles(prev => ({
                              ...prev,
                              [`question_${index}`]: []
                            }));
                            
                            // If it's image only mode, clear the question value
                            if (inputType[`question_${index}`] === 'image') {
                              setFieldValue(`questions.${index}.question`, '');
                            }
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-1">Seçenekler (Her seçeneği noktalı virgülle ayırın)</label>
              <Field
                name={`questions.${index}.options`}
                as="textarea"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Seçenek 1;Seçenek 2;Seçenek 3;Seçenek 4"
                value={values.questions[index].options ? values.questions[index].options.join(';') : ''}
                onChange={(e: any) => {
                  const options = e.target.value ? e.target.value.split(';').map((opt: string) => opt.trim().replace(/^\s+|\s+$/g, '')) : [];
                  setFieldValue(`questions.${index}.options`, options);
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
                placeholder="Örnek: 1) Aşağıdaki verilen işlemlerini sonuçları ile eşleştiriniz"
              />
            </div>
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Giriş Tipi</label>
                <Select
                  onValueChange={(value) => {
                    const newType = value as 'text' | 'image';
                    setInputType(prev => ({ ...prev, [index]: newType }));
                    // Reset the form values and files for this question
                    setFieldValue(`questions.${index}.question`, []);
                    if (newType === 'image') {
                      setQuestionFiles(prev => ({ ...prev, [index]: [] }));
                    } else {
                      setQuestionFiles(prev => {
                        const newFiles = { ...prev };
                        delete newFiles[index];
                        return newFiles;
                      });
                    }
                  }}
                  defaultValue={inputType[index]}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Giriş tipini seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Metin</SelectItem>
                    <SelectItem value="image">Görsel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {inputType[index] === 'text' ? (
                <>
                  <label className="block text-sm font-medium mb-1">Eşleştirilecek İfadeler (Noktalı virgülle ayırın)</label>
                  <Field
                    name={`questions.${index}.question`}
                    as="textarea"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="6 x 2 - 2; 6 - 5 - 1; 2 x 4 - 2; 0 x 5 + 8"
                    value={values.questions[index].question ? values.questions[index].question.join(';') : ''}
                    onChange={(e: any) => {
                      const values = e.target.value ? e.target.value.split(';').map((item: string) => item.trim()) : [];
                      setFieldValue(`questions.${index}.question`, values);
                    }}
                  />
                </>
              ) : (
                <div className="space-y-4">
                  <label className="block text-sm font-medium mb-1">Eşleştirilecek Görseller</label>
                  {questionFiles[index]?.length > 0 && (
                    <div className="text-sm text-muted-foreground mb-2">
                      Seçilen Görseller: {questionFiles[index].length} adet
                    </div>
                  )}
                  <FileUpload
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] }}
                    multiple={true}
                    files={questionFiles[index] || []}
                    onFilesChange={(files) => {
                      setQuestionFiles(prev => ({
                        ...prev,
                        [index]: files
                      }));
                    }}
                  />
                  <div className="flex flex-wrap gap-4">
                    {uploadedImages[index]?.map((imageUrl, imgIndex) => (
                      <div key={imgIndex} className="relative w-[100px] h-[100px]">
                        <CldImage
                          src={imageUrl}
                          width={100}
                          height={100}
                          alt={`Question ${index + 1} image ${imgIndex + 1}`}
                          crop="fill"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                          onClick={() => {
                            setUploadedImages(prev => ({
                              ...prev,
                              [index]: prev[index].filter((_, i) => i !== imgIndex)
                            }));
                            setQuestionFiles(prev => ({
                              ...prev,
                              [index]: prev[index].filter((_, i) => i !== imgIndex)
                            }));
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Doğru Eşleştirmeler (Noktalı virgülle ayırın)</label>
              <Field
                name={`questions.${index}.correctAnswer`}
                as="textarea"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="10; 0; 6; 8"
                value={values.questions[index].correctAnswer ? values.questions[index].correctAnswer.join(';') : ''}
                onChange={(e: any) => {
                  const values = e.target.value ? e.target.value.split(';').map((item: string) => item.trim()) : [];
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
                placeholder="Örnek: 1) Aşağıdaki sayıları büyükten küçüğe sıralayınız"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Sıralama Yönü</label>
              <Select 
                onValueChange={(value) => setFieldValue(`questions.${index}.direction`, value)}
                defaultValue={values.questions[index].direction}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sıralama yönünü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Büyükten küçüğe doğru sıralayınız">Büyükten küçüğe</SelectItem>
                  <SelectItem value="Küçükten büyüğe doğru sıralayınız">Küçükten büyüğe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Sıralanacak Sayılar (Noktalı virgülle ayırın)</label>
              <Field
                name={`questions.${index}.correctAnswer`}
                as="textarea"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="12; 3; -1; -5"
                value={values.questions[index].correctAnswer ? values.questions[index].correctAnswer.join(';') : ''}
                onChange={(e: any) => {
                  const values = e.target.value ? e.target.value.split(';').map((item: string) => item.trim()) : [];
                  setFieldValue(`questions.${index}.correctAnswer`, values);
                }}
              />
            </div>
          </div>
        )

      case "spaces":
        return (
          <div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Soru Başlığı</label>
              <Field
                name={`questions.${index}.title`}
                as={Input}
                placeholder="Örnek: 1) Aşağıdaki cümlelerdeki boşlukları doldurunuz"
              />
            </div>
            <FieldArray name={`questions.${index}.question`}>
              {({ push: pushQuestion, remove: removeQuestion }: any) => (
                <div className="space-y-4 mt-4">
                  {Array.isArray(values.questions[index].question) && values.questions[index].question.map((_: any, spaceIndex: number) => (
                    <div key={spaceIndex} className="grid gap-6 md:grid-cols-2 p-4 border rounded-lg relative">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => removeQuestion(spaceIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Boşluktan Önceki Metin</label>
                        <Field
                          name={`questions.${index}.question.${spaceIndex}.optionStart`}
                          as={Input}
                          placeholder="Örnek: Matematik, sayıları ve"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Boşluktan Sonraki Metin</label>
                        <Field
                          name={`questions.${index}.question.${spaceIndex}.optionEnd`}
                          as={Input}
                          placeholder="Örnek: inceleyen bir bilim dalıdır."
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Doğru Cevap</label>
                        <Field
                          name={`questions.${index}.question.${spaceIndex}.answer`}
                          as={Input}
                          placeholder="Boşluğa gelecek doğru cevabı giriniz..."
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => pushQuestion({
                        optionStart: "",
                        optionEnd: "",
                        answer: ""
                      })}
                    >
                      Yeni Boşluk Ekle
                    </Button>
                  </div>
                </div>
              )}
            </FieldArray>
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
          <Formik
            initialValues={getInitialValues("")}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, resetForm }) => (
              <Form className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium mb-1">Test Başlığı</label>
                    <Field
                      name="title"
                      as={Input}
                      placeholder="Test başlığını giriniz..."
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <Select
                      onValueChange={(value) => {
                        const selectedQuestionType = questionTypes.find(type => type.value === value);
                        const newType = selectedQuestionType?.type || "";
                        const currentTitle = values.title; // Store current title
                        setFieldValue("category", value);
                        setSelectedType(newType);
                        const newValues = getInitialValues(newType);
                        resetForm({ values: { ...newValues, title: currentTitle } }); // Preserve title
                        console.log("Selected type:", newType);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Soru tipini seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Açıklama</label>
                    <Field
                      name="description"
                      as="textarea"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Test açıklamasını giriniz..."
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium mb-1">Zorluk Oranı</label>
                    <Field
                      type="number"
                      name="accuracy"
                      as={Input}
                      placeholder="Zorluk Oranını giriniz..."
                      min={0}
                      max={100}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium mb-1">Başarı Yüzdesi</label>
                    <Field
                      type="number"
                      name="completionRate"
                      as={Input}
                      placeholder="Başarı Yüzdesinı giriniz..."
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <FieldArray name="questions">
                  {({ push, remove }: any) => (
                    <div className="space-y-6">
                      {values.questions.map((_, index) => (
                        <Card key={index} className="bg-muted/50">
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

                            {renderQuestionFields(index, { values, setFieldValue })}
                          </CardContent>
                        </Card>
                      ))}

                      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (selectedType === "fractions") {
                              push({
                                title: "",
                                question: [{
                                  mixedFraction: "",
                                  parts: {
                                    A: "",
                                    B: "",
                                    C: ""
                                  },
                                  answer: ""
                                }]
                              })
                            } else if (selectedType === "spaces") {
                              push({
                                title: "",
                                question: [{
                                  optionStart: "",
                                  optionEnd: "",
                                  answer: ""
                                }]
                              })
                            } else {
                              push({ 
                                title: "", 
                                question: "", 
                                options: [], 
                                correctAnswer: "", 
                                fractions: [] 
                              })
                            }
                          }}
                        >
                          Yeni Soru Ekle
                        </Button>

                        <Button 
                          type="submit"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            console.log("Submit button clicked");
                            console.log("Current values:", values);
                            console.log("Selected category:", values.category);
                          }}
                        >
                          Testi Kaydet
                        </Button>
                      </div>
                    </div>
                  )}
                </FieldArray>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}