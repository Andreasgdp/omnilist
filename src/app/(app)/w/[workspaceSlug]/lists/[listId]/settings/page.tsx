import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>List settings</CardTitle>
        <CardDescription>
          Schema editing and advanced controls can grow here. The current definition is shown below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
          {JSON.stringify(detail.fields, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
