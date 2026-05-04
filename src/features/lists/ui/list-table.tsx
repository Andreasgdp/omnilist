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
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/90 shadow-sm">
      <div className="overflow-x-auto">
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
                <TableCell colSpan={fields.length} className="py-12 text-center text-muted-foreground">
                  <div className="mx-auto max-w-sm space-y-2">
                    <p className="text-base font-medium text-foreground">No items yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start with one entry and this list becomes a living dashboard instead of an empty shell.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="transition hover:bg-muted/40">
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
    </div>
  );
}
