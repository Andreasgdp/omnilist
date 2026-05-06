# Omnilist Current State

This document describes what Omnilist currently includes, both from a product perspective and a technical perspective.

## Product Summary

Omnilist is a shared list application built around dynamic, user-defined list structures.

It currently supports:

- a shared workspace model
- private and workspace-visible lists
- list ownership and list sharing
- dynamic fields per list
- list items stored against those dynamic schemas
- saved personal views for filtering and sorting
- Google OAuth and magic-link sign-in
- dark mode and a responsive UI

The app is already usable as a private shared tool and has a solid foundation for future SaaS expansion.

## Current User-Facing Features

### Authentication

- Better Auth is integrated for authentication
- Google OAuth is supported when configured
- magic-link sign-in is supported
- production access is restricted with an email allowlist
- unauthorized users are blocked and can sign out cleanly

### Workspaces

- the app is built around a workspace-first model
- local setup seeds a default shared workspace
- workspace membership is tracked separately from user identity
- the current UI is single-workspace-first, with multi-workspace support planned behind feature flags

### Lists

- users can create custom lists
- each list has:
  - a name
  - a description
  - a visibility mode
  - a dynamic field schema
- list visibility supports:
  - `private`
  - `workspace`
- list access is separated from workspace membership through list-level roles

### Dynamic Schema and Items

- list fields are user-defined
- currently supported field types are:
  - `text`
  - `number`
  - `boolean`
  - `date`
  - `url`
  - `select`
  - `image`
  - `file`
- users can add items to lists based on those schemas
- item validation is generated from the list definition at runtime

### Saved Views, Sorting, and Filtering

- list pages support URL-based sort and filter state
- users can save personal views for a list
- saved views can currently be:
  - opened
  - favorited
  - marked as default
  - deleted
- filtering is still intentionally simple in this phase and acts as the first pass of the V2 custom-view system

### Sharing and Permissions

- lists support per-list sharing
- list roles currently include:
  - `owner`
  - `editor`
  - `viewer`
- workspace roles and list roles are separate
- private lists are not automatically visible to every workspace member

### Attachments

- attachment-related schema and storage records exist
- presigned upload endpoints are present
- attachment UX is not fully complete yet
- full upload, preview, and attachment management is still an active next-step area

### UI and Experience

- responsive layout for desktop and mobile
- dark mode with persistence
- branded UI using the Omnilist logo
- generated favicon and Apple touch icon
- colorful dashboard/list styling inspired by a softer card-based productivity aesthetic
- mobile bottom navigation
- page-entry transitions
- route loading states for slower navigation paths
- immediate tap feedback on navigation-heavy surfaces

## Local Development Experience

Local development is already strong and open-source-friendly.

### Local Database

- Docker Compose PostgreSQL setup is included
- Drizzle migrations are generated and committed
- the local database can be started with project scripts

### Bootstrap Flow

The project includes a local setup workflow:

- `npm run setup`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run check:ready`

### Seed Data

The seed script creates:

- a default local user
- a default workspace
- a demo list
- demo list items

This makes a fresh checkout useful immediately.

### Magic Link Development Fallback

If Resend is not configured locally:

- the app stores the latest generated magic link in a local fallback file
- a development-only route exposes it at:
  - `/api/dev/magic-link`

This makes local magic-link testing possible without a transactional email provider.

## Technical Architecture

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui primitives
- Base UI button primitive in the local button wrapper

The UI is structured around reusable feature code and shared UI utilities rather than a large monolithic page layer.

### Authentication

- Better Auth in minimal mode
- Drizzle adapter with `usePlural: true`
- Google OAuth provider support
- magic-link plugin support
- Better Auth Dash integration via `@better-auth/infra`
- explicit trusted-origin configuration

### Database and ORM

- PostgreSQL
- Drizzle ORM
- migration files committed in `drizzle/`

Core tables currently cover:

- Better Auth models:
  - `user`
  - `session`
  - `account`
  - `verification`
- collaboration models:
  - `workspaces`
  - `workspace_members`
- list models:
  - `lists`
  - `list_members`
  - `list_items`
  - `list_views`
- attachment models:
  - `assets`
  - `item_assets`

### Dynamic Data Model

- list schemas are stored in JSONB
- item payloads are stored in JSONB
- field validation is compiled from the saved schema definition
- this allows new list structures without database migrations for each custom field change

### Permissions Model

- workspace membership controls workspace access
- list membership controls list access
- ownership and sharing rules are enforced server-side
- private and workspace-visible lists are both supported

### Upload Architecture

- object storage integration uses an S3-compatible abstraction
- upload flow is designed around presigned URLs
- asset records are tracked separately from item JSON payloads

### Navigation and Loading UX

- route-level loading components exist for main workspace/list routes
- client-side nav links provide immediate interaction feedback
- mobile and desktop navigation are separated by breakpoint

## Current Limitations

The app is functional, but several parts are still intentionally early-stage.

- multi-workspace UI is not fully exposed yet
- attachment UX is not complete
- schema editing after list creation is still minimal
- saved views do not yet support rename
- filtering is still first-pass rather than a full advanced query builder
- billing is represented structurally in the data model but not yet activated in product flows
- tests are still limited compared to the desired long-term quality bar

## Near-Term Direction

The current architecture is already aligned with the V2 direction.

Near-term work is likely to focus on:

- richer saved-view behavior
- better attachment workflows
- safer schema evolution after creation
- expanded multi-workspace UX
- billing activation and plan enforcement
- deeper tests and production hardening

## Bottom Line

Omnilist is no longer just a scaffold.

It already has:

- a real auth system
- a real multi-tenant-style collaboration model
- dynamic list creation
- list items and sharing
- saved views
- responsive branded UI
- local developer tooling and migrations

What remains is mostly feature depth, polish, and expansion of systems that are already in place, rather than foundational architectural rewrites.
