import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createListAction } from "@/features/lists/server/actions";
import { getListsForWorkspace } from "@/features/lists/server/queries";
import { CreateListForm } from "@/features/lists/ui/create-list-form";
import { requireWorkspaceAccess } from "@/features/workspaces/server/access";

export default async function NewListPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { session, workspace } = await requireWorkspaceAccess(workspaceSlug);
  const availableLists = await getListsForWorkspace({
    workspaceId: workspace.id,
    userId: session.user.id,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a list</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateListForm
          action={createListAction}
          workspaceId={workspace.id}
          workspaceSlug={workspace.slug}
          availableLists={availableLists.map((list) => ({ id: list.id, name: list.name }))}
        />
      </CardContent>
    </Card>
  );
}
