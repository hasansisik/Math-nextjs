"use client";
import { use, Usable } from "react";
import placementData from "@/placement.json";
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
import { useRouter } from "next/navigation";
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
      className={`h-12 border-2 border-dashed rounded-full flex items-center justify-center min-w-[200px]
        ${isOver ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
    >
      {children}
    </div>
  );
}

const MatchingPage = ({ params }: { params: Usable<{ placementId: string }> }) => {
  const router = useRouter();
  const unwrappedParams = use(params);
  const match = placementData.find((m) => m.id === unwrappedParams.placementId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [matchResults, setMatchResults] = useState({
    correct: 0,
    incorrect: 0,
    totalPoints: 0,
    passed: false,
  });
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [timerActive, setTimerActive] = useState(true);
  const [droppedItems, setDroppedItems] = useState<{ [key: string]: string }>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  const [playPickupSound] = useSound("/pickup.mp3");
  const [playDropSound] = useSound("/drop.mp3");

  // Items için useEffect
  useEffect(() => {
    if (match) {
      const shuffledItems = [...match.questions[currentQuestionIndex].correctAnswer]
        .map(String)
        .sort(() => 0.5 - Math.random());
      setItems(shuffledItems);
    }
  }, [match, currentQuestionIndex]);

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

  if (!match) return <div>Yükleniyor...</div>;

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
    playDropSound();
  }

  const handleSubmit = () => {
    setTimerActive(false);
    const currentQuestion = match.questions[currentQuestionIndex];
    const correctOrder = currentQuestion.correctAnswer.map(String);

    const isCorrect =
      currentQuestion.type === ">"
        ? JSON.stringify(items) === JSON.stringify(correctOrder)
        : JSON.stringify(items) === JSON.stringify([...correctOrder].reverse());

    setMatchResults({
      correct: isCorrect ? 1 : 0,
      incorrect: isCorrect ? 0 : 1,
      totalPoints: isCorrect ? 100 : 0,
      passed: isCorrect,
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
            <GalleryVerticalEnd color="white" />
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <div className="flex flex-col pt-10 gap-8">
            <div className="border-b pb-4">
              {/* Yuva alanı */}
              <div className="flex flex-wrap gap-4 mb-4">
                {match.questions[currentQuestionIndex].correctAnswer.map(
                  (correctAnswer, index) => (
                    <div key={index} className="flex items-center">
                      <Droppable id={String(correctAnswer)}>
                        {droppedItems[String(correctAnswer)] && (
                          <div
                            className={`p-2 w-full h-full text-center rounded-full
                        ${
                          droppedItems[String(correctAnswer)] ===
                          String(correctAnswer)
                            ? "bg-green-200"
                            : "bg-red-200"
                        }`}
                          >
                            {droppedItems[String(correctAnswer)]}
                          </div>
                        )}
                      </Droppable>
                      {index <
                        match.questions[currentQuestionIndex].correctAnswer
                          .length -
                          1 && (
                        <div className="text-2xl font-bold text-gray-500 mx-2">
                          {match.questions[currentQuestionIndex].type}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Taşınabilir öğeler */}
            <div className="flex flex-wrap justify-center items-center gap-4 mt-4 sticky bottom-4 bg-white p-4 border rounded shadow-lg w-full">
              {items.map((item) => (
                <Draggable key={item} id={item}>
                  <div
                    className={`
                    flex items-center justify-center w-[200px] h-12 rounded-full
                    ${
                      Object.values(droppedItems).includes(item)
                        ? "opacity-50"
                        : ""
                    }
                    ${
                      Object.entries(droppedItems).some(
                        ([key, value]) => value === item && key === item
                      )
                        ? "bg-green-200" // doğru yere yerleştirilmiş
                        : Object.values(droppedItems).includes(item)
                        ? "bg-red-200"   // yanlış yere yerleştirilmiş
                        : "bg-blue-100"  // henüz yerleştirilmemiş
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

export default MatchingPage;
