"use client";
import { AlarmClock, AlignHorizontalSpaceAround, X,Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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

interface Question {
  optionStart: string;
  optionEnd: string;
  answer: string;
}

interface SpaceQuestion {
  title: string;
  question: Question[];
}

interface Space {
  _id: string;
  questions: SpaceQuestion[];
  title: string;
}

interface QuestionData {
  space: Space;
}

const SpacePage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const spaceId = pathname.split('/space/')[1];
  const { questions } = useSelector((state: RootState) => state.question);
  const dispatch = useDispatch<AppDispatch>();

  const spaceData = questions?.find((q: QuestionData) => 
    q.space && q.space._id === spaceId
  )?.space;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [results, setResults] = useState({
    correct: 0,
    incorrect: 0,
    empty: 0,
  });
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [timerActive, setTimerActive] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [playCorrectSound] = useSound("/drop.mp3");
  const [playWrongSound] = useSound("/pickup.mp3");

  useEffect(() => {
    dispatch(getQuestions());
  }, [dispatch]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          const newSeconds = prevTimer.seconds + 1;
          if (newSeconds === 60) {
            return {
              minutes: prevTimer.minutes + 1,
              seconds: 0,
            };
          }
          return {
            ...prevTimer,
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

  if (!spaceData) {
    return (
      <div className="flex flex-1 items-center justify-center flex-col gap-2">
        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
        <span>Yükleniyor...</span>
      </div>
    );  
  }

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = {
      ...userAnswers,
      [index]: value
    };
    setUserAnswers(newAnswers);

    const answer = spaceData.questions[currentQuestionIndex].question[index].answer;
    
    if (value === answer) {
      playCorrectSound();
    } else if (value !== "") {
      playWrongSound();
    }
  };

  const getInputStyle = (index: number) => {
    const answer = spaceData.questions[currentQuestionIndex].question[index].answer;
    const userAnswer = userAnswers[index];

    if (!userAnswer) return "border-gray-400";
    return userAnswer === answer ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50";
  };

  const handleSubmit = () => {
    setTimerActive(false);
    checkResults();
    setShowResults(true);
  };

  const checkResults = () => {
    let correct = 0;
    let incorrect = 0;
    let empty = 0;

    spaceData.questions.forEach((questionGroup: SpaceQuestion) => {
      questionGroup.question.forEach((q: Question) => {
        const userAnswer = userAnswers[correct + incorrect + empty];
        const correctAnswer = q.answer;

        if (userAnswer) {
          if (userAnswer === correctAnswer) {
            correct++;
          } else {
            incorrect++;
          }
        } else {
          empty++;
        }
      });
    });

    setResults({
      correct,
      incorrect,
      empty,
    });
  };

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
            onClick={() => setShowConfirmation(true)}
          >
            Sınavı Bitir
          </Button>
        </div>
      </div>

      <div className="flex flex-col mx-auto pt-10 gap-2">
        <div className="flex flex-row items-center gap-2">
          <div className="p-1 bg-primary rounded-sm">
            <AlignHorizontalSpaceAround color="white" />
          </div>
          <p className="font-bold">{spaceData.title}</p>
          <p>
            {currentQuestionIndex + 1} ile {spaceData.questions.length}
          </p>
        </div>

        <h2 className="pt-5 font-bold text-lg">
          {spaceData.questions[currentQuestionIndex].title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {spaceData.questions[currentQuestionIndex].question.map((q: Question, index: number) => (
            <div key={index} className="bg-white p-6 rounded-lg border shadow-sm flex items-center justify-center">
              <div className="flex items-center gap-2">
                <span>{q.optionStart}</span>
                <input
                  type="text"
                  className={`w-20 h-10 border-2 border-dashed rounded-lg text-center text-lg focus:ring-2 focus:ring-primary/20 transition-colors ${getInputStyle(index)}`}
                  value={userAnswers[index] || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="?"
                />
                <span>{q.optionEnd}</span>
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
              currentQuestionIndex === spaceData.questions.length - 1
                ? () => setShowConfirmation(true)
                : () => setCurrentQuestionIndex((prev) => prev + 1)
            }
            variant={
              currentQuestionIndex === spaceData.questions.length - 1
                ? "destructive"
                : "default"
            }
          >
            {currentQuestionIndex === spaceData.questions.length - 1
              ? "Sınavı Bitir"
              : "Sonraki Soru"}
          </Button>
        </div>

        <ScrollArea className="my-5">
          <div className="grid grid-cols-10 gap-2">
            {spaceData.questions.map((_: any, index: number) => (
              <Button
                key={index}
                variant={currentQuestionIndex === index ? "default" : "outline"}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sınav Sonucu</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex flex-col">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Toplam Soru:</span>
                  <span className="font-medium">
                    {spaceData.questions.reduce((acc: number, q: SpaceQuestion) => acc + q.question.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Doğru:</span>
                  <span className="font-medium text-green-600">
                    {results.correct}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Yanlış:</span>
                  <span className="font-medium text-red-600">
                    {results.incorrect}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Boş:</span>
                  <span className="font-medium text-gray-600">{results.empty}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => router.push('/')}>Tamam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sınavı bitirmek istediğinize emin misiniz?</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              Evet, Bitir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpacePage;
