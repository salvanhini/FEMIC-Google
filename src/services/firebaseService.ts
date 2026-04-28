import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Generic CRUD operations
export const firebaseService = {
  async list<T>(path: string): Promise<T[]> {
    if (!auth.currentUser) return [];
    try {
      const q = query(collection(db, path), where('userId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async get<T>(path: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, path, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as T;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${path}/${id}`);
      return null;
    }
  },

  async create<T extends Record<string, any>>(path: string, data: T): Promise<string> {
    if (!auth.currentUser) throw new Error("User not authenticated");
    const id = (data as any).id || crypto.randomUUID();
    const pathWithId = `${path}/${id}`;
    try {
      await setDoc(doc(db, path, id), {
        ...data,
        id,
        userId: auth.currentUser.uid,
        created_at: (data as any).created_at || new Date().toISOString()
      });
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, pathWithId);
      return id;
    }
  },

  async update<T>(path: string, id: string, data: Partial<T>): Promise<void> {
    const pathWithId = `${path}/${id}`;
    try {
      await updateDoc(doc(db, path, id), {
        ...(data as any),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, pathWithId);
    }
  },

  async delete(path: string, id: string): Promise<void> {
    const pathWithId = `${path}/${id}`;
    try {
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, pathWithId);
    }
  },

  subscribe<T>(path: string, callback: (data: T[]) => void) {
    if (!auth.currentUser) return () => {};
    const q = query(collection(db, path), where('userId', '==', auth.currentUser.uid));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  }
};
