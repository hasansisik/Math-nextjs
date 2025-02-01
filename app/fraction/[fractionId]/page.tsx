"use client";
import { Usable } from "react";
import { AlarmClock, AlignVerticalJustifyCenter, X,Loader2 } from "lucide-react";
import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter, usePathname } from "next/navigation";
import useSound from "use-sound";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getQuestions } from "@/redux/actions/questionActions";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

const FractionPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const fractionId = pathname.split('/fraction/')[1];
  const { questions } = useSelector((state: RootState) => state.question);
  const dispatch = useDispatch<AppDispatch>();

  const fractionData = questions?.find((q: any) => 
    q.fraction && q.fraction._id === fractionId
  )?.fraction;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [matchResults, setMatchResults] = useState({
    correct: 0,
    incorrect: 0,
    empty: 0,
    totalPoints: 0,
  });
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [timerActive, setTimerActive] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: { numerator: string; denominator: string } }>({});
  const [playCorrectSound] = useSound("/drop.mp3");
  const [playWrongSound] = useSound("/pickup.mp3");

  useEffect(() => {
    dispatch(getQuestions());
  }, [dispatch]);

  // Timer effect
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

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerActive]);

  if (!fractionData) {
    return (
      <div className="flex flex-1 items-center justify-center flex-col gap-2">
        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
        <span>Yükleniyor...</span>
      </div>
    );  
  }

  const handleAnswerChange = (index: number, part: string, value: string) => {
    const newAnswers = {
      ...userAnswers,
      [index]: {
        ...userAnswers[index],
        [part]: value
      }
    };
    setUserAnswers(newAnswers);

    // Get correct answer
    const answer = fractionData.questions[currentQuestionIndex].question[index].answer;
    const [correctNumerator, correctDenominator] = answer.split('/');
    
    // Check if the current input matches the correct answer
    if (part === "numerator" && value === correctNumerator) {
      playCorrectSound();
    } else if (part === "denominator" && value === correctDenominator) {
      playCorrectSound();
    } else if (value !== "") {
      playWrongSound();
    }
  };

  const getInputStyle = (index: number, part: "numerator" | "denominator") => {
    const answer = fractionData.questions[currentQuestionIndex].question[index].answer;
    const [correctNumerator, correctDenominator] = answer.split('/');
    const userAnswer = userAnswers[index]?.[part];

    if (!userAnswer) return "border-gray-400";

    if (part === "numerator") {
      return userAnswer === correctNumerator ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50";
    } else {
      return userAnswer === correctDenominator ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50";
    }
  };

  const handleSubmit = () => {
    setTimerActive(false);

    let correct = 0;
    let incorrect = 0;
    let empty = 0;
    const totalQuestions = fractionData.questions.reduce((acc, q) => acc + q.question.length, 0);

    fractionData.questions.forEach((question) => {
      question.question.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const [correctNumerator, correctDenominator] = q.answer.split('/');
        
        if (userAnswer?.numerator || userAnswer?.denominator) {
          if (userAnswer.numerator === correctNumerator && userAnswer.denominator === correctDenominator) {
            correct++;
          } else {
            incorrect++;
          }
        } else {
          empty++;
        }
      });
    });

    // Her doğru 5 puan, her 3 yanlış 1 doğruyu götürür
    const canceledCorrects = Math.floor(incorrect / 3);
    const effectiveCorrects = Math.max(0, correct - canceledCorrects);
    const totalPoints = effectiveCorrects * 5;
    
    setMatchResults({
      correct,
      incorrect,
      empty,
      totalPoints,
    });

    setShowResults(true);
  };

  const handleDialogClose = () => {
    setTimer({ minutes: 0, seconds: 0 });
    setShowResults(false);
    router.push("/");
  };

  return (
    <div className="flex flex-col m-5">
      <div className="flex items-center justify-between mx-3">
        <div className="flex items-center flex-row">
          <div
            className="p-2 bg-slate-100 mr-3 rounded-sm cursor-pointer hover:bg-slate-200"
            onClick={() => router.push("/")}
          >
            <X />
          </div>
          <AlarmClock color="gray" className="mr-2" />
          <div className="flex items-center gap-1">
            <span className="mr-2">Geçen Süre:</span>
            <span className="px-3 py-1 bg-primary text-white rounded-sm">
              {String(timer.minutes).padStart(2, "0")}
            </span>
            <span>:</span>
            <span className="px-3 py-1 bg-primary text-white rounded-sm">
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
          <div className="p-1 bg-primary rounded-sm">
            <AlignVerticalJustifyCenter color="white" />
          </div>
          <p className="font-bold">{fractionData.title}</p>
          <p>
            {currentQuestionIndex + 1} ile {fractionData.questions.length}
          </p>
        </div>

        <h2 className="pt-5 font-bold text-lg">
          {fractionData.questions[currentQuestionIndex].title}
        </h2>
        <p className="text-neutral-500">
          Sürükle bırak yaparak sorular ve cevaplarını eşleştiriniz.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {fractionData.questions[currentQuestionIndex].question.map((q, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border shadow-sm flex items-center justify-center h-[200px]">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-xl font-medium">{q.parts.A}</span>
                  <div className="flex flex-col items-center mx-1">
                    <span className="text-lg">{q.parts.C}</span>
                    <div className="w-6 h-0.5 bg-black my-1"></div>
                    <span className="text-lg">{q.parts.B}</span>
                  </div>
                </div>
                <span className="mx-3 text-xl">=</span>
                <div className="flex flex-col items-center">
                  <input
                    type="text"
                    className={`w-16 h-10 border-2 border-dashed rounded-lg text-center text-lg focus:ring-2 focus:ring-primary/20 transition-colors ${getInputStyle(index, "numerator")}`}
                    value={userAnswers[index]?.numerator || ""}
                    onChange={(e) => handleAnswerChange(index, "numerator", e.target.value)}
                    placeholder="?"
                  />
                  <div className="w-16 h-0.5 bg-black my-2"></div>
                  <input
                    type="text"
                    className={`w-16 h-10 border-2 border-dashed rounded-lg text-center text-lg focus:ring-2 focus:ring-primary/20 transition-colors ${getInputStyle(index, "denominator")}`}
                    value={userAnswers[index]?.denominator || ""}
                    onChange={(e) => handleAnswerChange(index, "denominator", e.target.value)}
                    placeholder="?"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex w-full justify-between">
          <Button
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            Önceki Soru
          </Button>
          <Button
            onClick={
              currentQuestionIndex === fractionData.questions.length - 1
                ? handleSubmit
                : () => setCurrentQuestionIndex((prev) => prev + 1)
            }
            variant={
              currentQuestionIndex === fractionData.questions.length - 1
                ? "destructive"
                : "default"
            }
          >
            {currentQuestionIndex === fractionData.questions.length - 1
              ? "Sınavı Bitir"
              : "Sonraki Soru"}
          </Button>
        </div>

        <ScrollArea className="my-5">
          <div className="grid grid-cols-10 gap-2">
            {fractionData.questions.map((_, index) => (
              <Button
                key={index}
                variant="outline"
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
            <DialogDescription className="text-primary font-medium mt-2">
              Doğrular 5 puan ve 3 yanlış 1 doğruyu götürüyor
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 space-y-3">
            <DialogDescription asChild>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Toplam Soru:</span>
                  <span className="font-medium">
                    {fractionData.questions.reduce((acc, q) => acc + q.question.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Doğru Sayısı:</span>
                  <span className="font-medium text-green-600">{matchResults.correct}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Yanlış Sayısı:</span>
                  <span className="font-medium text-red-600">{matchResults.incorrect}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Boş Sayısı:</span>
                  <span className="font-medium text-gray-600">{matchResults.empty}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-primary/10 px-4 rounded-lg">
                  <span className="font-bold">Toplam Puan:</span>
                  <span className="font-bold text-primary">{matchResults.totalPoints}</span>
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
};

export default FractionPage;
