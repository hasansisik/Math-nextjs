"use client";
import matchingData from "@/matching.json";
import { AlarmClock, GalleryVerticalEnd, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useState, useEffect } from "react";
import useSound from "use-sound";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Draggable({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-move"
    >
      {children}
    </div>
  );
}

function Droppable({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-12 border-2 border-dashed rounded flex items-center justify-center min-w-[200px]
        ${isOver ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
    >
      {children}
    </div>
  );
}

export default function MatchingPage({
  params,
}: {
  params: Promise<{ matchingId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const match = matchingData.find((m) => m.id === resolvedParams.matchingId);

  // State tanımlamaları
  const [matches, setMatches] = useState<{ [key: string]: string }>({});
  const [questions] = useState(() =>
    match?.questions.map((q, index) => ({
      id: index.toString(),
      title: q.title,
      questions: q.question,
      correctAnswer: q.correctAnswer,
      dropZones: q.question.map((_, i) => `question-${index}-${i}`),
    })) || []
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [matchResults, setMatchResults] = useState({
    correct: 0,
    incorrect: 0,
    totalPoints: 0,
    passed: false
  });
  const [matchStatus, setMatchStatus] = useState<{ [key: string]: boolean }>({});
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [timerActive, setTimerActive] = useState(true);
  const [answers, setAnswers] = useState<string[]>([]);

  // Hook tanımlamaları
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  const [playPickupSound] = useSound("/pickup.mp3");
  const [playDropSound] = useSound("/drop.mp3");
  const [playFailSound] = useSound("/fail.mp3");

  // useEffect'ler buraya
  useEffect(() => {
    if (match) {
      setAnswers([...match.questions[currentQuestionIndex].correctAnswer]
        .sort(() => Math.random() - 0.5));
    }
  }, [match, currentQuestionIndex]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setTimer(prev => {
          const newSeconds = prev.seconds + 1;
          if (newSeconds === 60) {
            return {
              minutes: prev.minutes + 1,
              seconds: 0
            };
          }
          return {
            ...prev,
            seconds: newSeconds
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  if (!match) return <div>Yükleniyor...</div>;

  function handleDragStart() {
    playPickupSound();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const answerId = active.id as string;
    const dropZoneId = over.id as string;

    // Parse the dropZone id to get question index
    const [answerIndex] = dropZoneId.split('-').map(Number);
    
    // Check if the answer is correct
    const isCorrect = answers[parseInt(answerId)] === 
      questions[currentQuestionIndex].correctAnswer[answerIndex];

    if (isCorrect) {
      playDropSound();
    } else {
      playFailSound();
    }

    // Önceki eşleştirmeleri temizle
    const newMatches = { ...matches };
    Object.keys(newMatches).forEach((key) => {
      if (newMatches[key] === answerId) {
        delete newMatches[key];
      }
    });

    // Yeni eşleştirmeyi ekle
    newMatches[dropZoneId] = answerId;
    setMatches(newMatches);

    // Update match status
    const newMatchStatus = { ...matchStatus };
    newMatchStatus[dropZoneId] = isCorrect;
    setMatchStatus(newMatchStatus);
  }

  const handleNext = () => {
    if (currentQuestionIndex < match.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setTimerActive(false); // Timer'ı durdur
    let correctCount = 0;
    let incorrectCount = 0;

    questions[currentQuestionIndex].questions.forEach((_, index) => {
      const dropZoneId = questions[currentQuestionIndex].dropZones[index];
      const userAnswer = answers[parseInt(matches[dropZoneId] || '')];
      const correctAnswer = questions[currentQuestionIndex].correctAnswer[index];

      if (userAnswer === correctAnswer) {
        correctCount++;
      } else if (matches[dropZoneId]) {
        incorrectCount++;
      }
    });

    const totalPoints = (correctCount / questions[currentQuestionIndex].questions.length) * 100;
    const passed = totalPoints >= 70;

    setMatchResults({
      correct: correctCount,
      incorrect: incorrectCount,
      totalPoints,
      passed
    });

    setShowResults(true);
  };

  const handleDialogClose = () => {
    setTimer({ minutes: 0, seconds: 0 }); // Timer'ı sıfırla
    setShowResults(false);
    router.push('/');
  };

  const renderQuestionContent = (text: string) => {
    if (text.match(/^https?:\/\//)) {
      return (
        <div className="my-4 max-w-[300px] mx-auto">
          <img 
            src={text} 
            alt="Soru görseli" 
            className="w-full h-auto object-contain rounded-lg" 
            style={{
              maxHeight: '200px'
            }}
          />
        </div>
      );
    }
    return <span>{text}</span>;
  };

  return (
    <div className="flex flex-col m-5">
      <div className="flex items-center justify-between mx-3">
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
        <Button 
          variant="destructive" 
          onClick={handleSubmit}
        >
          Sınavı Bitir
        </Button>
      </div>
      
      <div className="flex flex-col mx-auto pt-10  gap-2">
        <div className="flex flex-row items-center gap-2">
          <div className="p-1 bg-primary rounded-sm">
            <GalleryVerticalEnd color="white" />
          </div>
          <p className="font-bold">{match.title}</p>
          <p>{currentQuestionIndex + 1} ile {match.questionsCount}</p>
        </div>

        <h2 className="pt-5 font-bold text-lg">{questions[currentQuestionIndex].title}</h2>
        <p className="text-neutral-500">
          Sürükle bırak yaparak sorular ve cevaplarını eşleştiriniz.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <div className="flex flex-col pt-10 gap-8">
            <div className="border-b pb-4">
              <div className="flex flex-wrap gap-4 mb-4">
                {questions[currentQuestionIndex].questions.map((question, qIndex) => (
                  <div key={qIndex} className="flex flex-col gap-2">
                    <div className="flex items-center justify-center border border-gray-300 bg-gray-100 p-2 rounded min-w-[200px]">
                      {renderQuestionContent(question)}
                    </div>
                    <Droppable id={questions[currentQuestionIndex].dropZones[qIndex]}>
                      {matches[questions[currentQuestionIndex].dropZones[qIndex]] && (
                        <div className={`p-2 rounded w-full text-center ${
                          matchStatus[questions[currentQuestionIndex].dropZones[qIndex]]
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}>
                          {answers[parseInt(matches[questions[currentQuestionIndex].dropZones[qIndex]])]}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 sticky bottom-4 bg-white p-4 border rounded shadow-lg">
              {answers.map((answer, index) => (
                <Draggable key={index} id={index.toString()}>
                  <div
                    className={`flex items-center justify-center min-w-[200px] h-12 rounded
                      ${
                        Object.values(matches).includes(index.toString())
                          ? "opacity-50 bg-gray-100"
                          : "bg-blue-100"
                      }
                    `}
                  >
                    {answer}
                  </div>
                </Draggable>
              ))}
            </div>
          </div>
        </DndContext>

        <div className="mt-6 flex w-full justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Önceki Soru
          </Button>
          <Button
            onClick={
              currentQuestionIndex === match.questions.length - 1
                ? handleSubmit
                : handleNext
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
            <DialogTitle>Eşleştirme Sonucu</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-2">
            <DialogDescription asChild>
              <div>
                <div>Toplam Soru: {questions[currentQuestionIndex].questions.length}</div>
                <div className="text-green-600">Doğru Sayısı: {matchResults.correct}</div>
                <div className="text-red-600">Yanlış Sayısı: {matchResults.incorrect}</div>
                <div>Boş Sayısı: {questions[currentQuestionIndex].questions.length - (matchResults.correct + matchResults.incorrect)}</div>
                <div className="font-bold">Başarı Yüzdesi: %{matchResults.totalPoints.toFixed(0)}</div>
                <div className={`text-lg font-bold ${matchResults.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {matchResults.passed ? 'Tebrikler, Başarılı Oldunuz!' : 'Üzgünüz, Başarısız Oldunuz!'}
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
