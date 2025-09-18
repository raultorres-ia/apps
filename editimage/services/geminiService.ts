// © 2025 Raül Torres. Este código está licenciado bajo AGPL v3.
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { fileToBase64 } from "../utils/imageUtils";

if (!process.env.API_KEY) {
  throw new Error("API_KEY no está configurada. Asegúrate de que la variable de entorno API_KEY esté definida.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateImageFromPrompt(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    
    throw new Error("errorGeneratingImage");
    
  } catch (error) {
    console.error("Error al generar la imagen:", error);
    if (error instanceof Error) {
      throw new Error(`errorAPI${error.message}`);
    }
    throw new Error("errorUnknown");
  }
}

export async function editImageWithPrompt(
  imageFile: File,
  prompt: string,
  maskDataUrl: string
): Promise<string> {
  try {
    const { base64, mimeType } = await fileToBase64(imageFile);

    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: mimeType,
      },
    };

    const [maskHeader, maskBase64] = maskDataUrl.split(',');
    if (!maskBase64) {
      throw new Error("URL de datos de máscara no válida");
    }
    const maskMimeType = maskHeader.match(/:(.*?);/)?.[1] || 'image/png';

    const maskPart = {
        inlineData: {
            data: maskBase64,
            mimeType: maskMimeType,
        }
    };

    const fullPrompt = `Usando la máscara proporcionada (área blanca), aplica la siguiente edición a la imagen: "${prompt}". Cambia solo el área indicada por la máscara. El resto de la imagen debe permanecer intacto.`;

    const textPart = {
      text: fullPrompt,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [imagePart, maskPart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    
    throw new Error("errorApiNoImage" + (response.text || ""));
    
  } catch (error) {
    console.error("Error al editar la imagen:", error);
    if (error instanceof Error) {
      if (error.message.startsWith('errorApiNoImage')) {
          throw error;
      }
      throw new Error(`errorAPI${error.message}`);
    }
    throw new Error("errorUnknown");
  }
}