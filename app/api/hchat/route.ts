import { NextResponse } from "next/server";

interface ProxyRequest {
  endpoint: string;
  apiKey: string;
  model?: string;
  messages: { role: string; content: string }[];
  maxTokens?: number;
  temperature?: number;
}

function detectProvider(endpoint: string): "anthropic" | "openai" {
  if (/claude|anthropic|\/v3\/claude/i.test(endpoint)) return "anthropic";
  return "openai";
}

function buildUrl(endpoint: string, provider: "anthropic" | "openai") {
  if (provider === "anthropic") {
    if (/\/messages\/?$/.test(endpoint)) return endpoint;
    return endpoint.replace(/\/$/, "") + "/messages";
  }
  if (/\/chat\/completions\/?$/.test(endpoint)) return endpoint;
  return endpoint.replace(/\/$/, "") + "/chat/completions";
}

export async function POST(req: Request) {
  let body: ProxyRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" });
  }

  const { endpoint, apiKey, model, messages, maxTokens = 1500, temperature = 0.3 } = body;

  if (!endpoint || !apiKey) {
    return NextResponse.json({ ok: false, error: "endpoint, apiKey 필수" });
  }

  const provider = detectProvider(endpoint);
  const url = buildUrl(endpoint, provider);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let requestBody: any;

  if (provider === "anthropic") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";

    const systemMsg = messages.find((m) => m.role === "system");
    const otherMsgs = messages.filter((m) => m.role !== "system");
    requestBody = {
      model: model || "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: otherMsgs,
      ...(systemMsg ? { system: systemMsg.content } : {}),
    };
  } else {
    headers["Authorization"] = `Bearer ${apiKey}`;
    requestBody = {
      model: model || "gpt-4.1",
      messages,
      max_tokens: maxTokens,
      temperature,
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    const rawText = await response.text();
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    if (!response.ok) {
      const errMsg =
        data?.error?.message ||
        data?.message ||
        data?.error ||
        data?.raw ||
        `HTTP ${response.status} ${response.statusText}`;
      return NextResponse.json({
        ok: false,
        status: response.status,
        provider,
        url,
        error: typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg),
      });
    }

    const content =
      provider === "anthropic"
        ? data.content?.[0]?.text || data.content?.[0]?.value || ""
        : data.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      ok: true,
      content,
      provider,
      model: data.model,
      usage: data.usage,
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: `Network error: ${e.message || "unknown"} (URL: ${url})`,
    });
  }
}
