import { answerQuestion } from "@/lib/assistant/answer";
import { assistantConfig } from "@/lib/assistant/config";
import { parseTurns, redactSensitive } from "@/lib/assistant/guard";
import { allowAssistantRequest } from "@/lib/assistant/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

function logDiagnostic(outcome: string, sourceIds: string[], message?: string) {
  const config = assistantConfig();
  if (!config.logDiagnostics && !config.logMessages) return;
  const entry: Record<string, string> = {
    assistant: "help",
    outcome,
    sources: sourceIds.join(","),
    at: new Date().toISOString(),
  };
  if (config.logMessages && message) {
    entry.message = redactSensitive(message).slice(0, 500);
  }
  console.info(JSON.stringify(entry));
}

export async function POST(request: Request) {
  const config = assistantConfig();
  if (!allowAssistantRequest(clientKey(request), config.rateLimitPerMinute)) {
    return Response.json(
      {
        error:
          "Too many messages in a short time. Please wait a minute, or contact the AfriGrow team.",
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send a short question in plain text." }, { status: 400 });
  }

  const turns = parseTurns(
    body && typeof body === "object" ? (body as { messages?: unknown }).messages : null,
  );
  if (!turns) {
    return Response.json(
      { error: "Send up to 8 short messages. The latest one should be your question." },
      { status: 400 },
    );
  }

  try {
    const answer = await answerQuestion(turns);
    logDiagnostic(
      answer.providerUsed ? "model" : "excerpts",
      answer.sources.map((source) => source.href),
      turns[turns.length - 1]?.content,
    );
    return Response.json({
      reply: answer.reply,
      sources: answer.sources,
      grounded: answer.grounded,
      providerUsed: answer.providerUsed,
    });
  } catch {
    logDiagnostic("error", []);
    return Response.json(
      {
        error: "The assistant could not answer just now. Please try again, or contact the team.",
      },
      { status: 500 },
    );
  }
}
