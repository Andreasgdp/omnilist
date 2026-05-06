import { z } from "zod";

export const fieldTypeSchema = z.enum([
  "text",
  "number",
  "boolean",
  "date",
  "url",
  "select",
  "image",
  "file",
  "document",
  "relation",
]);

export type FieldType = z.infer<typeof fieldTypeSchema>;

export const fieldTypeLabels: Record<FieldType, string> = {
  text: "Text",
  number: "Number",
  boolean: "Checkbox",
  date: "Date",
  url: "Link",
  select: "Choice",
  image: "Image",
  file: "File attachment",
  document: "Notes",
  relation: "Linked item",
};

export const documentBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.unknown()).optional(),
  content: z.array(z.unknown()).optional(),
  children: z.array(z.unknown()).optional(),
});

export const relationFieldSchema = z.object({
  targetListId: z.string().uuid(),
});

export const fieldDefinitionSchema = z.object({
  key: z.string().min(1).regex(/^[a-zA-Z0-9_\-]+$/),
  label: z.string().min(1),
  type: fieldTypeSchema,
  required: z.boolean().default(false),
  multiple: z.boolean().optional(),
  targetListId: z.string().uuid().optional(),
  options: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .optional(),
});

export const listSchemaDefinitionSchema = z.array(fieldDefinitionSchema).superRefine((fields, ctx) => {
  const keys = new Set<string>();

  for (const field of fields) {
    if (keys.has(field.key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate field key: ${field.key}`,
      });
    }

    keys.add(field.key);

    if (field.type === "select" && (!field.options || field.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Select field ${field.key} requires options`,
      });
    }

    if (field.type === "relation" && !field.targetListId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Relation field ${field.key} requires targetListId`,
      });
    }
  }
});

export type FieldDefinition = z.infer<typeof fieldDefinitionSchema>;
export type ListSchemaDefinition = z.infer<typeof listSchemaDefinitionSchema>;

export const buildItemSchema = (fields: ListSchemaDefinition) => {
  const shape = Object.fromEntries(
    fields.map((field) => {
      const isMany = field.multiple === true;
      const scalar = (() => {
        switch (field.type) {
          case "text":
            return z.string().min(field.required ? 1 : 0);
          case "number":
            return z.coerce.number();
          case "boolean":
            return z.boolean();
          case "date":
            return z.string().min(1);
          case "url":
            return z.string().url();
          case "select":
            return z.string().min(1);
          case "image":
          case "file":
            return z.string().uuid();
          case "document":
            return z.array(documentBlockSchema);
          case "relation":
            return z.string().uuid();
        }
      })();

      const schema = isMany ? z.array(scalar) : scalar;
      return [field.key, field.required ? schema : schema.optional()];
    }),
  );

  return z.object(shape);
};
