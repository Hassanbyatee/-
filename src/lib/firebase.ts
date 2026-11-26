import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const ADMIN_ACCESS_CODE = '2006';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  errorCode?: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export interface ParsedErrorDetails {
  code: string;
  message: string;
  operationType?: string;
  path?: string | null;
}

export function extractErrorDetails(err: unknown): ParsedErrorDetails {
  if (err instanceof Error) {
    const rawMsg = err.message || '';
    if (rawMsg.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(rawMsg) as Partial<FirestoreErrorInfo>;
        if (parsed && typeof parsed.error === 'string') {
          return {
            code: parsed.errorCode || 'firestore-error',
            message: parsed.error,
            operationType: parsed.operationType,
            path: parsed.path ?? null,
          };
        }
      } catch {
        // Fallback to standard Error handling
      }
    }
    const withCode = err as Error & { code?: string };
    return {
      code: withCode.code || (err.name && err.name !== 'Error' ? err.name : '') || 'ERROR',
      message: rawMsg || err.name || 'Unknown error',
    };
  }
  if (err && typeof err === 'object') {
    const obj = err as { code?: unknown; name?: unknown; message?: unknown };
    return {
      code: String(obj.code || obj.name || 'ERROR'),
      message: String(obj.message || JSON.stringify(err)),
    };
  }
  return {
    code: 'UNKNOWN',
    message: String(err || 'Unknown error'),
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errCode =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : undefined;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    ...(errCode ? { errorCode: errCode } : {}),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration. Firestore client is offline.');
    }
    return false;
  }
}

testConnection();
