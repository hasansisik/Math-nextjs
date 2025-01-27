'use client'

import { use, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import exams from '@/exams.json'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRouter } from 'next/navigation'

export default function ExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const router = useRouter()
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [examResults, setExamResults] = useState({
    correct: 0,
    incorrect: 0,
    totalPoints: 0,
    passed: false
  })
  
  const resolvedParams = use(params)
  const exam = exams.find(exam => exam.id === resolvedParams.examId)
  
  if (!exam) {
    return <div>Sınav bulunamadı</div>
  }

  const handleSubmit = () => {
    let correctCount = 0
    let incorrectCount = 0

    exam.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctCount++
      } else if (userAnswers[index]) { // Only count as incorrect if answered
        incorrectCount++
      }
    })

    const totalPoints = correctCount * 2
    const passed = totalPoints >= 70

    setExamResults({
      correct: correctCount,
      incorrect: incorrectCount,
      totalPoints,
      passed
    })

    setShowResults(true)
  }

  const handleDialogClose = () => {
    setShowResults(false)
    router.push('/exam')
  }

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

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
  }

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
                maxHeight: '200px'
              }}
            />
          </div>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const currentQuestion = exam.questions[currentQuestionIndex]

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <Button 
          variant="destructive" 
          onClick={handleSubmit}
        >
          Sınavı Bitir
        </Button>
      </div>
      
      <p className="mb-6 text-gray-600">{exam.desc}</p>

      <div className="mb-4">
        <span className="text-sm text-gray-500">
          Soru {currentQuestionIndex + 1} / {exam.questions.length}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {renderQuestionContent(currentQuestion.question)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={userAnswers[currentQuestionIndex] || ""}
            onValueChange={(value) => {
              setUserAnswers(prev => ({
                ...prev,
                [currentQuestionIndex]: value
              }))
            }}
          >
            {currentQuestion.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
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
          onClick={currentQuestionIndex === exam.questions.length - 1 ? handleSubmit : handleNext}
          variant={currentQuestionIndex === exam.questions.length - 1 ? "destructive" : "default"}
        >
          {currentQuestionIndex === exam.questions.length - 1 ? "Sınavı Bitir" : "Sonraki Soru"}
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

      <Dialog open={showResults} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sınav Sonucu</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-2">
            <DialogDescription asChild>
              <div>
                <div>Toplam Soru: {exam.questions.length}</div>
                <div className="text-green-600">Doğru Sayısı: {examResults.correct}</div>
                <div className="text-red-600">Yanlış Sayısı: {examResults.incorrect}</div>
                <div>Boş Sayısı: {exam.questions.length - (examResults.correct + examResults.incorrect)}</div>
                <div className="font-bold">Toplam Puan: {examResults.totalPoints}</div>
                <div className={`text-lg font-bold ${examResults.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {examResults.passed ? 'Yazılı Sınavı Geçtiniz!' : 'Yazılı Sınavdan Kaldınız!'}
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
  )
}
