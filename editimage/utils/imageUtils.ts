// © 2025 Raül Torres. Este código está licenciado bajo AGPL v3.
export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
      if (!data || !mimeType) {
        reject(new Error("errorProcessFile"));
        return;
      }
      resolve({ base64: data, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};

export const createMask = (
  promptPosition: { x: number; y: number },
  imageNaturalDims: { width: number; height: number },
  imageRenderedRect: { width: number, height: number, left: number, top: number }
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = imageNaturalDims.width;
  canvas.height = imageNaturalDims.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo obtener el contexto del lienzo');
  }

  const xOnRenderedImg = promptPosition.x - imageRenderedRect.left;
  const yOnRenderedImg = promptPosition.y - imageRenderedRect.top;

  const scaleX = imageNaturalDims.width / imageRenderedRect.width;
  const scaleY = imageNaturalDims.height / imageRenderedRect.height;
  
  const finalX = xOnRenderedImg * scaleX;
  const finalY = yOnRenderedImg * scaleY;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const radius = Math.min(canvas.width, canvas.height) * 0.1;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(finalX, finalY, radius, 0, 2 * Math.PI);
  ctx.fill();
  
  return canvas.toDataURL('image/png');
};