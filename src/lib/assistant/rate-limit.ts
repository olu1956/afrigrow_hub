const buckets = new Map<string, number[]>();

/** Per server instance only. A new deploy or extra instance does not share this count. */
export function allowAssistantRequest(key: string, limit: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((timestamp) => now - timestamp < 60_000);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 2000) buckets.clear();
  return true;
}
