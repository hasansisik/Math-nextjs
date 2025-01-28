"use client";
import { Usable } from "react";
import fractionData from "@/fraction.json";
import { AlarmClock, AlignVerticalJustifyCenter, X } from "lucide-react";
import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import useSound from "use-sound";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FractionPage = ({ params }: { params: Usable<{ fractionId: string }> }) => {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [matchResults, setMatchResults] = useState({
    correct: 0,
    incorrect: 0,
    totalPoints: 0,
    passed: false,
  });
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [timerActive, setTimerActive] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: { numerator: string; denominator: string } }>({});
  const [playCorrectSound] = useSound("/drop.mp3");
  const [playWrongSound] = useSound("/pickup.mp3");

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

    return () => clearInterval(interval);
  }, [timerActive]);

  const match = fractionData.find((m) => m.id === unwrappedParams.fractionId);
  
  // Redirect if match is not found
  if (!match) {
    router.push('/');
    return null;
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
    const answer = match.questions[currentQuestionIndex].question[index].answer;
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
    const answer = match.questions[currentQuestionIndex].question[index].answer;
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

    // Calculate results
    let correct = 0;
    let incorrect = 0;

    match.questions.forEach((question) => {
      question.question.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const [correctNumerator, correctDenominator] = q.answer.split('/');
        
        if (userAnswer) {
          if (userAnswer.numerator === correctNumerator && userAnswer.denominator === correctDenominator) {
            correct++;
          } else {
            incorrect++;
          }
        }
      });
    });

    const totalQuestions = match.questions.reduce((acc, q) => acc + q.question.length, 0);
    const totalPoints = (correct / totalQuestions) * 100;
    
    setMatchResults({
      correct,
      incorrect,
      totalPoints,
      passed: totalPoints >= 70 // Assuming 70% is the passing threshold
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
          <p className="font-bold">{match.title}</p>
          <p>
            {currentQuestionIndex + 1} ile {match.questionsCount}
          </p>
        </div>

        <h2 className="pt-5 font-bold text-lg">
          {match.questions[currentQuestionIndex].title}
        </h2>
        <p className="text-neutral-500">
          Sürükle bırak yaparak sorular ve cevaplarını eşleştiriniz.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {match.questions[currentQuestionIndex].question.map((q, index) => (
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
              currentQuestionIndex === match.questions.length - 1
                ? handleSubmit
                : () => setCurrentQuestionIndex((prev) => prev + 1)
            }
            variant={
              currentQuestionIndex === match.questions.length - 1
                ? "destructive"
                : "default"
            }
          >
            {currentQuestionIndex === match.questions.length - 1
              ? "Sınavı Bitir"
              : "Sonraki Soru"}
          </Button>
        </div>

        <ScrollArea className="my-5">
          <div className="grid grid-cols-10 gap-2">
            {match.questions.map((_, index) => (
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
          </DialogHeader>
          <div className="pt-4 space-y-2">
            <DialogDescription asChild>
              <div>
                <div>Toplam Soru: 1</div>
                <div className="text-green-600">
                  Doğru Sayısı: {matchResults.correct}
                </div>
                <div className="text-red-600">
                  Yanlış Sayısı: {matchResults.incorrect}
                </div>
                <div>Boş Sayısı: 0</div>
                <div className="font-bold">
                  Başarı Yüzdesi: %{matchResults.totalPoints.toFixed(0)}
                </div>
                <div
                  className={`text-lg font-bold ${
                    matchResults.passed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {matchResults.passed
                    ? "Tebrikler, Başarılı Oldunuz!"
                    : "Üzgünüz, Başarısız Oldunuz!"}
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
