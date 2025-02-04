"use client";
import { AlarmClock, AlignHorizontalDistributeStart, X ,Loader2} from "lucide-react";
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
import { useState, useEffect } from "react";
import useSound from "use-sound";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter, usePathname } from "next/navigation";
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

function Draggable({
  id,
  children,
  disabled = false,
}: {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    disabled,
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

function Droppable({ id, children }: { id: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-12 border-2 border-dashed rounded-full flex items-center justify-center min-w-[200px]
        ${isOver ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
    >
      {children}
    </div>
  );
}

const PlacementPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const placementId = pathname.split('/placement/')[1];
  const { questions, loading } = useSelector((state: RootState) => state.question);
  const dispatch = useDispatch<AppDispatch>();
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [timerActive, setTimerActive] = useState(true);
  const [items, setItems] = useState<string[]>([]);
  const [matchResults, setMatchResults] = useState({
    correct: 0,
    incorrect: 0,
    empty: 0,
    totalPoints: 0,
  });
  const [droppedItems, setDroppedItems] = useState<{ [key: string]: string }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const placement = questions?.find((q: any) => q.placement?._id === placementId)?.placement;

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
  const [playPickupSound] = useSound("/pickup.mp3");
  const [playDropSound] = useSound("/drop.mp3");
  const [playFailSound] = useSound("/fail.mp3");

  useEffect(() => {
    dispatch(getQuestions());
  }, [dispatch]);

  // Items için useEffect
  useEffect(() => {
    if (placement) {
      const shuffledItems = [...placement.questions[currentQuestionIndex].correctAnswer]
        .map(value => value.toString())
        .sort(() => 0.5 - Math.random());
      setItems(shuffledItems);
      setDroppedItems({}); // Reset droppedItems when question changes
    }
  }, [placement, currentQuestionIndex]);

  // Timer için useEffect
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center flex-col gap-2">
        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  if (!placement) {
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

    const activeId = active.id as string;
    const overId = over.id as string;

    // Yeni konuma yerleştir
    setDroppedItems((prev) => ({
      ...prev,
      [overId]: activeId,
    }));
    
    // Doğru yerleştirme durumunda drop, yanlış yerleştirme durumunda fail sesi çal
    if (activeId === overId) {
      playDropSound();
    } else {
      playFailSound();
    }
  }

  const handleSubmit = () => {
    setTimerActive(false);
    const currentQuestion = placement.questions[currentQuestionIndex];
    const correctOrder = currentQuestion.correctAnswer.map(value => value.toString());
    
    let correct = 0;
    let incorrect = 0;
    let empty = 0;

    // Check each position for correctness
    correctOrder.forEach((correctAnswer: string | number) => {
      const droppedItem = droppedItems[correctAnswer.toString()];
      if (droppedItem) {
        if (droppedItem === correctAnswer.toString()) {
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

    setMatchResults({
      correct,
      incorrect,
      empty,
      totalPoints,
    });

    setShowResults(true);
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
            <AlignHorizontalDistributeStart color="white" />
          </div>
          <p className="font-bold">{placement.title}</p>
          <p>
            {currentQuestionIndex + 1} ile {placement.questions.length}
          </p>
        </div>

        <h2 className="pt-5 font-bold text-lg">
          {placement.questions[currentQuestionIndex].title}
        </h2>
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
              {/* Yuva alanı */}
              <div className="flex flex-wrap sm:justify-start justify-center gap-4 mb-4">
                {placement.questions[currentQuestionIndex].correctAnswer.map(
                  (correctAnswer: string | number, index: number) => (
                    <div key={index} className="flex items-center">
                      <Droppable id={correctAnswer.toString()}>
                        {droppedItems[correctAnswer.toString()] && (
                          <div
                            className={`p-2 w-full h-full text-center rounded-full
                        ${
                          droppedItems[correctAnswer.toString()] ===
                          correctAnswer.toString()
                            ? "bg-green-200"
                            : "bg-red-200"
                        }`}
                          >
                            {droppedItems[correctAnswer.toString()]}
                          </div>
                        )}
                      </Droppable>
                      {index <
                        placement.questions[currentQuestionIndex].correctAnswer
                          .length -
                          1 && (
                        <div className="text-2xl font-bold text-gray-500 mx-2">
                          {placement.questions[currentQuestionIndex].type}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Taşınabilir öğeler */}
            <div className="flex flex-wrap justify-center items-center gap-4 mt-4 sticky bottom-4 bg-white p-4 border rounded shadow-lg w-full">
              {items.map((item, index: number) => (
                <Draggable key={item} id={item.toString()}>
                  <div
                    className={`
                    flex items-center justify-center w-[200px] h-12 rounded-full
                    ${
                      Object.values(droppedItems).includes(item.toString())
                        ? "opacity-50"
                        : ""
                    }
                    ${
                      Object.entries(droppedItems).some(
                        ([key, value]) => value === item.toString() && key === item.toString()
                      )
                        ? "bg-green-200 font-bold" 
                        : Object.values(droppedItems).includes(item.toString())
                        ? "bg-red-200 font-bold"   
                        : "bg-orange-300 font-bold" 
                    }
                  `}
                  >
                    {item}
                  </div>
                </Draggable>
              ))}
            </div>
          </div>
        </DndContext>

        <div className="mt-6 flex w-full justify-between">
          <Button
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            Önceki Soru
          </Button>
          <Button
            onClick={
              currentQuestionIndex === placement.questions.length - 1
                ? handleSubmit
                : () => setCurrentQuestionIndex((prev) => prev + 1)
            }
            variant={
              currentQuestionIndex === placement.questions.length - 1
                ? "destructive"
                : "default"
            }
          >
            {currentQuestionIndex === placement.questions.length - 1
              ? "Sınavı Bitir"
              : "Sonraki Soru"}
          </Button>
        </div>

        <ScrollArea className="my-5">
          <div className="grid grid-cols-10 gap-2">
            {placement.questions.map((_: any, index: number) => (
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

      <Dialog open={showResults} onOpenChange={setShowResults}>
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
                    {placement.questions.length}
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
            <Button onClick={() => router.push("/")}>Ana Sayfaya Dön</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlacementPage;
