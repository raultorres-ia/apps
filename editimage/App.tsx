// © 2025 Raül Torres. Este código está licenciado bajo AGPL v3.
import React, { useState, useCallback, useEffect } from 'react';
import { ImageEditor } from './components/ImageEditor';
import { FileUploader } from './components/FileUploader';
import { ImageGenerator } from './components/ImageGenerator';
import { ImageResult } from './types';
import { useTranslations } from './contexts/i18n';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageResult | null>(null);
  const [editedImage, setEditedImage] = useState<ImageResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { language, setLanguage, t } = useTranslations();

  useEffect(() => {
    document.title = t('appName');
  }, [t]);

  const handleImageUpload = useCallback((imageResult: ImageResult) => {
    setOriginalImage(imageResult);
    setEditedImage(null);
    setError(null);
  }, []);

  const handleReset = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setError(null);
    setIsLoading(false);
  };

  const Header: React.FC = () => {
    const languages: { code: 'es' | 'cat' | 'en'; label: string }[] = [
      { code: 'es', label: 'ES' },
      { code: 'cat', label: 'CAT' },
      { code: 'en', label: 'EN' },
    ];

    return (
      <header className="relative text-center p-6 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-700/50">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          {t('appName')}
        </h1>
        <p className="text-slate-400 mt-2">
          {t('appDescription')}
        </p>
        <div className="absolute top-1/2 -translate-y-1/2 right-4">
          <div className="flex items-center bg-gray-800/50 rounded-full p-1 border border-slate-700/50">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-1 text-sm font-bold rounded-full transition-colors ${
                  language === lang.code
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:bg-gray-700'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </header>
    );
  };
  
  const Footer: React.FC = () => (
    <footer className="text-center p-6 text-slate-500 text-sm mt-12 border-t border-slate-700/50">
      <p>{t('footerCopyright')}</p>
      <p>
        {t('footerCodeLicense')}: <a href="/LICENSE.txt" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-400">AGPL v3</a> · {t('footerContentLicense')}: <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-400">CC BY-SA 4.0</a>
      </p>
    </footer>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white antialiased flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow flex flex-col">
        {!originalImage ? (
          <div className="flex flex-col items-center justify-center flex-grow">
            <ImageGenerator
              onImageGenerated={handleImageUpload}
              setIsLoading={setIsLoading}
              setError={setError}
              isLoading={isLoading}
            />

            <div className="my-8 flex items-center w-full max-w-2xl">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink mx-4 text-slate-500">{t('dividerOr')}</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <FileUploader onImageUpload={handleImageUpload} />
            
            {error && (
              <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg max-w-3xl w-full">
                <p><strong>{t('errorTitle')}:</strong> {error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-semibold text-slate-300 mb-4">{t('original')}</h2>
                <ImageEditor
                  image={originalImage}
                  onEditComplete={setEditedImage}
                  setIsLoading={setIsLoading}
                  setError={setError}
                  isLoading={isLoading}
                />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-semibold text-slate-300 mb-4">{t('edited')}</h2>
                <div className="w-full aspect-square bg-slate-800/50 rounded-2xl shadow-lg flex items-center justify-center border border-slate-700/50 overflow-hidden">
                  {editedImage ? (
                    <img
                      src={editedImage.dataUrl}
                      alt={t('edited')}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-slate-500 text-center p-4">
                      {t('editedPlaceholder')}
                    </div>
                  )}
                </div>
                 {editedImage && (
                    <a
                      href={editedImage.dataUrl}
                      download={`edited_${originalImage.file.name}`}
                      className="mt-6 inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
                    >
                      {t('downloadImage')}
                    </a>
                  )}
              </div>
            </div>
            
            {error && (
              <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg max-w-3xl w-full">
                <p><strong>{t('errorTitle')}:</strong> {error}</p>
              </div>
            )}
            
            <button
              onClick={handleReset}
              className="mt-8 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              {t('startOver')}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;