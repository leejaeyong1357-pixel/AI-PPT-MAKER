"use client";

import { useState } from "react";
import dictionary from "@/data/dictionary.json";
import { translateWord } from "@/lib/hchat";
import { storage } from "@/lib/storage";

const dict: Record<string, string> = dictionary as any;

function lookupLocal(raw: string): string | null {
  const w = raw.toLowerCase().replace(/[^a-z']/g, "");
  if (!w) return null;
  if (dict[w]) return dict[w];
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
    <>
      <div className="text-lg font-semibold text-teczen-gray-900 leading-relaxed">
        {tokens.map((token, i) => {
          const isWord = /^[A-Za-z'-]+$/.test(token);
          if (!isWord) return <span key={i}>{token}</span>;
          return (
            <span
              key={i}
              onMouseEnter={() => handleHover(token)}
              className="cursor-help hover:bg-teczen-blue/15 rounded transition-colors"
            >
              {token}
            </span>
          );
        })}
      </div>

      <div className="fixed top-24 right-6 z-50 w-64 hidden xl:block">
        {hover ? (
          <div className="bg-white border-2 border-teczen-blue rounded-2xl p-4 shadow-xl animate-fadeup">
            <div className="text-xs font-bold text-teczen-blue mb-1">📖 사전</div>
            <div className="text-xl font-black text-teczen-navy mb-2 break-all">
              {hover.word}
            </div>
            <div className="text-base text-teczen-gray-800 font-semibold">
              {hover.loading ? (
                <span className="inline-block w-4 h-4 border-2 border-teczen-blue border-t-transparent rounded-full animate-spin" />
              ) : (
                hover.meaning
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-teczen-gray-200 text-xs text-teczen-gray-500">
              다른 단어 위에 마우스를 올려보세요
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-teczen-blue/10 to-white border-2 border-dashed border-teczen-blue/40 rounded-2xl p-4">
            <div className="text-2xl mb-2">💡</div>
            <div className="text-sm font-bold text-teczen-ink mb-1">
              모르는 단어가 있나요?
            </div>
            <div className="text-xs text-teczen-gray-600 leading-relaxed">
              영어 단어 위에 <b className="text-teczen-blue">마우스를 올리면</b>
              {" "}한글 뜻이 여기에 표시됩니다.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
