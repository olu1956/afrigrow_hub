function renderInline(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function GuideBody({ body }: { body: string }) {
  const blocks = body.trim().split(/\n\n+/);

  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground sm:text-base">
      {blocks.map((block, index) => {
        const trimmed = block.trim();

        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={index}
              className="pt-2 text-lg font-bold text-foreground"
              dangerouslySetInnerHTML={{ __html: renderInline(trimmed.slice(3)) }}
            />
          );
        }

        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").filter((line) => line.startsWith("- "));
          return (
            <ul key={index} className="list-disc space-y-2 pl-5 text-muted">
              {items.map((item) => (
                <li
                  key={item}
                  dangerouslySetInnerHTML={{ __html: renderInline(item.slice(2)) }}
                />
              ))}
            </ul>
          );
        }

        return (
          <p
            key={index}
            className="text-muted"
            dangerouslySetInnerHTML={{ __html: renderInline(trimmed) }}
          />
        );
      })}
    </div>
  );
}
