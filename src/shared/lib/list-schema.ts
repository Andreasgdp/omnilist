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

export const coreListFields = {
  title: {
    key: "title",
    label: "Title",
    type: "text",
    required: true,
    multiple: false,
  },
  description: {
    key: "description",
    label: "Description",
    type: "text",
    required: false,
    multiple: false,
  },
} as const satisfies Record<string, {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  multiple: boolean;
}>;

export const fieldTypeIconNames: Record<FieldType, string> = {
  text: "align-left",
  number: "hash",
  boolean: "check-square",
  date: "calendar",
  url: "link",
  select: "list-filter",
  image: "image",
  file: "paperclip",
  document: "notebook-pen",
  relation: "waypoints",
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
  width: z.enum(["compact", "regular", "wide"]).optional(),
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

const storedListSchemaDefinitionSchema = z.array(fieldDefinitionSchema);

const withCoreListFields = (fields: FieldDefinition[]) => {
  const nextFields = [...fields];

  if (!nextFields.some((field) => field.key === coreListFields.title.key)) {
    nextFields.unshift({ ...coreListFields.title });
  }

  if (!nextFields.some((field) => field.key === coreListFields.description.key)) {
    nextFields.splice(1, 0, { ...coreListFields.description });
  }

  return nextFields;
};

const ensureUniqueFieldLabels = (fields: FieldDefinition[]) => {
  const usedLabels = new Set<string>();

  return fields.map((field) => {
    const baseLabel = field.label.trim() || "Field";
    let nextLabel = baseLabel;
    let suffix = 2;

    while (usedLabels.has(nextLabel.toLowerCase())) {
      nextLabel = `${baseLabel} ${suffix}`;
      suffix += 1;
    }

    usedLabels.add(nextLabel.toLowerCase());

    if (nextLabel === field.label) {
      return field;
    }

    return {
      ...field,
      label: nextLabel,
    };
  });
};

export const listSchemaDefinitionSchema = z.array(fieldDefinitionSchema).superRefine((fields, ctx) => {
  const keys = new Set<string>();
  const labels = new Set<string>();

  for (const field of fields) {
    if (keys.has(field.key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate field key: ${field.key}`,
      });
    }

    keys.add(field.key);

    const normalizedLabel = field.label.trim().toLowerCase();
    if (labels.has(normalizedLabel)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate field label: ${field.label}`,
      });
    }

    labels.add(normalizedLabel);

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

export const normalizeListFields = (fields: FieldDefinition[]): ListSchemaDefinition => {
  return listSchemaDefinitionSchema.parse(withCoreListFields(fields));
};

export const repairStoredListFields = (fields: unknown) => {
  const parsedFields = storedListSchemaDefinitionSchema.parse(fields);
  const repairedFields = listSchemaDefinitionSchema.parse(ensureUniqueFieldLabels(withCoreListFields(parsedFields)));

  return {
    fields: repairedFields,
    changed: JSON.stringify(parsedFields) !== JSON.stringify(repairedFields),
  };
};

export const parseStoredListFields = (fields: unknown): ListSchemaDefinition => {
  return repairStoredListFields(fields).fields;
};

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
