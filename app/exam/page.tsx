'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import exams from '@/exams.json'

export default function ExamPage() {
  const router = useRouter()

  const handleExamClick = (examId: string) => {
    router.push(`/exam/${examId}`)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Sınavlar</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <Card 
            key={exam.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleExamClick(exam.id)}
          >
            <CardHeader>
              <CardTitle>{exam.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{exam.desc}</p>
              <p className="text-sm text-gray-500 mt-2">
                Soru Sayısı: {exam.questions.length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
