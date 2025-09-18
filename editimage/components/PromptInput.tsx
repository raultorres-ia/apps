// © 2025 Raül Torres. Este código está licenciado bajo AGPL v3.
import React, { useEffect, useRef } from 'react';
import type { Prompt } from '../types';
import { useTranslations } from '../contexts/i18n';

interface PromptInputProps {
  prompt: Prompt;
  onChange: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, onChange, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslations();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur();
  };
  
  const style = {
    top: `${prompt.position.y}px`,
    left: `${prompt.position.x}px`,
    transform: 'translate(-50%, -100%)', 
  };

  return (
    <div
      style={style}
      className="absolute z-20 flex flex-col items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="p-1.5 bg-gray-900/70 backdrop-blur-md rounded-lg shadow-2xl border border-slate-600/50 animate-fade-in-up w-max mb-[30px]"
      >
        <form onSubmit={handleFormSubmit} className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={prompt.text}
            onChange={(e) => onChange(prompt.id, e.target.value)}
            placeholder={t('promptPlaceholder')}
            className="bg-transparent text-white placeholder-slate-400 focus:outline-none px-2 w-56"
          />
          <button
            type="button"
            onClick={() => onRemove(prompt.id)}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label={t('removePrompt')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>
      </div>
      
      <div className="w-0.5 h-[20px] bg-blue-400/80"></div>
      <div className="w-3 h-3 bg-blue-400 rounded-full border-2 border-slate-900 absolute bottom-0 translate-y-1/2"></div>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
