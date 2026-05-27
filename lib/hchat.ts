import type { AiFeedback, QuestionType, Level } from "@/types";
import { scoreToLevel } from "./scoring";

interface FeedbackRequest {
  type: QuestionType;
  question: string;
  userAnswer: string;
  sampleAnswer?: string;
  targetLevel: Level;
  context?: string;
}

interface HchatConfig {
  apiKey: string;
  model?: string;
}

const FEEDBACK_PROMPT = (req: FeedbackRequest) => `You are a STRICT English speaking exam evaluator for the Korean SPA (Speaking Proficiency Assessment) test used by Hyundai Motor Group.

The SPA exam uses a 96-point scale across 8 levels:
- Lv 1 (0-15): Cannot communicate, only fragmented words
- Lv 2 (16-24): Basic words, very limited
- Lv 3 (25-34): Simple sentences, frequent errors
- Lv 4 (35-49): Can communicate basic ideas with errors
- Lv 5 (50-64): Functional business communication
- Lv 6 (65-74): Good business English (overseas assignment minimum)
- Lv 7 (75-84): Fluent business English (promotion standard)
- Lv 8 (85-96): Near-native business proficiency

STRICT SCORING RUBRIC - Be harsh:
- 1 short sentence (under 15 words): max Lv 2 (16-24 pts)
- 2-3 sentences (15-40 words): max Lv 3-4 (25-49 pts)
- 4-6 sentences (40-80 words) with logical flow: Lv 4-5 (35-64 pts)
- 7+ sentences (80-150 words) with examples and varied vocabulary: Lv 5-6 (50-74 pts)
- Sophisticated structures, idioms, business vocabulary, clear organization: Lv 7-8

EVALUATION CRITERIA (발음 / 어휘 / 문법 / 발화량 / 일관성):
1. 발화량 (Length/Fluency): Word count, complete sentences
2. 어휘 (Vocabulary): Variety, business appropriateness, accuracy
3. 문법 (Grammar): Subject-verb agreement, tense, articles, prepositions
4. 일관성 (Coherence): Logical flow, examples, conclusion
5. 정확성 (Accuracy): Directly addresses the question

Question Type ${req.type} (${
  req.type === 1
    ? "Business Casual"
    : req.type === 2
    ? "Opinion"
    : req.type === 3
    ? "Visual Description"
    : "Passage Summary"
})
Question: ${req.question}
${req.context ? `Context: ${req.context}\n` : ""}
User's Answer (${req.userAnswer.split(/\s+/).filter(Boolean).length} words): ${req.userAnswer}
User's Target Level: Lv ${req.targetLevel}

IMPORTANT: All feedback text (strengths, improvements, grammarIssues, vocabularySuggestions, betterExpressions) MUST be written in KOREAN (한국어). Only the modelAnswer (sample answer) should be in English.

Also score each of the 5 criteria from 0 to 100 (percentage of mastery), so the user sees exactly why they got their score:
- pronunciation (발음): estimate from word choice/structure complexity since you only see text
- vocabulary (어휘): variety and business-appropriateness
- grammar (문법): correctness
- fluency (발화량): length and sentence completeness
- coherence (일관성): logical flow and organization

Return ONLY valid JSON in this exact structure:
{
  "grammarIssues": ["문법 오류 + 교정 (한국어로)"],
  "vocabularySuggestions": ["더 나은 표현 제안 (한국어 설명 + 영어 단어)"],
  "betterExpressions": ["자연스러운 표현 (한국어 설명 + 영어 예시)"],
  "modelAnswer": "영어로 작성된 목표 등급 수준의 모범답안",
  "estimatedLevel": <1~8 숫자>,
  "scoreEstimate": <0~96 숫자>,
  "criteria": { "pronunciation": <0~100>, "vocabulary": <0~100>, "grammar": <0~100>, "fluency": <0~100>, "coherence": <0~100> },
  "strengths": ["잘한 점 (한국어로)"],
  "improvements": ["구체적인 개선점 (한국어로)"]
}

Be strict and honest. Score MUST match the rubric above. ALL FEEDBACK IN KOREAN except modelAnswer.`;

async function callProxy(
  config: HchatConfig,
  messages: { role: string; content: string }[],
  maxTokens = 1500,
): Promise<{ ok: boolean; content?: string; error?: string }> {
  try {
    const res = await fetch("/api/hchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: config.apiKey,
        model: config.model,
        messages,
        maxTokens,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      return { ok: false, error: data.error || `HTTP ${data.status || "?"}` };
    }
    return { ok: true, content: data.content };
  } catch (e: any) {
    return { ok: false, error: e.message || "fetch failed" };
  }
}

export async function getFeedback(
  req: FeedbackRequest,
  config: HchatConfig,
): Promise<AiFeedback> {
  if (!config.apiKey) {
    return strictMockFeedback(req);
  }

  const result = await callProxy(
    config,
    [
      {
        role: "system",
        content:
          "You are a strict SPA exam evaluator. Output only valid JSON. Be harsh in scoring - one sentence answers score under 25 points.",
      },
      { role: "user", content: FEEDBACK_PROMPT(req) },
    ],
    1500,
  );

  if (!result.ok || !result.content) {
    console.error("HChat call failed:", result.error);
    const mock = strictMockFeedback(req);
    mock.improvements.unshift(`⚠ AI 채점 실패 — ${result.error || "응답 없음"}`);
    return mock;
  }

  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("응답에 JSON 없음");
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      grammarIssues: parsed.grammarIssues || [],
      vocabularySuggestions: parsed.vocabularySuggestions || [],
      betterExpressions: parsed.betterExpressions || [],
      modelAnswer: parsed.modelAnswer || "",
      estimatedLevel: scoreToLevel(parsed.scoreEstimate || 30),
      scoreEstimate: parsed.scoreEstimate || 30,
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
      criteria: parsed.criteria || undefined,
    };
  } catch (e) {
    console.error("Parse fail:", e);
    return strictMockFeedback(req);
  }
}

function strictMockFeedback(req: FeedbackRequest): AiFeedback {
  const words = req.userAnswer.trim().split(/\s+/).filter(Boolean);
  const wc = words.length;
  const sentences = req.userAnswer.split(/[.!?]+/).filter((s) => s.trim()).length;

  let score: number;
  if (wc < 5) score = 5 + Math.floor(Math.random() * 10);
  else if (wc < 15) score = 16 + Math.floor(Math.random() * 8);
  else if (wc < 30) score = 25 + Math.floor(Math.random() * 10);
  else if (wc < 50) score = 35 + Math.floor(Math.random() * 12);
  else if (wc < 80) score = 50 + Math.floor(Math.random() * 12);
  else if (wc < 120) score = 60 + Math.floor(Math.random() * 12);
  else if (wc < 180) score = 70 + Math.floor(Math.random() * 12);
  else score = 80 + Math.floor(Math.random() * 10);

  if (sentences < 2) score = Math.min(score, 24);
  if (sentences < 3 && req.type === 2) score = Math.min(score, 30);

  const errors: string[] = [];
  if (wc < 30) errors.push("답변이 너무 짧음 — 최소 5문장, 60~80단어 이상 권장");
  if (sentences < 3) errors.push("문장 수 부족 — 최소 3~5문장");

  const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
  const lexicalDiversity = wc > 0 ? uniqueWords / wc : 0;
  const hasConnectors = /(however|but|because|since|so|therefore|for example|first|second|finally|in my view|i think)/i.test(req.userAnswer);
  const clamp = (n: number) => Math.max(5, Math.min(100, Math.round(n)));
  const base = (score / 96) * 100;

  const criteria = {
    pronunciation: clamp(base + (Math.random() * 10 - 5)),
    vocabulary: clamp(base * 0.6 + lexicalDiversity * 80),
    grammar: clamp(base + (sentences >= 3 ? 8 : -10)),
    fluency: clamp(Math.min(100, wc * 1.1)),
    coherence: clamp(base * 0.7 + (hasConnectors ? 25 : 0) + (sentences >= 4 ? 10 : 0)),
  };

  return {
    grammarIssues: ["(Mock - HChat API 미연결) 문법 자동 검사를 위해 API 설정 필요"],
    vocabularySuggestions: [
      `(Mock) 단어 수: ${wc}개 — ${wc < 50 ? "비즈니스 어휘 추가 필요" : "다양한 어휘 권장"}`,
    ],
    betterExpressions: [
      "(Mock) 도입: 'From my experience,...' / 'In my view,...'",
      "(Mock) 근거: 'For instance,...' / 'For example,...'",
    ],
    modelAnswer: req.sampleAnswer
      ? `(목표 등급 Lv ${req.targetLevel} 기준)\n\n${req.sampleAnswer}`
      : "(HChat API 연결 시 목표 등급 맞춤 모범답안 생성)",
    estimatedLevel: scoreToLevel(score),
    scoreEstimate: score,
    strengths: [
      wc >= 50 ? `발화량 충분 (${wc}단어)` : `시도함 (${wc}단어)`,
    ],
    improvements: errors.length > 0 ? errors : [
      "더 구체적인 예시와 근거 추가",
      "고급 비즈니스 어휘 도입",
    ],
    criteria,
  };
}

export async function testConnection(
  config: HchatConfig,
): Promise<{ ok: boolean; message: string; details?: string }> {
  if (!config.apiKey) {
    return { ok: false, message: "API 키를 입력해주세요" };
  }
  const result = await callProxy(
    config,
    [{ role: "user", content: "Reply with just OK" }],
    30,
  );
  if (!result.ok) {
    return {
      ok: false,
      message: result.error || "연결 실패",
      details: result.error,
    };
  }
  return {
    ok: true,
    message: `연결 성공 — 응답: "${(result.content || "").slice(0, 50)}"`,
  };
}

export async function translateWord(
  word: string,
  config: HchatConfig,
): Promise<string> {
  if (typeof window !== "undefined") {
    const cache = JSON.parse(localStorage.getItem("spa.wordCache") || "{}");
    if (cache[word.toLowerCase()]) return cache[word.toLowerCase()];
  }

  if (!config.apiKey) {
    return "(API 키 설정 필요)";
  }

  const result = await callProxy(
    config,
    [
      {
        role: "system",
        content:
          "You are a Korean-English dictionary. Output only the most common Korean meaning of the given English word in 5 characters or fewer. No explanation, no punctuation.",
      },
      { role: "user", content: word },
    ],
    30,
  );

  if (!result.ok || !result.content) return "—";

  const meaning = result.content.trim().replace(/^["']|["']$/g, "");
  if (typeof window !== "undefined") {
    const cache = JSON.parse(localStorage.getItem("spa.wordCache") || "{}");
    cache[word.toLowerCase()] = meaning;
    localStorage.setItem("spa.wordCache", JSON.stringify(cache));
  }
  return meaning;
}

export async function translateText(
  text: string,
  config: HchatConfig,
): Promise<string> {
  if (!config.apiKey) {
    return "(API 키 설정 필요 — 마이페이지에서 등록)";
  }

  const result = await callProxy(
    config,
    [
      {
        role: "system",
        content:
          "You are a professional Korean translator. Translate the given English text to natural Korean. Output only the Korean translation, no explanations or quotation marks.",
      },
      { role: "user", content: text },
    ],
    500,
  );

  if (!result.ok || !result.content) {
    return `(번역 실패: ${result.error || "응답 없음"})`;
  }
  return result.content.trim().replace(/^["']|["']$/g, "");
}

export function isHChatConfigured(apiKey: string): boolean {
  return !!apiKey;
}

export async function transcribeAudio(
  blob: Blob,
  apiKey: string,
  model = "whisper-1",
): Promise<{ ok: boolean; text?: string; error?: string }> {
  if (!apiKey) return { ok: false, error: "API 키가 없습니다" };
  try {
    const form = new FormData();
    form.append("audio", blob, "speech.webm");
    form.append("model", model);
    const res = await fetch("/api/stt", {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: form,
    });
    const data = await res.json();
    if (!data.ok) return { ok: false, error: data.error || "변환 실패" };
    return { ok: true, text: data.text };
  } catch (e: any) {
    return { ok: false, error: e.message || "fetch 실패" };
  }
}
