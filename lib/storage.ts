"use client";

import type {
  UserSettings,
  StudyRecord,
  VocabEntry,
  MockExamResult,
} from "@/types";

const KEYS = {
  settings: "spa.settings",
  records: "spa.records",
  vocab: "spa.vocab",
  mockResults: "spa.mockResults",
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getSettings(): UserSettings {
    return safeGet<UserSettings>(KEYS.settings, {
      examDate: "",
      targetLevel: 6,
      hchatApiKey: "",
      hchatEndpoint: "",
      setupCompleted: false,
    });
  },

  saveSettings(settings: UserSettings) {
    safeSet(KEYS.settings, settings);
  },

  isSetupComplete(): boolean {
    return this.getSettings().setupCompleted;
  },

  getRecords(): StudyRecord[] {
    return safeGet<StudyRecord[]>(KEYS.records, []);
  },

  addRecord(record: StudyRecord) {
    const records = this.getRecords();
    records.push(record);
    safeSet(KEYS.records, records);
  },

  updateRecord(id: string, updates: Partial<StudyRecord>) {
    const records = this.getRecords();
    const idx = records.findIndex((r) => r.id === id);
    if (idx !== -1) {
      records[idx] = { ...records[idx], ...updates };
      safeSet(KEYS.records, records);
    }
  },

  getBookmarked(): StudyRecord[] {
    return this.getRecords().filter((r) => r.bookmarked);
  },

  getVocab(): VocabEntry[] {
    return safeGet<VocabEntry[]>(KEYS.vocab, []);
  },

  addVocab(entry: VocabEntry) {
    const vocab = this.getVocab();
    if (!vocab.some((v) => v.word.toLowerCase() === entry.word.toLowerCase())) {
      vocab.push(entry);
      safeSet(KEYS.vocab, vocab);
    }
  },

  removeVocab(word: string) {
    const vocab = this.getVocab().filter(
      (v) => v.word.toLowerCase() !== word.toLowerCase(),
    );
    safeSet(KEYS.vocab, vocab);
  },

  getMockResults(): MockExamResult[] {
    return safeGet<MockExamResult[]>(KEYS.mockResults, []);
  },

  addMockResult(result: MockExamResult) {
    const results = this.getMockResults();
    results.push(result);
    safeSet(KEYS.mockResults, results);
  },

  clearAll() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
