// © 2025 Raül Torres. Este código está licenciado bajo AGPL v3.
import React, { createContext, useState, useContext, ReactNode } from 'react';

const translations = {
  es: {
    appName: "EditImage",
    appDescription: "Sube una foto, haz clic y edita con el poder de Gemini.",
    uploadTitle: "Sube una foto para empezar",
    uploadClick: "Haz clic para subir",
    uploadDrag: "o arrastra y suelta",
    uploadFormats: "PNG, JPG, GIF hasta 10MB",
    uploadInvalid: "Por favor, selecciona un archivo de imagen válido.",
    original: "Original",
    edited: "Editada",
    editedPlaceholder: "El resultado aparecerá aquí.",
    errorTitle: "Error",
    startOver: "Empezar de Nuevo",
    editingInProgress: "Editando con IA...",
    generate: "Generar Edición",
    generating: "Generando...",
    promptPlaceholder: "¿Qué quieres cambiar?",
    removePrompt: "Eliminar comando",
    errorNoPrompt: "Por favor, introduce al menos un comando de edición.",
    errorGeneric: "Ocurrió un error inesperado.",
    errorAPI: "Error al comunicarse con la API de Gemini: ",
    downloadImage: "Descargar Imagen",
    footerCopyright: "© 2025 Raül Torres",
    footerCodeLicense: "Licencia del código",
    footerContentLicense: "Contenido",
    errorApiNoImage: "La API no devolvió una imagen. La respuesta de texto fue: ",
    errorProcessFile: "No se pudo procesar el archivo a base64.",
    errorUnknown: "Ocurrió un error desconocido al editar la imagen.",
    generateImageTitle: "Crea una imagen desde cero",
    generateImagePromptPlaceholder: "Describe la imagen que quieres crear...",
    generateImageButton: "Generar Imagen",
    generatingImage: "Generando imagen...",
    dividerOr: "o",
    errorGeneratingImage: "No se pudo generar la imagen.",
  },
  cat: {
    appName: "EditImage",
    appDescription: "Puja una foto, fes clic i edita amb el poder de Gemini.",
    uploadTitle: "Puja una foto per començar",
    uploadClick: "Fes clic per pujar",
    uploadDrag: "o arrossega i deixa anar",
    uploadFormats: "PNG, JPG, GIF fins a 10MB",
    uploadInvalid: "Si us plau, selecciona un arxiu d'imatge vàlid.",
    original: "Original",
    edited: "Editada",
    editedPlaceholder: "El resultat apareixerà aquí.",
    errorTitle: "Error",
    startOver: "Tornar a començar",
    editingInProgress: "Editant amb IA...",
    generate: "Generar Edició",
    generating: "Generant...",
    promptPlaceholder: "Què vols canviar?",
    removePrompt: "Eliminar comanda",
    errorNoPrompt: "Si us plau, introdueix almenys una comanda d'edició.",
    errorGeneric: "Ha ocorregut un error inesperat.",
    errorAPI: "Error en comunicar-se amb l'API de Gemini: ",
    downloadImage: "Descarregar Imatge",
    footerCopyright: "© 2025 Raül Torres",
    footerCodeLicense: "Llicència del codi",
    footerContentLicense: "Contingut",
    errorApiNoImage: "L'API no ha retornat una imatge. La resposta de text ha estat: ",
    errorProcessFile: "No s'ha pogut processar l'arxiu a base64.",
    errorUnknown: "Ha ocorregut un error desconegut en editar la imatge.",
    generateImageTitle: "Crea una imatge des de zero",
    generateImagePromptPlaceholder: "Descriu la imatge que vols crear...",
    generateImageButton: "Generar Imatge",
    generatingImage: "Generant imatge...",
    dividerOr: "o",
    errorGeneratingImage: "No s'ha pogut generar la imatge.",
  },
  en: {
    appName: "EditImage",
    appDescription: "Upload a photo, click, and edit with the power of Gemini.",
    uploadTitle: "Upload a photo to start",
    uploadClick: "Click to upload",
    uploadDrag: "or drag and drop",
    uploadFormats: "PNG, JPG, GIF up to 10MB",
    uploadInvalid: "Please select a valid image file.",
    original: "Original",
    edited: "Edited",
    editedPlaceholder: "The result will appear here.",
    errorTitle: "Error",
    startOver: "Start Over",
    editingInProgress: "Editing with AI...",
    generate: "Generate Edit",
    generating: "Generating...",
    promptPlaceholder: "What do you want to change?",
    removePrompt: "Remove command",
    errorNoPrompt: "Please enter at least one editing command.",
    errorGeneric: "An unexpected error occurred.",
    errorAPI: "Error communicating with the Gemini API: ",
    downloadImage: "Download Image",
    footerCopyright: "© 2025 Raül Torres",
    footerCodeLicense: "Code license",
    footerContentLicense: "Content",
    errorApiNoImage: "The API did not return an image. The text response was: ",
    errorProcessFile: "Could not process file to base64.",
    errorUnknown: "An unknown error occurred while editing the image.",
    generateImageTitle: "Create an image from scratch",
    generateImagePromptPlaceholder: "Describe the image you want to create...",
    generateImageButton: "Generate Image",
    generatingImage: "Generating image...",
    dividerOr: "or",
    errorGeneratingImage: "Could not generate image.",
  },
};

type Language = 'es' | 'cat' | 'en';
type TranslationKey = keyof typeof translations.es;

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.es[key];
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslations = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationProvider');
  }
  return context;
};