# V2 Draft

## Goals

- Add saved custom views per list
- Add full attachment UX with upload progress, previews, and removal
- Support multiple workspaces behind a feature flag with workspace switcher UI
- Add list schema editing after creation, including safe migrations for existing items
- Add richer filtering and sorting with shareable URL state
- Add billing activation on workspace records with plan-aware limits

## Product Scope

- Saved views
  - Persist sort and filter state per list
  - Allow personal views first, shared views second
  - Keep the current URL query model as the persisted payload
- Attachments
  - Thumbnail grids for image fields
  - File chips for generic attachments
  - Multi-upload picker with optimistic UI
  - Orphan cleanup for abandoned pending uploads
- Multiple workspaces
  - Workspace creation behind `FEATURE_MULTI_WORKSPACE`
  - Workspace switcher in the app shell
  - Invite and membership management UI
- Schema evolution
  - Rename field support
  - Add/remove fields without invalidating unrelated items
  - Clear warnings for destructive schema changes
- Billing
  - Stripe checkout and portal
  - Workspace plan enforcement
  - List/item/upload quotas by plan

## Technical Follow-Ups

- Add first-class Drizzle migrations in `drizzle/`
- Add tests for auth whitelist, workspace bootstrap, list ACLs, and uploads
- Add upload widgets to `ItemCreateForm`
- Add list edit and delete actions
- Add audit-friendly events for sharing and visibility changes

## Current V2 Progress

- Added a first pass of saved custom views with a `list_views` table
- Added URL-based sort and filter state on list detail pages
- Added save-view actions and quick view chips for personal presets
- Refined the workspace overview and list index toward a more colorful, card-driven visual style
