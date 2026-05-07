"use client";

import dynamic from "next/dynamic";

import type { DocumentBlock } from "@/shared/lib/list-schema";

const DocumentEditorClient = dynamic(() => import("@/features/lists/ui/document-editor-client").then((mod) => mod.DocumentEditorClient), {
  ssr: false,
  loading: () => <div className="omnilist-blocknote-placeholder" />,
});

export function DocumentEditor({
  value,
  onChange,
  compact = false,
  variant = "card",
}: {
  value?: DocumentBlock[];
  onChange: (blocks: DocumentBlock[]) => void;
  compact?: boolean;
  variant?: "card" | "page";
}) {
  return (
    <div className={`omnilist-blocknote overflow-hidden ${variant === "page" ? "omnilist-blocknote-page" : "rounded-2xl border border-border/60 bg-background/60"} ${compact ? "omnilist-blocknote-compact" : ""}`} dir="ltr">
      <DocumentEditorClient value={value} onChange={onChange} />
    </div>
  );
}
