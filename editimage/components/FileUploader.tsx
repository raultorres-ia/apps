// © 2025 Raül Torres. Este código está licenciado bajo AGPL v3.
import React, { useCallback } from 'react';
import type { ImageResult } from '../types';
import { useTranslations } from '../contexts/i18n';

interface FileUploaderProps {
  onImageUpload: (imageResult: ImageResult) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onImageUpload }) => {
  const { t } = useTranslations();

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onImageUpload({ file, dataUrl: e.target.result as string });
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert(t('uploadInvalid'));
      }
    }
  }, [onImageUpload, t]);

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  
  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center p-8">
      <label
        htmlFor="file-upload"
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="w-full cursor-pointer flex flex-col items-center justify-center p-10 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-2xl hover:bg-slate-800/80 hover:border-purple-500 transition-colors duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg text-slate-400">
          <span className="font-semibold text-purple-400">{t('uploadClick')}</span> {t('uploadDrag')}
        </p>
        <p className="text-sm text-slate-500 mt-1">{t('uploadFormats')}</p>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </label>
    </div>
  );
};
