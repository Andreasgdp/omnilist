import "./load-env.mjs";

import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.SEED_USER_EMAIL || "local@example.com";
const name = process.env.SEED_USER_NAME || "Local User";
const image = process.env.SEED_USER_IMAGE || null;
const workspaceSlug = process.env.SEED_WORKSPACE_SLUG || "home";
const workspaceName = process.env.SEED_WORKSPACE_NAME || "Home";

if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
});

const now = new Date();
const userId = crypto.randomUUID();
const workspaceId = crypto.randomUUID();
const membershipId = crypto.randomUUID();

try {
  const existingUser = await sql`
    select id, email from "user"
    where email = ${email}
    limit 1
  `;

  const finalUserId = existingUser[0]?.id ?? userId;

  if (existingUser.length === 0) {
    await sql`
      insert into "user" (id, name, email, email_verified, image, created_at, updated_at)
      values (${finalUserId}, ${name}, ${email}, ${true}, ${image}, ${now}, ${now})
    `;
  }

  const existingWorkspace = await sql`
    select id, slug from workspaces
    where slug = ${workspaceSlug}
    limit 1
  `;

  const finalWorkspaceId = existingWorkspace[0]?.id ?? workspaceId;

  if (existingWorkspace.length === 0) {
    await sql`
      insert into workspaces (
        id,
        slug,
        name,
        created_by,
        plan_tier,
        subscription_status,
        created_at,
        updated_at
      )
      values (
        ${finalWorkspaceId},
        ${workspaceSlug},
        ${workspaceName},
        ${finalUserId},
        ${"free"},
        ${"inactive"},
        ${now},
        ${now}
      )
    `;
  }

  const existingMembership = await sql`
    select id from workspace_members
    where workspace_id = ${finalWorkspaceId}
      and user_id = ${finalUserId}
    limit 1
  `;

  if (existingMembership.length === 0) {
    await sql`
      insert into workspace_members (id, workspace_id, user_id, role, joined_at)
      values (${membershipId}, ${finalWorkspaceId}, ${finalUserId}, ${"admin"}, ${now})
    `;
  }

  console.log("Seed complete.");
  console.log(`User: ${email}`);
  console.log(`Workspace: ${workspaceName} (${workspaceSlug})`);
} catch (error) {
  console.error("Seed failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
} finally {
  await sql.end();
}
