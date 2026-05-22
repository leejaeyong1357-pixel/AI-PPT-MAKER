"use client";

import { useEffect, useState } from "react";
import dictionary from "@/data/dictionary.json";
import { translateWord } from "@/lib/hchat";
import { storage } from "@/lib/storage";

const dict: Record<string, string> = dictionary as any;

function lookupLocal(raw: string): string | null {
  const w = raw.toLowerCase().replace(/[^a-z']/g, "");
  if (!w) return null;
  if (dict[w]) return dict[w];
  // simple plural/past stripping
  if (w.endsWith("s") && dict[w.slice(0, -1)]) return dict[w.slice(0, -1)];
  if (w.endsWith("es") && dict[w.slice(0, -2)]) return dict[w.slice(0, -2)];
  if (w.endsWith("ed") && dict[w.slice(0, -2)]) return dict[w.slice(0, -2)];
  if (w.endsWith("ing") && dict[w.slice(0, -3)]) return dict[w.slice(0, -3)];
  if (w.endsWith("ly") && dict[w.slice(0, -2)]) return dict[w.slice(0, -2)];
  return null;
}

interface HoverState {
  word: string;
  meaning: string;
  loading: boolean;
}

export function HoverText({ text }: { text: string }) {
  const [hover, setHover] = useState<HoverState | null>(null);

  const handleHover = async (word: string) => {
    if (!word) return;
    const local = lookupLocal(word);
    if (local) {
      setHover({ word, meaning: local, loading: false });
      return;
    }
    setHover({ word, meaning: "...", loading: true });
    const settings = storage.getSettings();
    const meaning = await translateWord(word, {
      apiKey: settings.hchatApiKey,
      model: settings.hchatModel,
    });
    setHover({ word, meaning, loading: false });
  };

  const tokens = text.split(/(\s+|[.,!?;:"'()])/).filter((t) => t.length > 0);

  return (
    <div className="relative">
      <div className="text-lg font-semibold text-teczen-gray-900 leading-relaxed">
        {tokens.map((token, i) => {
          const isWord = /^[A-Za-z'-]+$/.test(token);
          if (!isWord) return <span key={i}>{token}</span>;
          return (
            <span
              key={i}
              onMouseEnter={() => handleHover(token)}
              className="cursor-help hover:bg-teczen-navy/10 rounded transition-colors"
            >
              {token}
            </span>
          );
        })}
      </div>
      {hover && (
        <div className="fixed top-1/3 right-6 z-50 bg-white border-2 border-teczen-navy rounded-2xl p-4 shadow-xl min-w-[200px] max-w-[280px]">
          <div className="text-xs text-teczen-gray-500 mb-1">사전</div>
          <div className="text-xl font-bold text-teczen-navy mb-1 break-all">
            {hover.word}
          </div>
          <div className="text-base text-teczen-gray-800">
            {hover.loading ? (
              <span className="inline-block w-4 h-4 border-2 border-teczen-navy border-t-transparent rounded-full animate-spin" />
            ) : (
              hover.meaning
            )}
          </div>
        </div>
      )}
    </div>
  );
}
