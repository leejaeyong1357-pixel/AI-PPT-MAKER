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
  endpoint: string;
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

Return ONLY valid JSON in this exact structure:
{
  "grammarIssues": ["specific errors with corrections"],
  "vocabularySuggestions": ["better word choices with Korean meaning"],
  "betterExpressions": ["natural phrasings with Korean translation"],
  "modelAnswer": "improved version at TARGET level",
  "estimatedLevel": <number 1-8>,
  "scoreEstimate": <number 0-96>,
  "strengths": ["specific things done well"],
  "improvements": ["specific actionable improvements"]
}

Be strict and honest. Score MUST match the rubric above.`;

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
        endpoint: config.endpoint,
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
  if (!config.endpoint || !config.apiKey) {
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
  };
}

export async function testConnection(
  config: HchatConfig,
): Promise<{ ok: boolean; message: string; details?: string }> {
  if (!config.endpoint || !config.apiKey) {
    return { ok: false, message: "Endpoint URL 또는 API 키가 비어있습니다" };
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

  if (!config.endpoint || !config.apiKey) {
    return "(HChat API 설정 필요)";
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

export function isHChatConfigured(endpoint: string, apiKey: string): boolean {
  return !!(endpoint && apiKey);
}
