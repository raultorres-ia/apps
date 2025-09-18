// © 2025 Raül Torres. Este código está licenciado bajo AGPL v3.
import React, { useState, useRef, useCallback } from 'react';
import type { ImageResult, Prompt } from '../types';
import { PromptInput } from './PromptInput';
import { Spinner } from './Spinner';
import { editImageWithPrompt } from '../services/geminiService';
import { useTranslations } from '../contexts/i18n';
import { createMask } from '../utils/imageUtils';

interface ImageEditorProps {
  image: ImageResult;
  onEditComplete: (result: ImageResult) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ image, onEditComplete, setIsLoading, setError, isLoading }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { t } = useTranslations();

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLoading) return;
    const container = containerRef.current;
    const img = imgRef.current;
    if (container && img) {
      const containerRect = container.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();

      const clickXInContainer = e.clientX - containerRect.left;
      const clickYInContainer = e.clientY - containerRect.top;
      
      const imgLeftInContainer = imgRect.left - containerRect.left;
      const imgTopInContainer = imgRect.top - containerRect.top;

      const clickXOnImg = clickXInContainer - imgLeftInContainer;
      const clickYOnImg = clickYInContainer - imgTopInContainer;

      if (
        clickXOnImg >= 0 &&
        clickXOnImg <= imgRect.width &&
        clickYOnImg >= 0 &&
        clickYOnImg <= imgRect.height
      ) {
        const newId = Date.now().toString();
        setPrompts(prev => [...prev, { id: newId, text: '', position: { x: clickXInContainer, y: clickYInContainer } }]);
      }
    }
  };

  const handlePromptChange = (id: string, text: string) => {
    setPrompts(prompts => prompts.map(p => p.id === id ? { ...p, text } : p));
  };

  const handleRemovePrompt = (id: string) => {
    setPrompts(prompts => prompts.filter(p => p.id !== id));
  };

  const handleGenerateEdit = useCallback(async () => {
    const activePrompts = prompts.filter(p => p.text.trim() !== '');
    if (activePrompts.length === 0) {
      setError(t("errorNoPrompt"));
      return;
    }

    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) {
      setError(t('errorGeneric'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      let currentImageFile = image.file;

      const imageNaturalDims = { width: img.naturalWidth, height: img.naturalHeight };
      const containerRect = container.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      const imageRenderedRect = {
          width: imgRect.width,
          height: imgRect.height,
          left: imgRect.left - containerRect.left,
          top: imgRect.top - containerRect.top
      };
      
      for (const prompt of activePrompts) {
        const maskDataUrl = createMask(prompt.position, imageNaturalDims, imageRenderedRect);
        
        const editedDataUrl = await editImageWithPrompt(currentImageFile, prompt.text, maskDataUrl);
        
        const res = await fetch(editedDataUrl);
        const blob = await res.blob();
        currentImageFile = new File([blob], `edited_${image.file.name}`, { type: blob.type });
        
        // Update the image src in the editor to show the intermediate result for the next mask calculation if needed
        if (imgRef.current) {
          imgRef.current.src = editedDataUrl;
        }
      }

      const finalRes = await fetch(imgRef.current.src);
      const finalBlob = await finalRes.blob();
      const finalFile = new File([finalBlob], `edited_${image.file.name}`, { type: finalBlob.type });

      onEditComplete({file: finalFile, dataUrl: imgRef.current.src});
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.startsWith('errorApiNoImage')) {
            const textResponse = e.message.replace('errorApiNoImage', '');
            setError(`${t('errorApiNoImage')} ${textResponse}`);
        } else if (e.message.startsWith('errorAPI')) {
            const apiError = e.message.replace('errorAPI', '');
            setError(`${t('errorAPI')} ${apiError}`);
        } else {
             setError(t(e.message as any) || t('errorGeneric'));
        }
      } else {
        setError(t('errorGeneric'));
      }
    } finally {
      setIsLoading(false);
      if (imgRef.current) {
        imgRef.current.src = image.dataUrl; // Restore original image visually
      }
    }
  }, [prompts, image.file, image.dataUrl, onEditComplete, setIsLoading, setError, t]);

  const hasPromptsWithText = prompts.some(p => p.text.trim() !== '');

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className="relative w-full aspect-square bg-slate-800/50 rounded-2xl shadow-lg cursor-pointer border border-slate-700/50"
        onClick={handleImageClick}
      >
        <img
          ref={imgRef}
          src={image.dataUrl}
          alt={t('original')}
          className="w-full h-full object-contain"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
            <Spinner />
            <p className="text-slate-300 mt-4 animate-pulse">{t('editingInProgress')}</p>
          </div>
        )}
        {prompts.map(prompt => (
          <PromptInput
            key={prompt.id}
            prompt={prompt}
            onChange={handlePromptChange}
            onRemove={handleRemovePrompt}
          />
        ))}
      </div>
      {prompts.length > 0 && (
          <button
            onClick={handleGenerateEdit}
            disabled={isLoading || !hasPromptsWithText}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoading ? t('generating') : t('generate')}
          </button>
      )}
    </div>
  );
};