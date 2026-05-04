import { requireWorkspaceAccess } from "@/features/workspaces/server/access";
import { AppShell } from "@/shared/ui/app-shell";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { session, workspace } = await requireWorkspaceAccess(workspaceSlug);

  return (
    <AppShell workspaceName={workspace.name} workspaceSlug={workspace.slug} userName={session.user.name}>
      {children}
    </AppShell>
  );
}
