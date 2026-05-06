"use client";

import { useMemo } from "react";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import type { PartialBlock } from "@blocknote/core";

type DocumentBlock = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  content?: unknown[];
  children?: unknown[];
};

export function DocumentEditor({
  value,
  onChange,
}: {
  value?: DocumentBlock[];
  onChange: (blocks: DocumentBlock[]) => void;
}) {
  const initialContent = useMemo(
    () => (value && value.length > 0 ? (value as PartialBlock[]) : undefined),
    [value],
  );
  const editor = useCreateBlockNote({
    initialContent,
  }, [initialContent]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/60">
      <BlockNoteView
        editor={editor}
        onChange={() => {
          onChange(editor.document as unknown as DocumentBlock[]);
        }}
      />
    </div>
  );
}
