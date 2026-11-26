import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../lib/firebase';

export async function compressImageToBlob(
  file: File,
  maxWidth = 1280,
  quality = 0.82
): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new Error('INVALID_IMAGE_FILE');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('IMAGE_READ_FAILED'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('INVALID_IMAGE_FILE'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('CANVAS_UNAVAILABLE'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('IMAGE_COMPRESSION_FAILED'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

async function compressImageWithTargetLimit(
  file: File,
  maxBytes = 145000,
  startWidth = 820
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('INVALID_IMAGE_FILE');
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('IMAGE_READ_FAILED'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('INVALID_IMAGE_FILE'));
      img.onload = () => {
        const attempts = [
          { maxW: startWidth, quality: 0.7 },
          { maxW: Math.min(startWidth, 720), quality: 0.56 },
          { maxW: 600, quality: 0.45 },
          { maxW: 480, quality: 0.36 },
        ];
        for (const attempt of attempts) {
          const scale = Math.min(1, attempt.maxW / Math.max(img.width, img.height));
          const width = Math.max(1, Math.round(img.width * scale));
          const height = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('CANVAS_UNAVAILABLE'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', attempt.quality);
          if (dataUrl.length <= maxBytes) {
            resolve(dataUrl);
            return;
          }
        }
        reject(new Error('IMAGE_TOO_LARGE'));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadVerificationImage(
  file: File,
  storagePath: string
): Promise<string> {
  const blob = await compressImageToBlob(file, 1100, 0.78);
  try {
    const storageRef = ref(storage, storagePath);
    const snapshot = await Promise.race([
      uploadBytes(storageRef, blob, { contentType: 'image/jpeg' }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('STORAGE_UPLOAD_TIMEOUT')), 7000)
      ),
    ]);
    return await getDownloadURL(snapshot.ref);
  } catch {
    // Fallback to compact JPEG data URL stored directly in Firestore if Storage is unavailable/unauthorized
    return await compressImageWithTargetLimit(file, 145000, 820);
  }
}

export async function compressImageToDataUrl(
  file: File,
  maxWidth = 900,
  quality = 0.72
): Promise<string> {
  return await compressImageWithTargetLimit(
    file,
    185000,
    quality >= 0.7 ? maxWidth : 780
  );
}
