export type VerificationDocSlot =
  | 'portrait'
  | 'id_front'
  | 'id_back'
  | 'license_front'
  | 'license_back';

export interface VerificationDocImages {
  portraitUrl?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  licenseFrontUrl?: string;
  licenseBackUrl?: string;
}

interface StoredVerificationImageRecord {
  id: string;
  uid: string;
  slot: VerificationDocSlot;
  dataUrl: string;
  sizeBytes: number;
  updatedAt: number;
}

const IDB_NAME = 'masar_iraq_verification_docs_v1';
const IDB_VERSION = 1;
const IDB_STORE = 'verification_docs';
const IDB_UID_INDEX = 'by_uid';
const SESSION_FALLBACK_PREFIX = 'masar_vdoc_';
const MAX_SESSION_FALLBACK_BYTES = 2_000_000;

const memoryFallbackStore = new Map<string, StoredVerificationImageRecord>();

function createCodedError(code: string, message: string): Error & { code: string } {
  const err = new Error(message) as Error & { code: string };
  err.code = code;
  return err;
}

function isQuotaExceededError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: unknown; code?: unknown; message?: unknown };
  const name = String(e.name || '');
  const msg = String(e.message || '');
  return (
    name === 'QuotaExceededError' ||
    name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22 ||
    e.code === 1014 ||
    msg.toLowerCase().includes('quota')
  );
}

export function makeVerificationImageRef(uid: string, slot: VerificationDocSlot): string {
  return `idb://${uid}/${slot}`;
}

export function isIndexedDbImageRef(value?: string | null): boolean {
  return typeof value === 'string' && value.startsWith('idb://');
}

export function parseVerificationImageRef(
  value?: string | null
): { uid: string; slot: VerificationDocSlot } | null {
  if (!isIndexedDbImageRef(value) || !value) return null;
  const body = value.slice('idb://'.length);
  const slashIdx = body.indexOf('/');
  if (slashIdx <= 0) return null;
  const uid = body.slice(0, slashIdx);
  const slot = body.slice(slashIdx + 1) as VerificationDocSlot;
  if (
    slot !== 'portrait' &&
    slot !== 'id_front' &&
    slot !== 'id_back' &&
    slot !== 'license_front' &&
    slot !== 'license_back'
  ) {
    return null;
  }
  return { uid, slot };
}

export async function compressImageToCanvasDataUrl(
  file: File,
  maxDimension = 800,
  quality = 0.6
): Promise<string> {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    throw createCodedError('INVALID_IMAGE_FILE', `Unsupported image file type: ${file?.type || 'unknown'}`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(createCodedError('IMAGE_READ_FAILED', `Failed to read image file "${file.name}".`));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () =>
        reject(createCodedError('INVALID_IMAGE_FILE', `Could not decode image "${file.name}".`));
      img.onload = () => {
        try {
          const maxSide = Math.max(img.width, img.height) || 1;
          const scale = Math.min(1, maxDimension / maxSide);
          const width = Math.max(1, Math.round(img.width * scale));
          const height = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(createCodedError('CANVAS_UNAVAILABLE', 'HTML5 Canvas 2D context is unavailable.'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          if (!dataUrl || !dataUrl.startsWith('data:image/')) {
            reject(
              createCodedError('IMAGE_COMPRESSION_FAILED', `Canvas export failed for "${file.name}".`)
            );
            return;
          }
          resolve(dataUrl);
        } catch (err) {
          reject(
            createCodedError(
              'IMAGE_COMPRESSION_FAILED',
              err instanceof Error ? err.message : 'Image compression failed.'
            )
          );
        }
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

export async function estimateBrowserStorageQuota(): Promise<{
  usage: number;
  quota: number;
  available: number;
} | null> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      const quota = typeof est.quota === 'number' ? est.quota : 0;
      const usage = typeof est.usage === 'number' ? est.usage : 0;
      if (quota > 0) {
        return { usage, quota, available: Math.max(0, quota - usage) };
      }
    }
  } catch {
    // StorageManager estimate unavailable
  }
  return null;
}

function openVerificationDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(createCodedError('INDEXEDDB_UNAVAILABLE', 'IndexedDB is not supported in this browser.'));
      return;
    }
    try {
      const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          const store = db.createObjectStore(IDB_STORE, { keyPath: 'id' });
          store.createIndex(IDB_UID_INDEX, 'uid', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        const err = request.error;
        if (isQuotaExceededError(err)) {
          reject(
            createCodedError(
              'STORAGE_QUOTA_EXCEEDED',
              err?.message || 'QuotaExceededError while opening IndexedDB.'
            )
          );
        } else {
          reject(
            createCodedError(
              err?.name || 'INDEXEDDB_OPEN_FAILED',
              err?.message || 'Failed to open IndexedDB.'
            )
          );
        }
      };
      request.onblocked = () => {
        reject(createCodedError('INDEXEDDB_BLOCKED', 'IndexedDB open request was blocked.'));
      };
    } catch (err) {
      reject(
        createCodedError(
          err instanceof Error ? err.name : 'INDEXEDDB_OPEN_FAILED',
          err instanceof Error ? err.message : 'Failed to access IndexedDB.'
        )
      );
    }
  });
}

function saveToFallbackStores(records: StoredVerificationImageRecord[]): void {
  let totalBytes = 0;
  records.forEach((r) => {
    memoryFallbackStore.set(r.id, r);
    totalBytes += r.sizeBytes;
  });

  if (typeof window !== 'undefined' && window.sessionStorage && totalBytes <= MAX_SESSION_FALLBACK_BYTES) {
    try {
      for (const rec of records) {
        window.sessionStorage.setItem(`${SESSION_FALLBACK_PREFIX}${rec.id}`, JSON.stringify(rec));
      }
    } catch {
      // sessionStorage quota exceeded or disabled; memoryFallbackStore remains populated for this session
    }
  }
}

function readFromFallbackStores(uid: string): StoredVerificationImageRecord[] {
  const byId = new Map<string, StoredVerificationImageRecord>();

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key && key.startsWith(`${SESSION_FALLBACK_PREFIX}${uid}:`)) {
          const raw = window.sessionStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw) as StoredVerificationImageRecord;
            if (parsed?.id && parsed?.dataUrl) {
              byId.set(parsed.id, parsed);
            }
          }
        }
      }
    } catch {
      // Ignore sessionStorage parse/security issues
    }
  }

  memoryFallbackStore.forEach((rec) => {
    if (rec.uid === uid) {
      byId.set(rec.id, rec);
    }
  });

  return Array.from(byId.values());
}

async function putRecordsIntoIndexedDb(records: StoredVerificationImageRecord[]): Promise<void> {
  const totalBytes = records.reduce((sum, r) => sum + r.sizeBytes, 0);
  const quotaInfo = await estimateBrowserStorageQuota();
  if (quotaInfo && quotaInfo.available < totalBytes + 32 * 1024) {
    throw createCodedError(
      'STORAGE_QUOTA_EXCEEDED',
      `QuotaExceededError: need ${Math.ceil(totalBytes / 1024)} KB, available ${Math.floor(
        quotaInfo.available / 1024
      )} KB in IndexedDB.`
    );
  }

  let db: IDBDatabase | null = null;
  try {
    db = await openVerificationDb();
  } catch (openErr) {
    const code = (openErr as { code?: string })?.code || '';
    if (isQuotaExceededError(openErr) || code === 'STORAGE_QUOTA_EXCEEDED') {
      throw openErr;
    }
    // Restricted iframe / private mode where IndexedDB is disabled: use bounded session + memory fallback
    saveToFallbackStores(records);
    return;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db!.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);

      tx.oncomplete = () => resolve();
      tx.onabort = () => {
        const err = tx.error;
        if (isQuotaExceededError(err)) {
          reject(
            createCodedError(
              'STORAGE_QUOTA_EXCEEDED',
              err?.message || 'QuotaExceededError during IndexedDB transaction.'
            )
          );
        } else {
          reject(
            createCodedError(
              err?.name || 'INDEXEDDB_ABORTED',
              err?.message || 'IndexedDB transaction aborted.'
            )
          );
        }
      };
      tx.onerror = () => {
        const err = tx.error;
        if (isQuotaExceededError(err)) {
          reject(
            createCodedError(
              'STORAGE_QUOTA_EXCEEDED',
              err?.message || 'QuotaExceededError writing to IndexedDB.'
            )
          );
        } else {
          reject(
            createCodedError(
              err?.name || 'INDEXEDDB_WRITE_FAILED',
              err?.message || 'IndexedDB write error.'
            )
          );
        }
      };

      for (const rec of records) {
        const req = store.put(rec);
        req.onerror = () => {
          if (isQuotaExceededError(req.error)) {
            reject(
              createCodedError(
                'STORAGE_QUOTA_EXCEEDED',
                req.error?.message || 'QuotaExceededError storing verification image.'
              )
            );
          }
        };
      }
    });

    // Keep memory cache fresh for immediate Admin inspection
    records.forEach((rec) => memoryFallbackStore.set(rec.id, rec));
  } finally {
    db?.close();
  }
}

export async function saveUserVerificationImages(
  uid: string,
  entries: Partial<Record<VerificationDocSlot, File | string>>
): Promise<Partial<Record<VerificationDocSlot, string>>> {
  const slots = (Object.keys(entries) as VerificationDocSlot[]).filter((k) => Boolean(entries[k]));
  if (slots.length === 0) return {};

  const compressedPairs = await Promise.all(
    slots.map(async (slot) => {
      const input = entries[slot]!;
      const dataUrl =
        typeof input === 'string'
          ? input
          : await compressImageToCanvasDataUrl(input, 800, 0.6);
      return { slot, dataUrl };
    })
  );

  const now = Date.now();
  const records: StoredVerificationImageRecord[] = compressedPairs.map(({ slot, dataUrl }) => ({
    id: `${uid}:${slot}`,
    uid,
    slot,
    dataUrl,
    sizeBytes: dataUrl.length,
    updatedAt: now,
  }));

  await putRecordsIntoIndexedDb(records);

  const refs: Partial<Record<VerificationDocSlot, string>> = {};
  for (const { slot } of compressedPairs) {
    refs[slot] = makeVerificationImageRef(uid, slot);
  }
  return refs;
}

export async function saveSingleVerificationImage(
  uid: string,
  slot: VerificationDocSlot,
  file: File
): Promise<{ refUrl: string; dataUrl: string }> {
  const dataUrl = await compressImageToCanvasDataUrl(file, 800, 0.6);
  const record: StoredVerificationImageRecord = {
    id: `${uid}:${slot}`,
    uid,
    slot,
    dataUrl,
    sizeBytes: dataUrl.length,
    updatedAt: Date.now(),
  };
  await putRecordsIntoIndexedDb([record]);
  return {
    refUrl: makeVerificationImageRef(uid, slot),
    dataUrl,
  };
}

function mapRecordsToVerificationDocImages(
  records: StoredVerificationImageRecord[]
): VerificationDocImages {
  const result: VerificationDocImages = {};
  for (const rec of records) {
    if (!rec?.dataUrl) continue;
    switch (rec.slot) {
      case 'portrait':
        result.portraitUrl = rec.dataUrl;
        break;
      case 'id_front':
        result.idFrontUrl = rec.dataUrl;
        break;
      case 'id_back':
        result.idBackUrl = rec.dataUrl;
        break;
      case 'license_front':
        result.licenseFrontUrl = rec.dataUrl;
        break;
      case 'license_back':
        result.licenseBackUrl = rec.dataUrl;
        break;
    }
  }
  return result;
}

export async function getUserVerificationImages(uid: string): Promise<VerificationDocImages> {
  if (!uid) return {};
  const fallbackRecords = readFromFallbackStores(uid);
  let db: IDBDatabase | null = null;
  try {
    db = await openVerificationDb();
    const idbRecords = await new Promise<StoredVerificationImageRecord[]>((resolve, reject) => {
      const tx = db!.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const index = store.index(IDB_UID_INDEX);
      const req = index.getAll(uid);
      req.onsuccess = () => resolve((req.result as StoredVerificationImageRecord[]) || []);
      req.onerror = () => reject(req.error || new Error('Failed to read verification images.'));
    });
    return mapRecordsToVerificationDocImages([...fallbackRecords, ...idbRecords]);
  } catch {
    return mapRecordsToVerificationDocImages(fallbackRecords);
  } finally {
    db?.close();
  }
}

export async function resolveVerificationImageSrc(value?: string | null): Promise<string> {
  if (!value) return '';
  const parsed = parseVerificationImageRef(value);
  if (!parsed) return value;

  const docs = await getUserVerificationImages(parsed.uid);
  switch (parsed.slot) {
    case 'portrait':
      return docs.portraitUrl || '';
    case 'id_front':
      return docs.idFrontUrl || '';
    case 'id_back':
      return docs.idBackUrl || '';
    case 'license_front':
      return docs.licenseFrontUrl || '';
    case 'license_back':
      return docs.licenseBackUrl || '';
    default:
      return '';
  }
}

export async function compressImageToDataUrl(
  file: File,
  maxWidth = 800,
  quality = 0.6
): Promise<string> {
  const firstPass = await compressImageToCanvasDataUrl(file, maxWidth, quality);
  if (firstPass.length <= 165000) {
    return firstPass;
  }
  const secondPass = await compressImageToCanvasDataUrl(file, Math.min(maxWidth, 640), 0.45);
  return secondPass;
}
