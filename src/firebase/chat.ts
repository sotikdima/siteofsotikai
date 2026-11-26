import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  get,
  update,
  query,
  orderByChild,
  limitToLast,
  DataSnapshot,
  Unsubscribe,
} from 'firebase/database';
import { ChatMessage } from '../types/chat';

export const CHAT_AUTO_CLEANUP_THRESHOLD = 120;
export const CHAT_KEEP_LATEST_COUNT = 20;

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function readEnvConfig(): FirebaseConfig {
  const cfg: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };
  return cfg;
}

export function isFirebaseConfigured(): boolean {
  const c = readEnvConfig();
  return Boolean(c.apiKey && c.databaseURL && c.projectId);
}

let app: FirebaseApp | null = null;
export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  app = initializeApp(readEnvConfig());
  return app;
}

let lastCleanupAttemptMs = 0;

/**
 * Автоматически очищает старые сообщения в siteChat/messages при приближении к бесплатному лимиту,
 * оставляя 20 самых свежих сообщений.
 */
export async function cleanupOldSiteMessages(
  threshold: number = CHAT_AUTO_CLEANUP_THRESHOLD,
  keepLatest: number = CHAT_KEEP_LATEST_COUNT,
  forceCheck: boolean = false
): Promise<number> {
  if (!isFirebaseConfigured()) return 0;

  const now = Date.now();
  if (!forceCheck && now - lastCleanupAttemptMs < 45_000) {
    return 0;
  }
  lastCleanupAttemptMs = now;

  try {
    const db = getDatabase(getFirebaseApp());
    const messagesRef = ref(db, 'siteChat/messages');
    const q = query(messagesRef, orderByChild('ts'));
    const snap = await get(q);

    if (!snap.exists()) return 0;

    const entries: Array<{ key: string; ts: number }> = [];
    snap.forEach((child) => {
      if (!child.key) return;
      const val = child.val() as { ts?: unknown } | null;
      entries.push({
        key: child.key,
        ts: typeof val?.ts === 'number' ? val.ts : 0,
      });
    });

    if (entries.length < threshold) {
      return 0;
    }

    entries.sort((a, b) => a.ts - b.ts);
    const deleteCount = Math.max(0, entries.length - keepLatest);
    if (deleteCount === 0) return 0;

    const updates: Record<string, null> = {};
    for (let i = 0; i < deleteCount; i++) {
      updates[entries[i].key] = null;
    }

    await update(messagesRef, updates);
    return deleteCount;
  } catch (err) {
    console.warn('Firebase chat auto-cleanup failed:', (err as Error).message);
    return 0;
  }
}

/**
 * Подписка на последние сообщения чата (топовые по времени добавления).
 */
export function subscribeToSiteChat(
  limit: number,
  onData: (messages: ChatMessage[]) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured()) return null;

  const db = getDatabase(getFirebaseApp());
  const messagesRef = ref(db, 'siteChat/messages');
  const q = query(messagesRef, orderByChild('ts'), limitToLast(limit));

  const unsubscribe = onValue(
    q,
    (snap: DataSnapshot) => {
      const lines: ChatMessage[] = [];
      snap.forEach((child) => {
        const v = child.val() as ChatMessage & { ts?: number };
        if (!v || !v.text) return;
        lines.push({
          id: v.id || child.key || '',
          author: v.author || 'Зритель',
          text: v.text,
          time: v.time || '',
          ts: typeof v.ts === 'number' ? v.ts : undefined,
          badge: v.badge,
          badgeColor: v.badgeColor,
          isVip: Boolean(v.isVip),
          isMod: Boolean(v.isMod),
          isBot: Boolean(v.isBot),
          isAutoBot: Boolean(v.isAutoBot),
          color: v.color,
          donation: v.donation,
        });
      });
      onData(lines);
    },
    (err) => {
      console.warn('Firebase chat read failed:', err.message);
    }
  );

  return unsubscribe;
}

/**
 * Подписка на статус соединения с Firebase Realtime Database.
 */
export function subscribeToFirebaseConnection(
  onStatusChange: (connected: boolean) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured()) {
    onStatusChange(false);
    return null;
  }
  try {
    const db = getDatabase(getFirebaseApp());
    const connectedRef = ref(db, '.info/connected');
    return onValue(
      connectedRef,
      (snap) => {
        onStatusChange(Boolean(snap.val()));
      },
      () => {
        onStatusChange(false);
      }
    );
  } catch (e) {
    console.warn('Firebase connection check failed:', e);
    onStatusChange(false);
    return null;
  }
}

/**
 * Публикация одного сообщения в общий чат. Возвращает true, если записалось.
 */
export async function publishSiteMessage(
  message: ChatMessage
): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  try {
    const db = getDatabase(getFirebaseApp());
    const messagesRef = ref(db, 'siteChat/messages');
    const newRef = push(messagesRef);
    await set(newRef, {
      ...message,
      ts: Date.now(),
    });
    void cleanupOldSiteMessages(CHAT_AUTO_CLEANUP_THRESHOLD, CHAT_KEEP_LATEST_COUNT);
    return true;
  } catch (err) {
    console.warn('Firebase chat write failed:', (err as Error).message);
    return false;
  }
}