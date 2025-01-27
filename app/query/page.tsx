'use client';

import * as React from 'react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import questions from './query.json';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function QueryPage() {
  const [showAnswer, setShowAnswer] = useState(false);

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <div className="container mx-auto py-8 px-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Levhalar</h1>
      <div className="flex justify-center items-center">
        <Carousel className="w-full max-w-sm">
          <CarouselContent>
            {questions.map((question, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <div className="text-center mb-4">
                        <p>{index + 1} / {questions.length}</p>
                      </div>
                      <img src={question.image} alt="Question" className="w-1/2 mb-4" />
                      <button onClick={toggleAnswer} className="px-5 py-2 rounded-full bg-purple-500 hover:bg-purple-600 mb-4">
                        {showAnswer ? <EyeOff size={24} className="text-white" /> : <Eye size={24} className="text-white" />}
                      </button>
                      {showAnswer && (
                        <div className="text-center p-2 rounded bg-green-600 w-full">
                          <p className="text-white">{question.text}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}
