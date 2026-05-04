import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FieldDefinition } from "@/shared/lib/list-schema";

export function ListTable({
  fields,
  items,
}: {
  fields: FieldDefinition[];
  items: Array<{ id: string; data: Record<string, unknown> }>;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {fields.map((field) => (
              <TableHead key={field.key}>{field.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={fields.length} className="text-center text-muted-foreground">
                No items yet.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                {fields.map((field) => {
                  const value = item.data[field.key];

                  if (typeof value === "boolean") {
                    return (
                      <TableCell key={field.key}>
                        <Badge variant={value ? "default" : "outline"}>{value ? "Yes" : "No"}</Badge>
                      </TableCell>
                    );
                  }

                  if (Array.isArray(value)) {
                    return (
                      <TableCell key={field.key}>
                        <Badge variant="outline">{value.length} file(s)</Badge>
                      </TableCell>
                    );
                  }

                  return <TableCell key={field.key}>{value ? String(value) : "-"}</TableCell>;
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
