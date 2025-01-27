'use client';
import { useState } from 'react';
import categories from './data/categories.json';
import exams from '@/exams.json';
import lessonData from '@/lesson.json';
import questions from '@/query.json';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const router = useRouter();

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Tab Bar */}
      <div className="border-b">
        <nav className="mx-auto px-7 pt-4">
          <ul className="flex space-x-8 overflow-x-auto">
            {categories.categories.map((category) => (
              <li key={category.id}>
                <button 
                  onClick={() => handleFilterChange(category.filter)}
                  className={`inline-flex items-center px-1 pt-1 pb-2 text-sm font-medium border-b-2 ${
                    selectedFilter === category.filter
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-800 hover:text-black hover:border-black dark:text-gray-800 dark:hover:text-gray-800'
                  }`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mevcut içerik */}
      <div className="flex p-8">
        <main className="flex flex-col items-center gap-8 w-full max-w-4xl">
          {selectedFilter === 'exam' && (
            <div className="flex flex-col sm:flex-row gap-6 w-full">
              {/* Sınavlar Kartı */}
              {exams.map((exam) => (
                <Card 
                  key={exam.id} 
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/exam/${exam.id}`)}
                >
                  <CardHeader>
                    <CardTitle>{exam.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{exam.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {selectedFilter === 'lesson' && (
            <div className="flex flex-col sm:flex-row gap-6 w-full">
              {/* Dersler Kartı */}
              {lessonData.map((lesson) => (
                <Card 
                  key={lesson.id} 
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/lesson/${lesson.id}`)}
                >
                  <CardHeader>
                    <CardTitle>{lesson.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{lesson.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {selectedFilter === 'query' && (
            <div className="flex flex-col sm:flex-row gap-6 w-full">
              {/* Levhalar Kartı */}
              {questions.map((question, index) => (
                <Card 
                  key={index} 
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/query/${index}`)}
                >
                  <CardHeader>
                    <CardTitle>Levha {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img src={question.image} alt="Question" className="w-full h-32 object-cover mb-2" />
                    <p className="text-gray-600">{question.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {selectedFilter === 'all' && (
            <div className="flex flex-col sm:flex-row gap-6 w-full">
              {/* Tüm Kartlar */}
              {exams.map((exam) => (
                <Card 
                  key={exam.id} 
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/exam/${exam.id}`)}
                >
                  <CardHeader>
                    <CardTitle>{exam.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{exam.desc}</p>
                  </CardContent>
                </Card>
              ))}
              {lessonData.map((lesson) => (
                <Card 
                  key={lesson.id} 
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/lesson/${lesson.id}`)}
                >
                  <CardHeader>
                    <CardTitle>{lesson.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{lesson.desc}</p>
                  </CardContent>
                </Card>
              ))}
              {questions.map((question, index) => (
                <Card 
                  key={index} 
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/query/${index}`)}
                >
                  <CardHeader>
                    <CardTitle>Levha {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img src={question.image} alt="Question" className="w-full h-32 object-cover mb-2" />
                    <p className="text-gray-600">{question.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
