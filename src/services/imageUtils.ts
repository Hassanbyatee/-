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

export async function uploadVerificationImage(
  file: File,
  storagePath: string
): Promise<string> {
  const blob = await compressImageToBlob(file, 1280, 0.82);
  const storageRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(storageRef, blob, {
    contentType: 'image/jpeg',
  });
  return await getDownloadURL(snapshot.ref);
}

export async function compressImageToDataUrl(
  file: File,
  maxWidth = 900,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        if (dataUrl.length > 180000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.48);
        }
        if (dataUrl.length > 210000) {
          reject(new Error('Image is too large even after compression. Please choose a smaller photo.'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
