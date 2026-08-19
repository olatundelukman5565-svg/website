import type { ChatAttachment } from "@/types";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatAttachmentPreview({ attachment }: { attachment: ChatAttachment }) {
  if (attachment.kind === "image") {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-h-48 w-auto rounded-lg border border-black/5 object-cover"
        />
      </a>
    );
  }

  if (attachment.kind === "video") {
    return (
      <video
        controls
        preload="metadata"
        src={attachment.url}
        className="max-h-48 w-full max-w-full rounded-lg border border-black/5 bg-black"
      />
    );
  }

  const icon = attachment.kind === "pdf" ? "📄" : "📎";
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-black/10 bg-white/60 px-3 py-2 text-xs"
    >
      <span aria-hidden className="text-base">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{attachment.name}</span>
      <span className="shrink-0 opacity-60">{formatSize(attachment.size)}</span>
    </a>
  );
}
