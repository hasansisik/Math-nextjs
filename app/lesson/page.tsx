'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import lessonData from '../../lesson.json';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LessonPage() {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const router = useRouter();

  const handleProductClick = (lessonId: number, productFile: string) => {
    router.push(`/lesson/${lessonId}?file=${productFile}`);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Dersler</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {lessonData.map((lesson) => (
          <div key={lesson.id} className="space-y-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => handleProductClick(lesson.id, lesson.file)}
            >
              <CardHeader className="p-0">
                <CardTitle className="mb-2 p-4">{lesson.title}</CardTitle>
                <p className="text-gray-600 px-4">{lesson.desc}</p>
              </CardHeader>
              <CardContent className="p-0">
                <img 
                  src={lesson.images} 
                  alt={lesson.title}
                  className="w-full object-cover"
                />
              </CardContent>
            </Card>

            {selectedLesson === lesson.id && (
              <div className="grid grid-col md:grid-cols-2 gap-4 items-center justify-items-center">
                {lesson.products.map((product) => (
                  <Card 
                    key={product.id} 
                    className="w-full cursor-pointer hover:shadow-lg transition-all duration-200"
                    onClick={() => handleProductClick(lesson.id, product.file)}
                  >
                    <CardHeader className="p-0">
                      <img 
                        src={product.images} 
                        alt={product.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg mb-2">{product.title}</CardTitle>
                      <p className="text-gray-600 text-sm">{product.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
