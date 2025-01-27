"use client";

import { use, useState, useEffect } from "react";
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
import exams from "@/exams.json";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { AlarmClock, BookOpenText, X } from "lucide-react";

export default function ExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const router = useRouter();
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [examResults, setExamResults] = useState({
    correct: 0,
    incorrect: 0,
    totalPoints: 0,
    passed: false,
  });

  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [timerActive, setTimerActive] = useState(true);

  const [playPickupSound] = useSound("/pickup.mp3");
  const [playCorrectSound] = useSound("/drop.mp3");
  const [playWrongSound] = useSound("/fail.mp3");

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

  const resolvedParams = use(params);
  const exam = exams.find((exam) => exam.id === resolvedParams.examId);

  if (!exam) {
    return <div>Sınav bulunamadı</div>;
  }

  const handleSubmit = () => {
    setTimerActive(false); // Timer'ı durdur
    let correctCount = 0;
    let incorrectCount = 0;

    exam.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctCount++;
      } else if (userAnswers[index]) {
        // Only count as incorrect if answered
        incorrectCount++;
      }
    });

    const totalPoints = correctCount * 2;
    const passed = totalPoints >= 70;

    setExamResults({
      correct: correctCount,
      incorrect: incorrectCount,
      totalPoints,
      passed,
    });

    setShowResults(true);
  };

  const handleDialogClose = () => {
    setTimer({ minutes: 0, seconds: 0 }); // Timer'ı sıfırla
    setShowResults(false);
    router.push("/exam");
  };

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const getButtonVariant = (index: number) => {
    const currentAnswer = userAnswers[index];
    const correctAnswer = exam.questions[index].correctAnswer;

    if (!currentAnswer) {
      // Henüz cevaplanmamış soru
      return currentQuestionIndex === index ? "default" : "outline";
    }

    if (currentAnswer === correctAnswer) {
      // Doğru cevap verilmiş
      return "success";
    } else {
      // Yanlış cevap verilmiş
      return "destructive";
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
    const isCorrect = value === exam.questions[currentQuestionIndex].correctAnswer;
    
    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));
  };

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="flex flex-col m-5">
      <div className="flex items-center justify-between mx-3">
        <div className="flex items-center flex-row">
          <div 
            className="p-2 bg-slate-100 mr-3 rounded-sm cursor-pointer hover:bg-slate-200" 
            onClick={() => router.push('/')}
          >
            <X />
          </div>
          <AlarmClock color="gray" className="mr-2" />
          <div className="flex items-center gap-1">
            <span className="mr-2">Geçen Süre:</span>
            <span className="px-3 py-1 bg-black text-white rounded-sm">
              {String(timer.minutes).padStart(2, "0")}
            </span>
            <span>:</span>
            <span className="px-3 py-1 bg-black text-white rounded-sm">
              {String(timer.seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
        <Button variant="destructive" onClick={handleSubmit}>
          Sınavı Bitir
        </Button>
      </div>

      <div className="flex flex-col mx-auto pt-10  gap-2">
        <div className="flex flex-row items-center gap-2">
            <div className="p-1 bg-black rounded-sm">
              <BookOpenText color="white" />
            </div>
            <p className="font-bold">Çoktan Seçmeli</p>
            <p>
              {currentQuestionIndex + 1} ile {exam.questions.length}
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
              {currentQuestion.options.map((option, optionIndex) => (
                <div 
                  key={optionIndex} 
                  className="flex items-center space-x-2"
                  onClick={() => playPickupSound()} // Tıklama sesini ekle
                >
                  <RadioGroupItem
                    value={option.charAt(0)}
                    id={`${currentQuestionIndex}-${optionIndex}`}
                  />
                  <Label htmlFor={`${currentQuestionIndex}-${optionIndex}`}>
                    {renderQuestionContent(option)}
                  </Label>
                </div>
              ))}
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
              currentQuestionIndex === exam.questions.length - 1
                ? handleSubmit
                : handleNext
            }
            variant={
              currentQuestionIndex === exam.questions.length - 1
                ? "destructive"
                : "default"
            }
          >
            {currentQuestionIndex === exam.questions.length - 1
              ? "Sınavı Bitir"
              : "Sonraki Soru"}
          </Button>
        </div>
        <ScrollArea className="my-5">
          <div className="grid grid-cols-10 gap-2">
            {exam.questions.map((_, index) => (
              <Button
                key={index}
                variant={getButtonVariant(index)}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={showResults} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sınav Sonucu</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-2">
            <DialogDescription asChild>
              <div>
                <div>Toplam Soru: {exam.questions.length}</div>
                <div className="text-green-600">
                  Doğru Sayısı: {examResults.correct}
                </div>
                <div className="text-red-600">
                  Yanlış Sayısı: {examResults.incorrect}
                </div>
                <div>
                  Boş Sayısı:{" "}
                  {exam.questions.length -
                    (examResults.correct + examResults.incorrect)}
                </div>
                <div className="font-bold">
                  Toplam Puan: {examResults.totalPoints}
                </div>
                <div
                  className={`text-lg font-bold ${
                    examResults.passed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {examResults.passed
                    ? "Yazılı Sınavı Geçtiniz!"
                    : "Yazılı Sınavdan Kaldınız!"}
                </div>
              </div>
            </DialogDescription>
          </div>
          <DialogFooter>
            <Button onClick={handleDialogClose}>Tamam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
