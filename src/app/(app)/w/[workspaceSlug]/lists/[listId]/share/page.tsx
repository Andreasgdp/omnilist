import { eq } from "drizzle-orm";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/client";
import { workspaceMembers } from "@/db/schema";
import { getListDetail } from "@/features/lists/server/queries";
import { ShareListForm } from "@/features/lists/ui/share-list-form";
import { requireWorkspaceAccess } from "@/features/workspaces/server/access";

export default async function ShareListPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; listId: string }>;
}) {
  const { workspaceSlug, listId } = await params;
  const { session, workspace } = await requireWorkspaceAccess(workspaceSlug);
  const detail = await getListDetail({
    listId,
    userId: session.user.id,
    workspaceId: workspace.id,
  });

  if (!detail) {
    return null;
  }

  const members = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.workspaceId, workspace.id),
    with: {
      user: true,
    },
  });

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle>Share list</CardTitle>
          <CardDescription>
            Owners can grant editor or viewer access. Editors can only grant viewers.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardContent className="pt-6">
          <ShareListForm
            listId={detail.list.id}
            workspaceId={workspace.id}
            workspaceSlug={workspace.slug}
            members={members
              .filter((member) => member.userId !== session.user.id)
              .map((member) => ({
                userId: member.userId,
                userName: member.user.name,
                userEmail: member.user.email,
              }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
