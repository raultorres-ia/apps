// © 2025 Raül Torres. Este código está licenciado bajo AGPL v3.
import React, { useState } from 'react';
import { useTranslations } from '../contexts/i18n';
import { generateImageFromPrompt } from '../services/geminiService';
import type { ImageResult } from '../types';
import { Spinner } from './Spinner';

interface ImageGeneratorProps {
  onImageGenerated: (imageResult: ImageResult) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onImageGenerated, setIsLoading, setError, isLoading }) => {
  const { t } = useTranslations();
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const dataUrl = await generateImageFromPrompt(prompt);
      
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'generated-image.jpeg', { type: 'image/jpeg' });
      
      onImageGenerated({ file, dataUrl });
    } catch (e) {
        if (e instanceof Error) {
             if (e.message.startsWith('errorAPI')) {
                const apiError = e.message.replace('errorAPI', '');
                setError(`${t('errorAPI')} ${apiError}`);
            } else {
                 setError(t(e.message as any) || t('errorGeneratingImage'));
            }
        } else {
            setError(t('errorGeneratingImage'));
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-slate-300 mb-4">{t('generateImageTitle')}</h2>
      <div className="w-full flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t('generateImagePromptPlaceholder')}
          className="w-full h-24 p-4 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          disabled={isLoading}
          rows={3}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center h-12"
        >
          {isLoading ? (
            <>
              <Spinner className="h-5 w-5" />
              <span className="ml-2">{t('generatingImage')}</span>
            </>
          ) : (
            t('generateImageButton')
          )}
        </button>
      </div>
    </div>
  );
};