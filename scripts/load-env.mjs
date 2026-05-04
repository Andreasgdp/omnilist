import fs from "node:fs";
import path from "node:path";

const envFiles = [".env", ".env.local"];

for (const fileName of envFiles) {
  const filePath = path.resolve(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) {
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
