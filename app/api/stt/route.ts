import { NextResponse } from "next/server";
import { HCHAT_BASE_URL } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "API 키가 없습니다" });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "오디오 데이터 파싱 실패" });
  }

  const audio = form.get("audio") as File | null;
  const model = (form.get("model") as string) || "whisper-1";
  if (!audio) {
    return NextResponse.json({ ok: false, error: "오디오 파일이 없습니다" });
  }

  const url = `${HCHAT_BASE_URL.replace(/\/$/, "")}/audio/transcriptions`;

  const upstream = new FormData();
  upstream.append("file", audio, "speech.webm");
  upstream.append("model", model);
  upstream.append("language", "en");
  upstream.append("response_format", "json");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "x-api-key": apiKey,
      },
      body: upstream,
    });

    const raw = await res.text();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    if (!res.ok) {
      const errMsg =
        data?.error?.message || data?.message || data?.raw || `HTTP ${res.status}`;
      return NextResponse.json({
        ok: false,
        status: res.status,
        error: typeof errMsg === "string" ? errMsg.slice(0, 300) : JSON.stringify(errMsg),
      });
    }

    const text = data.text || data.transcript || data.result || "";
    return NextResponse.json({ ok: true, text });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: `네트워크 오류: ${e.message || "unknown"}`,
    });
  }
}
