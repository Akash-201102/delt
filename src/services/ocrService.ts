import Tesseract from 'tesseract.js';

export interface OcrResult {
  text: string;
  confidence: number;
  lines: Array<{ text: string; confidence: number }>;
}

export async function preprocessImage(file: File, maxWidth = 1600): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    img.onload = () => {
      // Maintain aspect ratio while limiting width
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and apply simple contrast/grayscale
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const factor = 1.2;
        const enhanced = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
        data[i] = data[i + 1] = data[i + 2] = enhanced;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.8)); // JPEG with compression
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Specifically for Vision AI - compressed and resized Base64
 */
export async function getCompressedBase64(file: File): Promise<string> {
  const dataUrl = await preprocessImage(file, 1200);
  return dataUrl.split(',')[1];
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function runOcr(
  imageDataUrl: string,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  const result = await Tesseract.recognize(imageDataUrl, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  const lines = result.data.lines.map((line) => ({
    text: line.text.trim(),
    confidence: line.confidence,
  }));

  const text = result.data.text;
  console.log("=== RAW OCR TEXT ===", JSON.stringify(text));

  return {
    text,
    confidence: result.data.confidence,
    lines,
  };
}
