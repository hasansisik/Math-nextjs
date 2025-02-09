"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { RootState } from "@/redux/store";
import { Formik, Field, FieldArray, Form } from "formik";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  updateExam,
  updateMatching,
  updatePlacement,
  updateFraction,
  updateSpace,
} from "@/redux/actions/questionActions";
import { usePathname } from "next/navigation";
import { FileUpload } from "@/components/ui/file-upload";
import { CldImage } from 'next-cloudinary';
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function TestDuzenlePage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [inputType, setInputType] = useState<{ [key: string]: 'text' | 'image' | 'both' }>({});
  const [questionFiles, setQuestionFiles] = useState<{ [key: string]: File[] }>({});
  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: string[] }>({});
  const { questions: tests } = useSelector(
    (state: RootState) => state.question
  );
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const pathname = usePathname();
  const id = pathname.split("/test-duzenle/")[1];

  const test = tests?.find((item) => {
    if (item.exams && item.exams._id === id) {
      return item.exams;
    }
    if (item.matching && item.matching._id === id) {
      return item.matching;
    }
    if (item.placement && item.placement._id === id) {
      return item.placement;
    }
    if (item.fraction && item.fraction._id === id) {
      return item.fraction;
    }
    if (item.space && item.space._id === id) {
      return item.space;
    }
    return false;
  });

  const testData =
    test?.exams || test?.matching || test?.placement || test?.fraction || test?.space;

  useEffect(() => {
    if (testData) {
      setSelectedCategory(testData.category);
      if (test?.exams) {
        setSelectedType("exams");
        // Set input types and uploaded images for exam questions
        const newInputTypes: { [key: string]: 'text' | 'image' | 'both' } = {};
        const newUploadedImages: { [key: string]: string[] } = {};
        
        testData.questions.forEach((question: any, index: number) => {
          if (question.question.includes('http')) {
            const parts = question.question.split(' ');
            const imageUrls = parts.filter((part: string) => part.startsWith('http'));
            const text = parts.filter((part: string) => !part.startsWith('http')).join(' ');
            
            if (text) {
              newInputTypes[`question_${index}`] = 'both';
              newUploadedImages[`question_${index}`] = imageUrls;
            } else {
              newInputTypes[`question_${index}`] = 'image';
              newUploadedImages[`question_${index}`] = imageUrls;
            }
          } else {
            newInputTypes[`question_${index}`] = 'text';
          }
        });
        
        setInputType(newInputTypes);
        setUploadedImages(newUploadedImages);
      }
      else if (test?.matching) setSelectedType("matchings");
      else if (test?.placement) setSelectedType("placements");
      else if (test?.fraction) setSelectedType("fractions");
      else if (test?.space) setSelectedType("spaces");
    }
  }, [testData, test]);

  const handleSubmit = async (values: any, { resetForm }: any) => {
    if (!selectedCategory || !selectedType) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen bir soru tipi seçin",
      });
      return;
    }

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
          questions: values.questions.map((q: any, index: number) => {
            let questionImages = [...(uploadedImages[index] || [])];
            
            // Add newly uploaded images
            const newImages = uploadResults.find(r => r?.index === index)?.urls || [];
            questionImages = [...questionImages, ...newImages];

            return {
              title: q.title,
              question: inputType[index] === 'image'
                ? questionImages
                : Array.isArray(q.question) ? q.question : [],
              correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer : []
            };
          })
        };
      } else if (selectedType === "placements") {
        formattedValues = {
          title: values.title,
          accuracy: values.accuracy,
          completionRate: values.completionRate,
          questionsCount: values.questions.length,
          questions: values.questions.map((q: any) => ({
            title: q.title,
            type: q.direction === "Büyükten küçüğe doğru sıralayınız" ? ">" : "<",
            correctAnswer: Array.isArray(q.correctAnswer)
              ? q.correctAnswer.map(Number)
              : [],
            direction: q.direction,
          })),
        };
      } else if (selectedType === "fractions") {
        formattedValues = {
          title: values.title,
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
                C: question.parts?.C || "",
              },
              answer: question.answer || "",
            })),
          })),
        };
      } else if (selectedType === "spaces") {
        formattedValues = {
          title: values.title,
          accuracy: values.accuracy,
          completionRate: values.completionRate,
          questionsCount: values.questions.length,
          questions: values.questions.map((q: any) => ({
            title: q.title || "",
            question: q.question.map((space: any) => ({
              optionStart: space.optionStart || "",
              optionEnd: space.optionEnd || "",
              answer: space.answer || "",
            })),
          })),
        };
      } else {
        formattedValues = {
          title: values.title,
          accuracy: values.accuracy,
          completionRate: values.completionRate,
          questionsCount: values.questions.length,
          questions: values.questions.map((q: any, index: number) => ({
            question: inputType[`question_${index}`] === 'image' 
              ? uploadedImages[`question_${index}`]?.[0] || ""
              : inputType[`question_${index}`] === 'both' && uploadedImages[`question_${index}`]?.[0]
                ? `${q.question || ""} ${uploadedImages[`question_${index}`][0]}`
                : q.question || "",
            options: q.options,
            correctAnswer: q.correctAnswer || ""
          }))
        };
      }

      let actionResult;
      switch (selectedType) {
        case "exams":
          actionResult = await dispatch(updateExam({ id, payload: formattedValues }));
          break;
        case "matchings":
          actionResult = await dispatch(updateMatching({ id, payload: formattedValues }));
          break;
        case "placements":
          actionResult = await dispatch(updatePlacement({ id, payload: formattedValues }));
          break;
        case "fractions":
          actionResult = await dispatch(updateFraction({ id, payload: formattedValues }));
          break;
        case "spaces":
          actionResult = await dispatch(updateSpace({ id, payload: formattedValues }));
          break;
        default:
          console.error("Unknown type:", selectedType);
          return;
      }

      if (actionResult.type.endsWith("/fulfilled")) {
        toast({
          title: "Başarılı",
          description: "Soru başarıyla güncellendi",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Soru güncellenirken bir hata oluştu",
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

  const renderQuestionFields = (
    index: number,
    { values, setFieldValue }: any
  ) => {
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
                {Array.isArray(values.questions[index].question) &&
                  values.questions[index].question.map(
                    (_: any, fractionIndex: number) => (
                      <div
                        key={fractionIndex}
                        className="grid gap-6 md:grid-cols-2 p-4 border rounded-lg relative"
                      >
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
                          <label className="block text-sm font-medium mb-1">
                            Kesir İfadesi {fractionIndex + 1}
                          </label>
                          <Field
                            name={`questions.${index}.question.${fractionIndex}.mixedFraction`}
                            as={Input}
                            placeholder="Örn: 6x1/2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Cevap
                          </label>
                          <Field
                            name={`questions.${index}.question.${fractionIndex}.answer`}
                            as={Input}
                            placeholder="Cevabı giriniz..."
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">
                            Parçalar (AxC/B)
                          </label>
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
                    )
                  )}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      pushQuestion({
                        mixedFraction: "",
                        parts: {
                          A: "",
                          B: "",
                          C: "",
                        },
                        answer: "",
                      })
                    }
                  >
                    Yeni Kesir Ekle
                  </Button>
                </div>
              </div>
            )}
          </FieldArray>
        </div>
      );
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
                  {uploadedImages[`question_${index}`]?.[0] && (
                    <div className="relative w-[100px] h-[100px] mb-4">
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
                          setUploadedImages(prev => {
                            const newImages = { ...prev };
                            newImages[`question_${index}`] = [];
                            return newImages;
                          });
                          setQuestionFiles(prev => {
                            const newFiles = { ...prev };
                            newFiles[`question_${index}`] = [];
                            return newFiles;
                          });
                          
                          // Clear both the image and any existing URL in the question field
                          const currentQuestion = values.questions[index].question || "";
                          const cleanedQuestion = currentQuestion.split(' ')
                            .filter((part: string) => !part.startsWith('http'))
                            .join(' ')
                            .trim();
                          
                          setFieldValue(`questions.${index}.question`, cleanedQuestion);
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
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
        );

      case "matchings":
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Soru Başlığı
              </label>
              <Field
                name={`questions.${index}.title`}
                as={Input}
                placeholder="Eşleştirme sorusunun başlığını giriniz..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Giriş Tipi</label>
              <Select
                value={inputType[index] || 'text'}
                onValueChange={(value: 'text' | 'image') => {
                  setInputType(prev => ({
                    ...prev,
                    [index]: value
                  }));
                  if (value === 'text') {
                    setFieldValue(`questions.${index}.question`, []);
                  }
                }}
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  Eşleştirilecek İfadeler
                </label>
                <Field
                  name={`questions.${index}.question`}
                  as="textarea"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="İfade 1; İfade 2; İfade 3; İfade 4"
                  value={values.questions[index].question ? values.questions[index].question.join(';') : ''}
                  onChange={(e: any) => {
                    const values = e.target.value ? e.target.value.split(';').map((item: string) => item.trim()) : [];
                    setFieldValue(`questions.${index}.question`, values);
                  }}
                />
              </div>
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
                    // Append new files to existing ones
                    setQuestionFiles(prev => ({
                      ...prev,
                      [index]: [...(prev[index] || []), ...files]
                    }));
                    
                    // Automatically upload when a file is selected
                    if (files.length > 0) {
                      Promise.all(files.map(file => uploadToCloudinary(file))).then(imageUrls => {
                        setUploadedImages(prev => ({
                          ...prev,
                          [index]: [...(prev[index] || []), ...imageUrls]
                        }));
                      });
                    }
                  }}
                />
                {uploadedImages[index]?.map((imageUrl, imgIndex) => (
                  <div key={imgIndex} className="relative w-[100px] h-[100px] mb-4">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10"
                      onClick={async () => {
                        // Remove from Cloudinary
                        try {
                          const publicId = imageUrl.split('/').pop()?.split('.')[0];
                          if (publicId) {
                            await fetch(`/api/cloudinary?publicId=${publicId}`, {
                              method: 'DELETE'
                            });
                          }
                          // Update state
                          const newImages = [...uploadedImages[index]];
                          newImages.splice(imgIndex, 1);
                          setUploadedImages(prev => ({
                            ...prev,
                            [index]: newImages
                          }));
                          // Update form values
                          const currentQuestions = values.questions[index].question;
                          if (Array.isArray(currentQuestions)) {
                            currentQuestions.splice(imgIndex, 1);
                            setFieldValue(`questions.${index}.question`, currentQuestions);
                          }
                        } catch (error) {
                          console.error('Error deleting image:', error);
                          toast({
                            variant: "destructive",
                            title: "Hata",
                            description: "Görsel silinirken bir hata oluştu"
                          });
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <CldImage
                      src={imageUrl}
                      width={100}
                      height={100}
                      alt={`Eşleştirme görseli ${imgIndex + 1}`}
                      className="rounded-lg object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">
                Doğru Eşleştirmeler
              </label>
              <Field
                name={`questions.${index}.correctAnswer`}
                as="textarea"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Cevap 1; Cevap 2; Cevap 3; Cevap 4"
                value={values.questions[index].correctAnswer ? values.questions[index].correctAnswer.join(';') : ''}
                onChange={(e: any) => {
                  const values = e.target.value ? e.target.value.split(';').map((item: string) => item.trim()) : [];
                  setFieldValue(`questions.${index}.correctAnswer`, values);
                }}
              />
            </div>
          </div>
        );

      case "placements":
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Soru Başlığı
              </label>
              <Field
                name={`questions.${index}.title`}
                as={Input}
                placeholder="Sıralama sorusunun başlığını giriniz..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Sıralama Yönü
              </label>
              <Select
                onValueChange={(value) =>
                  setFieldValue(`questions.${index}.direction`, value)
                }
                defaultValue="Büyükten küçüğe doğru sıralayınız"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sıralama yönünü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Büyükten küçüğe doğru sıralayınız">
                    Büyükten Küçüğe
                  </SelectItem>
                  <SelectItem value="Küçükten büyüğe doğru sıralayınız">
                    Küçükten Büyüğe
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Sıralanacak Sayılar
              </label>
              <Field
                name={`questions.${index}.correctAnswer`}
                as="textarea"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="1;2;3;4"
                value={
                  Array.isArray(values.questions[index].correctAnswer)
                    ? values.questions[index].correctAnswer.join(";")
                    : ""
                }
                onChange={(e: any) => {
                  const inputValue = e.target.value;
                  if (!inputValue) {
                    setFieldValue(`questions.${index}.correctAnswer`, []);
                    return;
                  }
                  const items = inputValue.split(";");
                  setFieldValue(`questions.${index}.correctAnswer`, items);
                }}
              />
            </div>
          </div>
        );

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
                  {Array.isArray(values.questions[index].question) &&
                    values.questions[index].question.map(
                      (_: any, spaceIndex: number) => (
                        <div
                          key={spaceIndex}
                          className="grid gap-6 md:grid-cols-2 p-4 border rounded-lg relative"
                        >
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
                            <label className="block text-sm font-medium mb-1">
                              Boşluktan Önceki Metin
                            </label>
                            <Field
                              name={`questions.${index}.question.${spaceIndex}.optionStart`}
                              as={Input}
                              placeholder="Örnek: Matematik, sayıları ve"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">
                              Boşluktan Sonraki Metin
                            </label>
                            <Field
                              name={`questions.${index}.question.${spaceIndex}.optionEnd`}
                              as={Input}
                              placeholder="Örnek: inceleyen bir bilim dalıdır."
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">
                              Doğru Cevap
                            </label>
                            <Field
                              name={`questions.${index}.question.${spaceIndex}.answer`}
                              as={Input}
                              placeholder="Boşluğa gelecek doğru cevabı giriniz..."
                            />
                          </div>
                        </div>
                      )
                    )}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        pushQuestion({
                          optionStart: "",
                          optionEnd: "",
                          answer: "",
                        })
                      }
                    >
                      Yeni Boşluk Ekle
                    </Button>
                  </div>
                </div>
              )}
            </FieldArray>
          </div>
        );

      default:
        return null;
    }
  };

  const renderContent = () => {
    if (!testData) {
      return (
        <div className="container mx-auto py-10 text-center">Yükleniyor...</div>
      );
    }

    return (
      <div className="container mx-auto py-10">
        <Formik
          initialValues={{
            title: testData.title || "",
            accuracy: testData.accuracy || 0,
            completionRate: testData.completionRate || 0,
            questions: testData.questions || [],
          }}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-8">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Test Başlığı</label>
                  <Field
                    name="title"
                    as={Input}
                    placeholder="Test başlığını giriniz..."
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Doğruluk Oranı (%)</label>
                  <Field
                    name="accuracy"
                    type="number"
                    as={Input}
                    min={0}
                    max={100}
                    placeholder="Doğruluk oranını giriniz..."
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Tamamlanma Oranı (%)</label>
                  <Field
                    name="completionRate"
                    type="number"
                    as={Input}
                    min={0}
                    max={100}
                    placeholder="Tamamlanma oranını giriniz..."
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Sorular</h2>
                <FieldArray name="questions">
                  {({ push, remove }: any) => (
                    <div className="space-y-4">
                      {values.questions.map((_: any, index: number) => (
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
                            {renderQuestionFields(index, {
                              values,
                              setFieldValue,
                            })}
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
                              question: [
                                {
                                  mixedFraction: "",
                                  parts: {
                                    A: "",
                                    B: "",
                                    C: "",
                                  },
                                  answer: "",
                                },
                              ],
                            });
                          } else if (selectedType === "matchings") {
                            push({
                              title: "",
                              question: [],
                              correctAnswer: [],
                            });
                          } else if (selectedType === "placements") {
                            push({
                              title: "",
                              type: ">",
                              correctAnswer: [],
                              direction: "Büyükten küçüğe doğru sıralayınız",
                            });
                          } else if (selectedType === "spaces") {
                            push({
                              title: "",
                              question: [
                                {
                                  optionStart: "",
                                  optionEnd: "",
                                  answer: "",
                                },
                              ],
                            });
                          } else {
                            push({
                              question: "",
                              options: [],
                              correctAnswer: "",
                            });
                          }
                        }}
                      >
                        Yeni Soru Ekle
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </div>

              <Button type="submit">Güncelle</Button>
            </Form>
          )}
        </Formik>
      </div>
    );
  };

  return renderContent();
}