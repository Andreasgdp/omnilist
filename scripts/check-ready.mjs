import "./load-env.mjs";

import postgres from "postgres";

const requiredEnv = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "ALLOWED_USERS",
];

const optionalWarnings = [
  "BETTER_AUTH_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

const missingRequired = requiredEnv.filter((key) => !process.env[key]);

if (missingRequired.length > 0) {
  console.error("Missing required environment variables:");
  for (const key of missingRequired) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

for (const key of optionalWarnings) {
  if (!process.env[key]) {
    console.warn(`Warning: ${key} is not set or is empty`);
  }
}

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  prepare: false,
});

try {
  const result = await sql`select 1 as ok`;
  if (result[0]?.ok !== 1) {
    throw new Error("Unexpected database response");
  }

  console.log("Environment looks good.");
  console.log("Database connection successful.");
} catch (error) {
  console.error("Database readiness check failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
} finally {
  await sql.end();
}
