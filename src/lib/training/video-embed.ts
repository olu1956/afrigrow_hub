export type LessonVideoEmbed = {
  provider: "youtube" | "vimeo";
  embedUrl: string;
  watchUrl: string;
};

function youtubeId(url: URL): string | null {
  if (url.hostname === "youtu.be") {
    return url.pathname.replace("/", "").split("/")[0] || null;
  }
  if (
    url.hostname === "www.youtube.com" ||
    url.hostname === "youtube.com" ||
    url.hostname === "m.youtube.com" ||
    url.hostname === "www.youtube-nocookie.com"
  ) {
    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/")[2] || null;
    }
    if (url.pathname.startsWith("/shorts/")) {
      return url.pathname.split("/")[2] || null;
    }
    return url.searchParams.get("v");
  }
  return null;
}

function vimeoId(url: URL): string | null {
  if (url.hostname === "vimeo.com" || url.hostname === "www.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] && /^\d+$/.test(parts[0]) ? parts[0] : null;
  }
  if (url.hostname === "player.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] === "video" && parts[1] && /^\d+$/.test(parts[1]) ? parts[1] : null;
  }
  return null;
}

export function parseLessonVideoUrl(raw: string): LessonVideoEmbed | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    const yt = youtubeId(url);
    if (yt) {
      return {
        provider: "youtube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${yt}`,
        watchUrl: `https://www.youtube.com/watch?v=${yt}`,
      };
    }
    const vim = vimeoId(url);
    if (vim) {
      return {
        provider: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${vim}`,
        watchUrl: `https://vimeo.com/${vim}`,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function validateOptionalLessonVideoUrl(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (!parseLessonVideoUrl(trimmed)) {
    return "Use a YouTube or Vimeo link for now (hosted video comes later).";
  }
  return undefined;
}
