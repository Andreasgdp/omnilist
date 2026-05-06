"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils";

export function NavLink({
  href,
  className,
  activeClassName,
  activePrefixes,
  children,
}: {
  href: string;
  className?: string;
  activeClassName?: string;
  activePrefixes?: string[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const isActive = pathname === href || (activePrefixes ?? []).some((prefix) => pathname.startsWith(prefix));

  return (
    <Link
      href={href}
      className={cn(
        "relative transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985]",
        className,
        isActive && activeClassName,
        isPending && "scale-[0.99] opacity-85 shadow-sm",
      )}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }

        event.preventDefault();
        startTransition(() => {
          router.push(href);
        });
      }}
    >
      {children}
      {isPending ? (
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-primary/30 shadow-[0_0_0_10px_color-mix(in_oklab,var(--primary)_10%,transparent)]" aria-hidden="true">
          <span className="absolute right-3 top-3 size-3 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
        </span>
      ) : null}
    </Link>
  );
}
