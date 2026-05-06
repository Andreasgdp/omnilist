import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateListAction } from "@/features/lists/server/actions";
import { getListsForWorkspace } from "@/features/lists/server/queries";
import { CreateListForm } from "@/features/lists/ui/create-list-form";
import { getListDetail } from "@/features/lists/server/queries";
import { requireWorkspaceAccess } from "@/features/workspaces/server/access";

export default async function ListSettingsPage({
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

  const availableLists = await getListsForWorkspace({
    workspaceId: workspace.id,
    userId: session.user.id,
  });

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle>Customize list</CardTitle>
          <CardDescription>
            Change the name, visibility, and fields in one place. Keep it simple now and refine it as the list grows.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardContent className="pt-6">
          <CreateListForm
            action={updateListAction}
            workspaceId={workspace.id}
            workspaceSlug={workspace.slug}
            listId={detail.list.id}
            initialName={detail.list.name}
            initialDescription={detail.list.description}
            initialVisibility={detail.list.visibility}
            initialFields={detail.fields}
            availableLists={availableLists.map((list) => ({ id: list.id, name: list.name }))}
            submitLabel="Save changes"
            allowReorder
          />
        </CardContent>
      </Card>
    </div>
  );
}
