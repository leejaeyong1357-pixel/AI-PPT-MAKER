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

const FEEDBACK_PROMPT = (req: FeedbackRequest) => `You are an English speaking exam evaluator for the Korean SPA (Speaking Proficiency Assessment) used by Hyundai Motor Group.

Evaluate the following user answer.

Question Type: ${req.type} (${
  req.type === 1
    ? "Business Casual - personal/daily Q&A"
    : req.type === 2
    ? "Opinion - argumentative response"
    : req.type === 3
    ? "Visual Description - chart/photo description"
    : "Passage Summary - 60-second summary"
})
Question: ${req.question}
${req.context ? `Context: ${req.context}\n` : ""}
User's Answer: ${req.userAnswer}

User's Target Level: Lv ${req.targetLevel} (SPA grading: Lv 1 = beginner, Lv 8 = near-native business English; max score 96)

Return ONLY valid JSON in this exact structure:
{
  "grammarIssues": ["specific grammar errors found, with corrections"],
  "vocabularySuggestions": ["better word choices, with reasoning"],
  "betterExpressions": ["natural alternative phrasings"],
  "modelAnswer": "An improved version of the user's answer at their target level",
  "estimatedLevel": <number 1-8>,
  "scoreEstimate": <number 0-96>,
  "strengths": ["what the user did well"],
  "improvements": ["specific actionable improvements"]
}

Be concise. Each list should have 1-4 items. Focus on actionable feedback.`;

export async function getFeedback(
  req: FeedbackRequest,
  config: { endpoint: string; apiKey: string },
): Promise<AiFeedback> {
  if (!config.endpoint || !config.apiKey) {
    return mockFeedback(req);
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
          { role: "system", content: "You are an SPA exam evaluator. Output only JSON." },
          { role: "user", content: FEEDBACK_PROMPT(req) },
        ],
        temperature: 0.3,
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
      estimatedLevel: scoreToLevel(parsed.scoreEstimate || 50),
      scoreEstimate: parsed.scoreEstimate || 50,
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
    };
  } catch (err) {
    console.error("HChat call failed, returning mock:", err);
    return mockFeedback(req);
  }
}

function mockFeedback(req: FeedbackRequest): AiFeedback {
  const wordCount = req.userAnswer.split(/\s+/).filter(Boolean).length;
  const baseScore = Math.min(96, Math.max(20, 35 + wordCount * 0.8));
  const score = Math.floor(baseScore + (Math.random() * 10 - 5));

  return {
    grammarIssues: [
      "(Mock) Subject-verb agreement check needed in your response",
      "(Mock) Consider article usage (a/the) before specific nouns",
    ],
    vocabularySuggestions: [
      "(Mock) Try 'consequently' instead of 'so' for more formal tone",
      "(Mock) 'demonstrate' is more appropriate than 'show' in business contexts",
    ],
    betterExpressions: [
      "(Mock) Open with: 'In my view...' or 'From my experience...'",
      "(Mock) Use linking words: 'Furthermore', 'However', 'As a result'",
    ],
    modelAnswer: `(Mock answer - configure HChat API for real feedback) ${req.sampleAnswer || "A well-structured answer should include a clear opening statement, 2-3 supporting points with examples, and a brief conclusion."}`,
    estimatedLevel: scoreToLevel(score),
    scoreEstimate: score,
    strengths: [
      wordCount > 30 ? "Good response length" : "Response is concise",
      "(Mock) Clear topic identification",
    ],
    improvements: [
      wordCount < 30 ? "Try to elaborate more with examples" : "Maintain logical flow throughout",
      "(Mock) Use more varied sentence structures",
      "(Mock) Add specific examples to support your points",
    ],
  };
}

export function isHChatConfigured(endpoint: string, apiKey: string): boolean {
  return !!(endpoint && apiKey);
}
