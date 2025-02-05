import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card } from './card'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesChange: (files: File[]) => void
  files: File[]
  accept?: Record<string, string[]>
  multiple?: boolean
}

export function FileUpload({ onFilesChange, files, accept, multiple, className, ...props }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesChange([...files, ...acceptedFiles])
  }, [files, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: multiple ?? true
  })

  const handleRemove = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    onFilesChange(newFiles)
  }

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed p-4 text-center cursor-pointer hover:border-primary/50 transition-colors',
          isDragActive && 'border-primary',
          className
        )}
        {...props}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Dosyaları buraya bırakın...</p>
        ) : (
          <p>Dosya seçmek için tıklayın veya buraya sürükleyin</p>
        )}
      </Card>

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative">
              <Card className="p-2">
                <div className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                    onLoad={(e) => {
                      URL.revokeObjectURL((e.target as HTMLImageElement).src)
                    }}
                  />
                  <button
                    onClick={() => handleRemove(index)}
                    className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 text-sm text-muted-foreground truncate">
                  {file.name}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
