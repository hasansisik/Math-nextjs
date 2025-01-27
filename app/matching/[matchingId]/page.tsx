'use client';

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
} from '@dnd-kit/core';
import { useState } from 'react';
import useSound from 'use-sound';

function Draggable({ id, children }: { id: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

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

function Droppable({ id, children }: { id: string, children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`h-12 border-2 border-dashed rounded flex items-center justify-center min-w-[200px]
        ${isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
    >
      {children}
    </div>
  );
}

export default function MatchingPage({
  params,
}: {
  params: { matchingId: string };
}) {
  const { matchingId } = params;
  const match = matchingData.find((m) => m.id === matchingId);

  if (!match) return <div>Yükleniyor...</div>;

  const [matches, setMatches] = useState<{ [key: string]: string }>({});
  const [questions] = useState(() =>
    match.questions.map((q) => ({
      id: q.id,
      questions: q.question,
      dropZones: q.question.map((_, i) => `${q.id}-${i}`),
    }))
  );
  const [answers] = useState([...match.questions[0].correctAnswer].sort(() => Math.random() - 0.5));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const [playPickupSound] = useSound('/pickup.mp3');
  const [playDropSound] = useSound('/drop.mp3');

  function handleDragStart() {
    playPickupSound();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    playDropSound();
    
    const answerId = active.id as string;
    const dropZoneId = over.id as string;

    // Önceki eşleştirmeleri temizle
    const newMatches = { ...matches };
    Object.keys(newMatches).forEach(key => {
      if (newMatches[key] === answerId) {
        delete newMatches[key];
      }
    });

    // Yeni eşleştirmeyi ekle
    newMatches[dropZoneId] = answerId;
    setMatches(newMatches);
  }

  return (
    <div className="flex flex-col m-5">
      <div className="flex items-center mx-3">
        <div className="p-2 bg-slate-100 mr-3 rounded-sm">
          <X />
        </div>
        <AlarmClock color="gray" className="mr-2" />
        <div className="flex items-center gap-1">
          <span className="mr-2">Time left:</span>
          <span className="px-3 py-1 bg-black text-white rounded-sm">01</span>
          <span>:</span>
          <span className="px-3 py-1 bg-black text-white rounded-sm">60</span>
        </div>
      </div>
      <div className="flex flex-col pt-10 items-center gap-8">
        <div className="flex flex-row items-start gap-2">
          <div className="p-1 bg-black rounded-sm">
            <GalleryVerticalEnd color="white" />
          </div>
          <h1></h1>
          <p className="font-bold">{match.title}</p>
          <p>1 of 30</p>
        </div>

        <h2 className="pt-5 font-bold text-lg">{questions[0].content}</h2>
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
            {questions.map((questionSet) => (
              <div key={questionSet.id} className="border-b pb-4">
                <div className="flex flex-wrap gap-4 mb-4">
                  {questionSet.questions.map((question, qIndex) => (
                    <div key={qIndex} className="flex flex-col gap-2">
                      <div className="flex items-center justify-center border border-gray-300 bg-gray-100 p-2 rounded min-w-[200px]">
                        {question}
                      </div>
                      <Droppable id={questionSet.dropZones[qIndex]}>
                        {matches[questionSet.dropZones[qIndex]] && (
                          <div className="bg-green-100 p-2 rounded w-full text-center">
                            {answers[parseInt(matches[questionSet.dropZones[qIndex]])]}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 mt-4 sticky bottom-4 bg-white p-4 border rounded shadow-lg">
              {answers.map((answer, index) => (
                <Draggable key={index} id={index.toString()}>
                  <div
                    className={`flex items-center justify-center min-w-[200px] h-12 rounded
                      ${Object.values(matches).includes(index.toString()) 
                        ? 'opacity-50 bg-gray-100' 
                        : 'bg-blue-100'}
                    `}
                  >
                    {answer}
                  </div>
                </Draggable>
              ))}
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
