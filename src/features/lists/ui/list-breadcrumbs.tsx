import { ChevronRight } from "lucide-react";

import { routes } from "@/shared/lib/routes";
import { NavLink } from "@/shared/ui/nav-link";

export function ListBreadcrumbs({
  workspaceSlug,
  workspaceName,
  listName,
}: {
  workspaceSlug: string;
  workspaceName: string;
  listName: string;
}) {
  return (
    <nav className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
      <NavLink href={routes.workspace(workspaceSlug)} className="rounded-lg px-1.5 py-0.5 transition hover:bg-muted hover:text-foreground">
        {workspaceName}
      </NavLink>
      <ChevronRight className="size-3.5 opacity-60" />
      <NavLink href={routes.workspaceLists(workspaceSlug)} className="rounded-lg px-1.5 py-0.5 transition hover:bg-muted hover:text-foreground">
        Lists
      </NavLink>
      <ChevronRight className="size-3.5 opacity-60" />
      <span className="min-w-0 truncate rounded-lg px-1.5 py-0.5 text-foreground/85">{listName}</span>
    </nav>
  );
}
