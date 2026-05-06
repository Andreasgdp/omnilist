"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function PendingButton({
  children,
  pendingLabel,
  ...props
}: React.ComponentProps<typeof Button> & {
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} aria-disabled={pending || props.disabled} disabled={pending || props.disabled}>
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          {pendingLabel ?? children}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
