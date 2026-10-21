function readPath(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

function readPositiveInt(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 120) return fallback;
  return Math.floor(parsed);
}

export function assistantConfig() {
  return {
    privacyHref: readPath("ASSISTANT_PRIVACY_PATH", "/privacy"),
    supportHref: readPath("ASSISTANT_SUPPORT_PATH", "/contact"),
    rateLimitPerMinute: readPositiveInt("ASSISTANT_RATE_LIMIT_PER_MINUTE", 12),
    providerConfigured: Boolean(process.env.AI_API_KEY?.trim()),
    logDiagnostics: process.env.ASSISTANT_LOG_DIAGNOSTICS === "true",
    logMessages: process.env.ASSISTANT_LOG_MESSAGES === "true",
  };
}
