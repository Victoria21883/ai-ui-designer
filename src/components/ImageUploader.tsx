// src/components/ImageUploader.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
  onImageUpload: (base64: string, file: File | null) => void;
  isProcessing?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isProcessing = false }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, загрузите изображение');
        return;
      }

      // Проверка размера (макс 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Изображение не должно превышать 10MB');
        return;
      }

      setError(null);

      // Конвертируем в base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onImageUpload(base64, file);
      };
      reader.readAsDataURL(file);
    },
    [onImageUpload]
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setError(null);
    onImageUpload('', null);
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-12 h-12 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {isDragActive ? (
            <p className="text-text-primary">Отпустите изображение...</p>
          ) : (
            <>
              <p className="text-text-primary">
                Перетащите изображение сюда или нажмите для выбора
              </p>
              <p className="text-xs text-text-secondary">PNG, JPG, GIF до 10MB</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error text-error px-4 py-2 rounded">{error}</div>
      )}

      {preview && !isProcessing && (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={preview} alt="Preview" className="w-full h-auto max-h-64 object-contain" />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-text-secondary mt-2">Анализ изображения...</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
