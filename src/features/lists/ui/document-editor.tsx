"use client";

import { useEffect, useRef, useState } from "react";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import type { PartialBlock } from "@blocknote/core";
import { useTheme } from "@/shared/ui/theme-provider";

import type { DocumentBlock } from "@/shared/lib/list-schema";

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
  const { theme } = useTheme();
  const [initialContent] = useState<PartialBlock[] | undefined>(() => (value && value.length > 0 ? (value as PartialBlock[]) : undefined));
  const editor = useCreateBlockNote({
    initialContent,
  }, []);
  const lastSerializedValueRef = useRef<string | null>(value ? JSON.stringify(value) : null);

  useEffect(() => {
    const serializedValue = value ? JSON.stringify(value) : null;
    if (serializedValue === lastSerializedValueRef.current) {
      return;
    }

    lastSerializedValueRef.current = serializedValue;
    void editor.replaceBlocks(editor.document, value && value.length > 0 ? (value as PartialBlock[]) : []);
  }, [editor, value]);

  return (
    <div className={`omnilist-blocknote overflow-hidden ${variant === "page" ? "omnilist-blocknote-page" : "rounded-2xl border border-border/60 bg-background/60"} ${compact ? "omnilist-blocknote-compact" : ""}`} dir="ltr">
      <BlockNoteView
        editor={editor}
        theme={theme}
        className="omnilist-blocknote-view"
        sideMenu
        formattingToolbar
        linkToolbar
        slashMenu
        filePanel
        tableHandles
        emojiPicker
        onChange={() => {
          const nextBlocks = editor.document as unknown as DocumentBlock[];
          lastSerializedValueRef.current = JSON.stringify(nextBlocks);
          onChange(nextBlocks);
        }}
      />
    </div>
  );
}
