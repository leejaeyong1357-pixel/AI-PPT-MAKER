"use client";

const DB_NAME = "speakzen-voice";
const STORE = "recordings";
const VERSION = 1;
const MAX_PER_USER = 30;

const ALLOWED_IDS = new Set(["82211615", "82211601"]);

export function isVoiceAllowed(employeeId: string | undefined): boolean {
  return !!employeeId && ALLOWED_IDS.has(employeeId);
}

export interface VoiceRecord {
  id: string;
  employeeId: string;
  name: string;
  team: string;
  position: string;
  type: number;
  questionId: string;
  questionText: string;
  answerText: string;
  blob: Blob;
  durationSec: number;
  createdAt: number;
  score?: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("server");
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("employeeId", "employeeId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

export async function saveVoiceRecord(rec: VoiceRecord): Promise<void> {
  if (!ALLOWED_IDS.has(rec.employeeId)) return;
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(rec);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    await pruneUser(rec.employeeId);
  } catch {}
}

async function pruneUser(employeeId: string) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const idx = store.index("employeeId");
    const items: VoiceRecord[] = await new Promise((resolve, reject) => {
      const r = idx.getAll(IDBKeyRange.only(employeeId));
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    items.sort((a, b) => a.createdAt - b.createdAt);
    while (items.length > MAX_PER_USER) {
      const old = items.shift();
      if (old) store.delete(old.id);
    }
  } catch {}
}

export async function listVoiceRecords(
  employeeId?: string,
): Promise<VoiceRecord[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const all: VoiceRecord[] = await new Promise((resolve, reject) => {
      const r = store.getAll();
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const filtered = employeeId
      ? all.filter((r) => r.employeeId === employeeId)
      : all;
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function deleteVoiceRecord(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
  } catch {}
}

export function makeBlobUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}
