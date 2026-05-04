# Better Auth Setup

## Env vars

- `BETTER_AUTH_SECRET`
  - Your app secret for signing/encrypting auth data
  - You generate this yourself
  - Example: `openssl rand -base64 32`
- `BETTER_AUTH_API_KEY`
  - The Better Auth Dash API key
  - This comes from Better Auth Dash, not from your app
- `BETTER_AUTH_URL`
  - Must match the canonical deployed origin exactly
  - For this project right now, use `https://www.omnilist.site`

## Important distinction

- `BETTER_AUTH_SECRET` is not shown in Better Auth Dash because it belongs to your app
- `BETTER_AUTH_API_KEY` is the dashboard/infra key used by the `dash()` plugin

## Expected endpoint behavior

- If `dash()` is mounted, `/api/auth/dash/config` exists
- An unauthenticated direct browser request may return `401`
- A `404` usually means the deployed code does not include the dash plugin

## Production checklist

1. Push the latest code that includes `dash()` in `src/features/auth/server/auth.ts`
2. Set Vercel env vars:
   - `BETTER_AUTH_URL=https://www.omnilist.site`
   - `BETTER_AUTH_SECRET=<random 32+ char secret>`
   - `BETTER_AUTH_API_KEY=<dash api key>`
3. Redeploy
4. Confirm `https://www.omnilist.site/api/auth/dash/config` no longer returns `404`
