import type { ChatTurn } from "@/lib/assistant/types";

type ProviderResult = { ok: true; text: string } | { ok: false };

/**
 * OpenAI-compatible chat completions. Isolated so the provider can change
 * without touching the page. `store: false` asks APIs that support it not to
 * retain the completion. AfriGrow must still confirm the provider's terms.
 */
export async function completeWithProvider(input: {
  system: string;
  messages: ChatTurn[];
}): Promise<ProviderResult> {
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) return { ok: false };

  const base = (process.env.AI_API_BASE_URL?.trim() || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const model = process.env.AI_MODEL?.trim() || "gpt-4o-mini";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        store: false,
        messages: [
          { role: "system", content: input.system },
          ...input.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
      }),
    });

    if (!response.ok) return { ok: false };
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) return { ok: false };
    return { ok: true, text };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timeout);
  }
}
