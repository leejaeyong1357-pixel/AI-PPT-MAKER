export const HCHAT_BASE_URL =
  "https://internal-apigw-kr.hmg-corp.io/hchat-in/api/v3";

export const AVAILABLE_MODELS = [
  { value: "claude-sonnet-4-6", label: "claude-sonnet-4-6 (권장)", provider: "anthropic" },
  { value: "claude-haiku-4-5", label: "claude-haiku-4-5 (빠름)", provider: "anthropic" },
  { value: "gpt-4.1", label: "gpt-4.1 (Azure)", provider: "azure" },
] as const;

export function endpointForModel(model: string): string {
  if (model.startsWith("claude")) return `${HCHAT_BASE_URL}/claude`;
  return HCHAT_BASE_URL;
}

export const APP_NAME = "SPEAKZEN";
export const APP_TAGLINE = "by TECZEN";
