import "./load-env.mjs";

import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.SEED_USER_EMAIL || "local@example.com";
const name = process.env.SEED_USER_NAME || "Local User";
const image = process.env.SEED_USER_IMAGE || null;
const workspaceSlug = process.env.SEED_WORKSPACE_SLUG || "home";
const workspaceName = process.env.SEED_WORKSPACE_NAME || "Home";
const demoListName = process.env.SEED_DEMO_LIST_NAME || "Weekend Trip Planner";

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

const demoSchema = [
  {
    key: "title",
    label: "Title",
    type: "text",
    required: true,
  },
  {
    key: "when",
    label: "Date",
    type: "date",
    required: true,
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { label: "Planned", value: "planned" },
      { label: "Booked", value: "booked" },
      { label: "Done", value: "done" },
    ],
  },
  {
    key: "budget",
    label: "Budget",
    type: "number",
    required: false,
  },
  {
    key: "done",
    label: "Done",
    type: "boolean",
    required: false,
  },
  {
    key: "link",
    label: "Link",
    type: "url",
    required: false,
  },
];

const demoItems = [
  {
    title: "Book cabin near the lake",
    when: "2026-06-14",
    status: "booked",
    budget: 240,
    done: true,
    link: "https://example.com/cabin",
  },
  {
    title: "Plan scenic train route",
    when: "2026-06-15",
    status: "planned",
    budget: 80,
    done: false,
    link: "https://example.com/train",
  },
  {
    title: "Reserve dinner at riverside spot",
    when: "2026-06-15",
    status: "planned",
    budget: 60,
    done: false,
    link: "https://example.com/dinner",
  },
];

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

  const existingList = await sql`
    select id from lists
    where workspace_id = ${finalWorkspaceId}
      and name = ${demoListName}
    limit 1
  `;

  const listId = existingList[0]?.id ?? crypto.randomUUID();

  if (existingList.length === 0) {
    await sql`
      insert into lists (
        id,
        workspace_id,
        owner_id,
        name,
        description,
        visibility,
        schema,
        created_at,
        updated_at
      )
      values (
        ${listId},
        ${finalWorkspaceId},
        ${finalUserId},
        ${demoListName},
        ${"Demo list created by the local seed script."},
        ${"workspace"},
        ${sql.json(demoSchema)},
        ${now},
        ${now}
      )
    `;

    await sql`
      insert into list_members (id, list_id, user_id, role, granted_by, granted_at)
      values (
        ${crypto.randomUUID()},
        ${listId},
        ${finalUserId},
        ${"owner"},
        ${finalUserId},
        ${now}
      )
    `;
  }

  const existingItems = await sql`
    select count(*)::int as count from list_items
    where list_id = ${listId}
  `;

  if ((existingItems[0]?.count ?? 0) === 0) {
    for (const item of demoItems) {
      await sql`
        insert into list_items (
          id,
          list_id,
          created_by,
          updated_by,
          data,
          created_at,
          updated_at
        )
        values (
          ${crypto.randomUUID()},
          ${listId},
          ${finalUserId},
          ${finalUserId},
          ${sql.json(item)},
          ${now},
          ${now}
        )
      `;
    }
  }

  console.log("Seed complete.");
  console.log(`User: ${email}`);
  console.log(`Workspace: ${workspaceName} (${workspaceSlug})`);
  console.log(`Demo list: ${demoListName}`);
  console.log(`Demo items: ${demoItems.length}`);
} catch (error) {
  console.error("Seed failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
} finally {
  await sql.end();
}
