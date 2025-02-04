"use client";

import { useState, useEffect } from "react";
import useSound from "use-sound"; // Yeni import
import { Card, CardContent} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter, usePathname } from "next/navigation";
import { AlarmClock, BookOpenText, X, Loader2 } from "lucide-react";
import { getQuestions } from "@/redux/actions/questionActions";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

export default function ExamPage() {
  const router = useRouter();
  const pathname = usePathname();
  const examId = pathname.split('/exam/')[1];
  const { questions, loading } = useSelector((state: RootState) => state.question);
  const dispatch = useDispatch<AppDispatch>();
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [examResults, setExamResults] = useState({
    correct: 0,
    incorrect: 0,
    empty: 0,
    totalPoints: 0,
  });

  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [timerActive, setTimerActive] = useState(true);

  const [playPickupSound] = useSound("/pickup.mp3");


  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    dispatch(getQuestions());
  }, [dispatch]);


  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          const newSeconds = prev.seconds + 1;
          if (newSeconds === 60) {
            return {
              minutes: prev.minutes + 1,
              seconds: 0,
            };
          }
          return {
            ...prev,
            seconds: newSeconds,
          };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerActive]);

  const examData = questions?.find((q: any) => 
    q.exams && q.exams._id === examId
  )?.exams;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center flex-col gap-2">
        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
        <span>Yükleniyor...</span>
      </div>
    );}

  if (!examData) {
    return (
      <div className="flex flex-1 items-center justify-center flex-col gap-2">
        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  const handleSubmit = () => {
    setTimerActive(false);
    let correctCount = 0;
    let incorrectCount = 0;
    let emptyCount = 0;

    examData.questions.forEach((question: { correctAnswer: string }, index: number) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctCount++;
      } else if (userAnswers[index]) {
        incorrectCount++;
      } else {
        emptyCount++;
      }
    });

    // Her doğru 5 puan, her 3 yanlış 1 doğruyu götürür
    const canceledCorrects = Math.floor(incorrectCount / 3);
    const effectiveCorrects = Math.max(0, correctCount - canceledCorrects);
    const totalPoints = effectiveCorrects * 5;

    setExamResults({
      correct: correctCount,
      incorrect: incorrectCount,
      empty: emptyCount,
      totalPoints,
    });

    setShowResults(true);
  };

  const handleDialogClose = () => {
    setTimer({ minutes: 0, seconds: 0 }); // Timer'ı sıfırla
    setShowResults(false);
    router.push("/");
  };

  const handleNext = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const renderQuestionContent = (text: string) => {
    const parts = text.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((part, index) => {
      if (part.match(/^https?:\/\//)) {
        return (
          <div key={index} className="my-4 max-w-[300px] mx-auto">
            <img
              src={part}
              alt="Soru görseli"
              className="w-full h-auto object-contain rounded-lg"
              style={{
                maxHeight: "200px",
              }}
            />
          </div>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleAnswerChange = (value: string) => {
    playPickupSound();
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));
  };

  const handleFinishExam = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmFinish = () => {
    setShowConfirmDialog(false);
    if (showAnswers) {
      handleSubmit();
    } else {
      setShowAnswers(true);
    }
  };

  const currentQuestion = examData.questions[currentQuestionIndex];

  return (
    <div className="flex flex-col m-5">
      <div className="flex flex-col xs:flex-row items-center justify-between gap-4">
        <div className='flex items-center flex-row'>
          <div 
            className="p-2 bg-slate-100 mr-3 rounded-sm cursor-pointer hover:bg-slate-200" 
            onClick={() => router.push('/')}
          >
            <X />
          </div>
          <AlarmClock color="gray" className="mr-2" />
          <div className="flex items-center gap-1">
            <span className="mr-2">Geçen Süre:</span>
            <span className="px-3 py-1 bg-primary text-white rounded-sm">
              {String(timer.minutes).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="px-3 py-1 bg-primary text-white rounded-sm">
              {String(timer.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="flex justify-center w-full xs:w-auto">
          <Button 
            variant="destructive" 
            onClick={handleFinishExam}
          >
            Sınavı Bitir
          </Button>
        </div>
      </div>

      <div className="flex flex-col mx-auto pt-10  gap-2">
        <div className="flex flex-row items-center gap-2">
            <div className="p-1 bg-primary rounded-sm">
              <BookOpenText color="white" />
            </div>
            <p className="font-bold">Çoktan Seçmeli</p>
            <p>
              {currentQuestionIndex + 1} ile {examData.questions.length}
            </p>
        </div>
        <h2 className="pt-5 font-bold text-lg">{renderQuestionContent(currentQuestion.question)}</h2>

        <p className="text-neutral-500">Soruları dikkatlice okuyarak aşağıdaki şıklardan doğru olduğunu düşündüğünüz cevabı işaretleyin.</p>
        <Card>
          <CardContent className="pt-5">
            <RadioGroup
              value={userAnswers[currentQuestionIndex] || ""}
              onValueChange={handleAnswerChange}
            >
              {currentQuestion.options.map((option: string, optionIndex: number) => {
                const letters = ['A', 'B', 'C', 'D'];
                return (
                  <div 
                    key={optionIndex} 
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={letters[optionIndex]}
                      id={`${currentQuestionIndex}-${optionIndex}`}
                    />
                    <Label htmlFor={`${currentQuestionIndex}-${optionIndex}`}>
                      {letters[optionIndex]}) {renderQuestionContent(option)}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Önceki Soru
          </Button>
          <Button
            onClick={
              currentQuestionIndex === examData.questions.length - 1
                ? handleFinishExam
                : handleNext
            }
            variant={
              currentQuestionIndex === examData.questions.length - 1
                ? "destructive"
                : "default"
            }
          >
            {currentQuestionIndex === examData.questions.length - 1
              ? "Sınavı Bitir"
              : "Sonraki Soru"}
          </Button>
        </div>
        <ScrollArea className="my-5">
          <div className="grid grid-cols-10 gap-2">
            {examData.questions.map((_: any, index: number) => (
              <Button
                key={index}
                variant={
                  showAnswers 
                    ? (userAnswers[index] 
                        ? (userAnswers[index] === examData.questions[index].correctAnswer 
                            ? "success" 
                            : "destructive")
                        : "outline")
                    : (currentQuestionIndex === index ? "default" : "outline")
                }
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {showAnswers ? 
                  `${index + 1} - ${userAnswers[index] || '-'}` :
                  index + 1
                }
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={showResults} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sınav Sonucu</DialogTitle>
            <DialogDescription className="text-primary font-medium mt-2">
              Doğrular 5 puan ve 3 yanlış 1 doğruyu götürüyor
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 space-y-3">
            <DialogDescription asChild>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Toplam Soru:</span>
                  <span className="font-medium">{examData.questions.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Doğru Sayısı:</span>
                  <span className="font-medium text-green-600">{examResults.correct}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Yanlış Sayısı:</span>
                  <span className="font-medium text-red-600">{examResults.incorrect}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Boş Sayısı:</span>
                  <span className="font-medium text-gray-600">{examResults.empty}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-primary/10 px-4 rounded-lg">
                  <span className="font-bold">Toplam Puan:</span>
                  <span className="font-bold text-primary">{examResults.totalPoints}</span>
                </div>
              </div>
            </DialogDescription>
          </div>
          <DialogFooter>
            <Button onClick={handleDialogClose}>Tamam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emin Misiniz ?</DialogTitle>
            <DialogDescription>
              Sınavı bitirmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleConfirmFinish}>
              Evet, Bitir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
