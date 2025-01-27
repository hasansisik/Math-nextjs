'use client';
import { useSearchParams, useParams } from 'next/navigation';
import lessonData from '../../../lesson.json';
import * as lessonContents from '@/lessonData';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';


export default function LessonDetailPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const selectedFile = searchParams.get('file');
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const lessonId = parseInt(params.lessonId as string);
      const lesson = lessonData.find(l => l.id === lessonId);
      
      if (!lesson) {
        setError('Ders bulunamadı');
        return;
      }

      const selectedProduct = lesson.products.find(p => p.file === selectedFile);
      if (!selectedProduct) {
        setError('İçerik bulunamadı');
        return;
      }

      // Type assertion to access dynamic content from lessonContents
      const lessonContent = (lessonContents as { [key: string]: string })[selectedFile || ''];
      setContent(lessonContent);
    } catch {
      setError('Bir hata oluştu');
    }
  }, [params.lessonId, selectedFile]);

  if (error) {
    return <div className="container mx-auto p-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="prose max-w-none">
        <ReactMarkdown
          components={{
            p: ({ node, children, ...props }) => {
              if (
                node?.children[0] &&
                'value' in node.children[0] &&
                typeof node.children[0].value === 'string' &&
                node.children[0].value.startsWith('https://')
              ) {
                return <img src={node.children[0].value} alt="Content" className="w-full rounded-lg my-4" />;
              }
              return <p {...props}>{children}</p>;
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
