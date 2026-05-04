import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateListForm } from "@/features/lists/ui/create-list-form";
import { requireWorkspaceAccess } from "@/features/workspaces/server/access";

export default async function NewListPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { workspace } = await requireWorkspaceAccess(workspaceSlug);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a list</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateListForm workspaceId={workspace.id} workspaceSlug={workspace.slug} />
      </CardContent>
    </Card>
  );
}
