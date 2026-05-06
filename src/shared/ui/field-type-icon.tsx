import {
  AlignLeft,
  Calendar,
  CheckSquare,
  Hash,
  Image as ImageIcon,
  Link as LinkIcon,
  ListFilter,
  NotebookPen,
  Paperclip,
  Waypoints,
} from "lucide-react";

import { fieldTypeIconNames, type FieldType } from "@/shared/lib/list-schema";

const iconMap = {
  "align-left": AlignLeft,
  hash: Hash,
  "check-square": CheckSquare,
  calendar: Calendar,
  link: LinkIcon,
  "list-filter": ListFilter,
  image: ImageIcon,
  paperclip: Paperclip,
  "notebook-pen": NotebookPen,
  waypoints: Waypoints,
} as const;

export function FieldTypeIcon({ type, className = "size-4" }: { type: FieldType; className?: string }) {
  const iconName = fieldTypeIconNames[type] as keyof typeof iconMap;
  const Icon = iconMap[iconName];
  return <Icon className={className} aria-hidden="true" />;
}
