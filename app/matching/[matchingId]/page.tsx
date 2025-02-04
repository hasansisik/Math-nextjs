"use client";
import { use } from "react";
import {
  AlarmClock,
  GalleryVerticalEnd,
  X,
  Loader2
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useState, useEffect, useMemo } from "react";
import useSound from "use-sound";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';
import { usePathname } from "next/navigation";
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

const dragStyles = `
  .draggable-element * {
    pointer-events: none;
  }
  .draggable-element:active {
    cursor: grabbing !important;
  }
`;

// Add style tag to head
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = dragStyles;
  document.head.appendChild(styleTag);
}

// Draggable component outside the main component
function Draggable({ id, children, disabled = false }: { id: string; children: React.ReactNode; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    disabled
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

// Droppable component outside the main component
function Droppable({ id, children }: { id: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const style = {
    color: isOver ? 'green' : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="min-h-[60px] border-2 border-dashed border-gray-300 rounded-lg p-2">
      {children}
    </div>
  );
}

export default function MatchingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const matchingId = pathname.split('/matching/')[1];
  const { questions, loading } = useSelector((state: RootState) => state.question);
  const dispatch = useDispatch<AppDispatch>();
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [matchingResults, setMatchingResults] = useState({
    correct: 0,
    incorrect: 0,
    empty: 0,
    totalPoints: 0,
  });
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [timerActive, setTimerActive] = useState(true);
  const [shuffledAnswers, setShuffledAnswers] = useState<Array<{index: number, value: string}>>([]);

  const [playPickupSound] = useSound("/pickup.mp3");
  const [playCorrectSound] = useSound("/drop.mp3");
  const [playWrongSound] = useSound("/fail.mp3");

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // Require the mouse to move 10px before activating
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Require the finger to be held down for 250ms before activating
        tolerance: 5, // Allow the finger to move 5px during the delay
      },
    })
  );

  const matchingData = useMemo(() => {
    if (!questions) return null;
    return questions.find(
      (item) => item.matching?._id === matchingId
    )?.matching;
  }, [questions, matchingId]);

  const currentQuestion = useMemo(() => {
    if (!matchingData?.questions) return null;
    return matchingData.questions[currentQuestionIndex];
  }, [matchingData, currentQuestionIndex]);

  useEffect(() => {
    dispatch(getQuestions());
  }, [dispatch]);

  useEffect(() => {
    if (currentQuestion) {
      setUserAnswers({});
      // Cevapları ve indexleri birlikte karıştır
      const shuffled = currentQuestion.correctAnswer
        .map((value: string, index: number) => ({
          index,
          value: value.toString()
        }))
        .sort(() => Math.random() - 0.5);
      setShuffledAnswers(shuffled);
    }
  }, [currentQuestion]);

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
    return () => clearInterval(interval);
  }, [timerActive]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center flex-col gap-2">
        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  if (!matchingData || !currentQuestion) {
    return (
      <div className="flex flex-1 items-center justify-center flex-col gap-2">
        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  function handleDragStart() {
    playPickupSound();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const answerId = active.id;
    const dropZoneId = over.id as string;
    
    // Extract the index from the dropZoneId (e.g., "drop-0" -> 0)
    const dropIndex = parseInt(dropZoneId.split('-')[1]);
    // Extract the answer index from the answerId
    const answerIndex = parseInt(answerId.toString());
    
    // Update matches state
    setUserAnswers(prev => ({
      ...prev,
      [dropZoneId]: answerId.toString()
    }));

    // Check if the answer is correct (indices match)
    const isCorrect = answerIndex === dropIndex;
    
    // Update match status
    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  }

  function checkResults() {
    let correct = 0;
    let incorrect = 0;
    let empty = 0;

    // Count correct, incorrect, and empty matches
    currentQuestion?.question?.forEach((_: any, index: number) => {
      const dropZoneId = `drop-${index}`;
      if (userAnswers[dropZoneId]) {
        const answerIndex = parseInt(userAnswers[dropZoneId]);
        if (index === answerIndex) {
          correct++;
        } else {
          incorrect++;
        }
      } else {
        empty++;
      }
    });

    // Her doğru 5 puan ve 3 yanlış 1 doğruyu götürür
    const canceledCorrects = Math.floor(incorrect / 3);
    const effectiveCorrects = Math.max(0, correct - canceledCorrects);
    const totalPoints = effectiveCorrects * 5;

    setMatchingResults({
      correct,
      incorrect,
      empty,
      totalPoints,
    });

    setShowResults(true);
  }

  function handleDialogClose() {
    setShowResults(false);
    router.push('/');
  }

  function handleConfirmationClose() {
    setShowConfirmation(false);
  }

  function handleFinishExam() {
    setShowConfirmation(true);
  }

  function handleConfirmFinish() {
    setShowConfirmation(false);
    checkResults();
    setShowResults(true);
  }

  const handleSubmit = () => {
    setTimerActive(false);
    handleFinishExam();
  };

  const handleNext = () => {
    if (currentQuestionIndex < matchingData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
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
      <div className="flex items-center justify-between">
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
          <p className="font-bold">{matchingData.title}</p>
          <p>{currentQuestionIndex + 1} ile {matchingData.questions.length}</p>
        </div>

        <h2 className="pt-5 font-bold text-lg">{matchingData.questions[currentQuestionIndex].title}</h2>
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
                {currentQuestion?.question?.map((question: string | number, qIndex: number) => (
                  <div key={qIndex} className="flex flex-col gap-2">
                    <div className="flex items-center justify-center border border-gray-300 bg-gray-100 p-2 rounded min-w-[200px]">
                      {renderQuestionContent(question.toString())}
                    </div>
                    <Droppable id={`drop-${qIndex}`}>
                      {userAnswers[`drop-${qIndex}`] && (
                        <div className={`p-2 rounded w-full text-center ${
                          parseInt(userAnswers[`drop-${qIndex}`]) === qIndex
                            ? 'bg-green-200'
                            : 'bg-red-200'
                        }`}>
                          {currentQuestion?.correctAnswer[parseInt(userAnswers[`drop-${qIndex}`])]}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-4 fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-lg z-50">
              {shuffledAnswers.map(({ index, value }) => (
                <Draggable key={index} id={index.toString()}>
                  <div
                    className={`flex items-center justify-center min-w-[200px] h-12 rounded
                      ${
                        Object.values(userAnswers).includes(index.toString())
                          ? "opacity-50"
                          : ""
                      }
                      ${
                        Object.entries(userAnswers).some(
                          ([key, value]) => value === index.toString() && parseInt(key.split('-')[1]) === index
                        )
                          ? "bg-green-100 font-bold"
                        : Object.values(userAnswers).includes(index.toString())
                          ? "bg-red-100 font-bold"
                          : "bg-blue-300 font-bold"
                      }
                    `}
                  >
                    {value}
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
              currentQuestionIndex === matchingData.questions.length - 1
                ? handleSubmit
                : handleNext
            }
            variant={
              currentQuestionIndex === matchingData.questions.length - 1
                ? "destructive"
                : "default"
            }
          >
            {currentQuestionIndex === matchingData.questions.length - 1
              ? "Sınavı Bitir"
              : "Sonraki Soru"}
          </Button>
        </div>

        <ScrollArea className="my-5">
          <div className="grid grid-cols-10 gap-2">
            {matchingData.questions.map((_: any, index: number) => (
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
                    {currentQuestion?.question?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Doğru Sayısı:</span>
                  <span className="font-medium text-green-600">{matchingResults.correct}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Yanlış Sayısı:</span>
                  <span className="font-medium text-red-600">{matchingResults.incorrect}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Boş Sayısı:</span>
                  <span className="font-medium text-gray-600">{matchingResults.empty}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-primary/10 px-4 rounded-lg">
                  <span className="font-bold">Toplam Puan:</span>
                  <span className="font-bold text-primary">{matchingResults.totalPoints}</span>
                </div>
              </div>
            </DialogDescription>
          </div>
          <DialogFooter>
            <Button onClick={handleDialogClose}>Tamam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmation} onOpenChange={handleConfirmationClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sınavı Bitir</DialogTitle>
            <DialogDescription>
              Sınavı bitirmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleConfirmationClose}>
              Hayır
            </Button>
            <Button onClick={handleConfirmFinish}>
              Evet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
