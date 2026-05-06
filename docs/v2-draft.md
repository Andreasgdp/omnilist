# V2 Draft

## Goals

- Add saved custom views per list
- Add full attachment UX with upload progress, previews, and removal
- Support multiple workspaces behind a feature flag with workspace switcher UI
- Add list schema editing after creation, including safe migrations for existing items
- Add richer filtering and sorting with shareable URL state
- Add billing activation on workspace records with plan-aware limits
- Evolve list items into rich, page-like documents
- Support cross-list item relations so lists can aggregate and reference each other

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
- Rich documents
  - Introduce a block-based document field for page-like item content
  - Store editor output as structured JSON inside `list_items.data`
  - Treat certain items as expandable, content-rich pages instead of flat rows
- Relations
  - Add a `relation` field type to dynamic schemas
  - Allow a field to target another list via `targetListId`
  - Store related item ids inside JSONB payloads
  - Hydrate related records in batches to avoid N+1 queries
- Aggregator views
  - Let higher-level lists pull linked records from supporting lists
  - Render linked content as cards and previews inside planning views

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

## Notion-Like Direction

The intended direction of Omnilist is broader than simple dynamic tables.

The product is meant to let users:

- create many different kinds of lists
- grow items from simple entries into richer documents
- collect links, images, notes, and structured references
- pull information from different lists into larger planning contexts

Example:

- a `Restaurants` list can hold candidate places with notes, images, and links
- a `Places to Go` list can hold locations and inspiration
- a `Vacation Plan` list can then reference those items and assemble them into an actual plan

That means the system needs to move toward:

- block-based rich content on items
- relation fields between lists
- batched hydration of related data
- aggregator-style UI for pulling resources together

The first implementation step is to introduce schema support for:

- `document` fields for rich page content
- `relation` fields for cross-list references
