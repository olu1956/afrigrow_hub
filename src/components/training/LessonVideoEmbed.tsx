"use client";

import { parseLessonVideoUrl } from "@/lib/training/video-embed";

export function LessonVideoEmbed({ url, title }: { url: string; title: string }) {
  const embed = parseLessonVideoUrl(url);
  if (!embed) {
    if (!url.trim()) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-semibold text-primary hover:underline"
      >
        Open video
      </a>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-black">
      <iframe
        title={title}
        src={embed.embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full"
      />
    </div>
  );
}
