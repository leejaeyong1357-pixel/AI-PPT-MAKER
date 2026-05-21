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

DEDUCT POINTS for:
- Grammar errors (-2 each)
- Off-topic content (-10)
- Repetition without development (-5)
- Missing follow-up details (-3)
- Korean-style English literal translation (-3)

EVALUATION CRITERIA:
1. 발화량 (Length/Fluency): Word count, complete sentences
2. 어휘 (Vocabulary): Variety, business appropriateness, accuracy
3. 문법 (Grammar): Subject-verb agreement, tense, articles, prepositions
4. 일관성 (Coherence): Logical flow, examples, conclusion
5. 정확성 (Accuracy): Directly addresses the question

Question Type: ${req.type} (${
  req.type === 1
    ? "Business Casual - personal/daily Q&A"
    : req.type === 2
    ? "Opinion - argumentative with reasoning"
    : req.type === 3
    ? "Visual Description - chart/photo analysis"
    : "Passage Summary - 60-second summary of heard text"
})
Question: ${req.question}
${req.context ? `Context: ${req.context}\n` : ""}
User's Answer (${req.userAnswer.split(/\s+/).filter(Boolean).length} words): ${req.userAnswer}
User's Target Level: Lv ${req.targetLevel}

Return ONLY valid JSON in this exact structure:
{
  "grammarIssues": ["specific errors with corrections, e.g. 'I goes' → 'I go'"],
  "vocabularySuggestions": ["better word choices with Korean meaning, e.g. 'Try demonstrate (보여주다) instead of show'"],
  "betterExpressions": ["natural phrasings with Korean translation"],
  "modelAnswer": "An improved version of the user's answer matching their TARGET level (not the current level)",
  "estimatedLevel": <number 1-8>,
  "scoreEstimate": <number 0-96>,
  "strengths": ["specific things they did well"],
  "improvements": ["specific actionable improvements"]
}

Be strict and honest. A one-sentence response should NOT score 50+. Score MUST match the rubric above.`;

export async function getFeedback(
  req: FeedbackRequest,
  config: { endpoint: string; apiKey: string },
): Promise<AiFeedback> {
  if (!config.endpoint || !config.apiKey) {
    return strictMockFeedback(req);
  }

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a strict SPA exam evaluator. Output only valid JSON. Be harsh in scoring - one sentence answers score under 25 points.",
          },
          { role: "user", content: FEEDBACK_PROMPT(req) },
        ],
        temperature: 0.2,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) throw new Error(`HChat API error: ${response.status}`);

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ||
      data.message?.content ||
      data.content ||
      data.response ||
      "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format");

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
  } catch (err) {
    console.error("HChat call failed, returning mock:", err);
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
  if (sentences < 3) errors.push("문장 수가 부족 — 최소 3~5문장 필요");

  const lowerAns = req.userAnswer.toLowerCase();
  if (!/(however|but|because|since|so|therefore|for example|first|second|finally|in my view|i think)/.test(lowerAns)) {
    errors.push("논리 연결어 부재 (However / Because / For example 등) — 구조화 필요");
  }

  return {
    grammarIssues: [
      "(Mock - HChat API 미연결) 문법 자동 검사를 위해 API 설정 필요",
      ...(errors.length > 0 ? [errors[0]] : []),
    ],
    vocabularySuggestions: [
      `(Mock) 단어 수: ${wc}개 — ${wc < 50 ? "비즈니스 어휘 추가 필요 (demonstrate, consider, regarding 등)" : "다양한 어휘 사용 권장"}`,
      "(Mock) Korean-style English 피하기 — 'I think that...' 대신 'In my view...'",
    ],
    betterExpressions: [
      "(Mock) 도입: 'From my experience,...' / 'I would say that...'",
      "(Mock) 근거: 'For instance,...' / 'A good example is...'",
      "(Mock) 마무리: 'Overall,...' / 'For these reasons,...'",
    ],
    modelAnswer: req.sampleAnswer
      ? `(목표 등급 Lv ${req.targetLevel} 기준 모범답안)\n\n${req.sampleAnswer}`
      : "(HChat API 연결 시 목표 등급 맞춤 모범답안 생성됨)",
    estimatedLevel: scoreToLevel(score),
    scoreEstimate: score,
    strengths: [
      wc >= 50 ? `발화량 충분 (${wc}단어)` : `시도함 (${wc}단어)`,
      sentences >= 3 ? `${sentences}개 문장 구성` : "발화 기록됨",
    ],
    improvements: errors.length > 0 ? errors : [
      "더 구체적인 예시와 근거 추가",
      "고급 비즈니스 어휘 도입 (consequently, furthermore, regarding 등)",
      "마무리 문장으로 답변 정리",
    ],
  };
}

export async function testConnection(config: {
  endpoint: string;
  apiKey: string;
}): Promise<{ ok: boolean; message: string }> {
  if (!config.endpoint || !config.apiKey) {
    return { ok: false, message: "Endpoint URL 또는 API 키가 비어있습니다" };
  }
  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Reply with just 'OK'" }],
        max_tokens: 10,
      }),
    });
    if (!response.ok) {
      return {
        ok: false,
        message: `HTTP ${response.status} — ${response.statusText || "응답 실패"}`,
      };
    }
    await response.json();
    return { ok: true, message: "연결 성공! AI 피드백이 활성화됩니다." };
  } catch (e: any) {
    return {
      ok: false,
      message: `네트워크 오류: ${e.message || "endpoint URL 확인"}`,
    };
  }
}

export async function translateWord(
  word: string,
  config: { endpoint: string; apiKey: string },
): Promise<string> {
  if (typeof window !== "undefined") {
    const cache = JSON.parse(localStorage.getItem("spa.wordCache") || "{}");
    if (cache[word.toLowerCase()]) return cache[word.toLowerCase()];
  }

  if (!config.endpoint || !config.apiKey) {
    return "(HChat API 설정 필요)";
  }

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a Korean-English dictionary. Output only the most common Korean meaning of the given English word in 5 characters or fewer. No explanation.",
          },
          { role: "user", content: word },
        ],
        max_tokens: 30,
        temperature: 0,
      }),
    });
    const data = await response.json();
    const meaning = (
      data.choices?.[0]?.message?.content ||
      data.message?.content ||
      data.content ||
      ""
    )
      .trim()
      .replace(/^["']|["']$/g, "");

    if (typeof window !== "undefined") {
      const cache = JSON.parse(localStorage.getItem("spa.wordCache") || "{}");
      cache[word.toLowerCase()] = meaning;
      localStorage.setItem("spa.wordCache", JSON.stringify(cache));
    }
    return meaning;
  } catch {
    return "—";
  }
}

export function isHChatConfigured(endpoint: string, apiKey: string): boolean {
  return !!(endpoint && apiKey);
}
