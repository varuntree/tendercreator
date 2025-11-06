# Plan: team_management_page

## Plan Description
Implement the TenderCreator-style Team management UI under `/settings/team` so demo viewers can see a polished collaboration surface. The page will remain UI-only with mocked roster data but must deliver the hero summary, search/filter controls, member table, empty state, and organisation role cards described in the PRD and ui1.png reference. Buttons such as “Invite” remain static CTAs per the clarified scope.

## Plan Objectives
- Mirror the TenderCreator team management layout, typography, and spacing guidelines using the existing Tailwind + shadcn stack.
- Provide realistic mocked members plus filtering/searching to sell the multi-user narrative without backend wiring.
- Document interactions and validation (lint + scripted E2E instructions) in a reproducible way for future contributors.

## Problem Statement
The current `/settings/team` route is a placeholder, which fails the MVP requirement of showcasing team collaboration in the sidebar. Without a production-quality UI, stakeholders cannot validate how assignments, roles, or invites would look, weakening the overall demo story.

## Solution Statement
Rebuild the Team page with a hero section, action buttons, searchable/filtered member list, role dropdowns, invite/export CTAs, and organisation role cards all styled per TenderCreator tokens. Data remains mocked locally, but the UX reflects end-state behavior. Add scripted E2E guidance so QA can verify visuals/interactions manually until backend support exists.

## Dependencies
### Previous Plans
- Phase UI foundation plans ensured sidebar/navigation tokens exist; rely on those global dashboard styles already in place.

### External Dependencies
- None (using existing Tailwind/shadcn/lucide packages).

## Relevant Files
Use these files to implement the task:
- `ai_docs/documentation/CONTEXT.md` – High-level goals/constraints for matching TenderCreator UX.
- `ai_docs/documentation/PRD.md` – MVP scope plus detailed expectations for team collaboration UI.
- `ai_docs/documentation/standards/system-architecture.md` – Confirms `/settings/team` is UI-only for MVP.
- `ai_docs/ui_reference/ui1.png` – Visual reference for the Team page (layout, spacing, typography, badges).
- `app/(dashboard)/globals-dashboard.css` – Dashboard design tokens to leverage for styling consistency.
- `app/(dashboard)/settings/team/page.tsx` – Route to replace with the new UI implementation.
- `.claude/commands/test_e2e.md` – Required reading to understand E2E workflow expectations.
- `.claude/commands/e2e/test_basic_query.md` – Example format for creating a new E2E script.

### New Files
- `.claude/commands/e2e/test_team_management_page.md` – Scripted E2E walkthrough covering the Team page UI validation.

## Acceptance Criteria
- Page hero matches TenderCreator style: icon tile, title/description, Export roster + Invite CTAs (static behavior acceptable).
- Search input with icon and role filter select manipulate the mocked member list in-memory.
- Members table includes avatar initials, email, joined date, editable role select, status badges, overflow actions, and hover styling per design tokens.
- Empty-state message appears when filters yield zero members.
- Organisation roles section shows three cards (Admin, Company Admin, Company User) with badge, description, and highlight bullets.
- Buttons such as “Invite” remain static (no modal) per clarified requirement.
- Lint passes (`npm run lint`).
- New E2E instructions file documents how to manually verify the Team page (following repo test format).

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Review References & Existing Styles
- Re-read `ai_docs/documentation/CONTEXT.md`, `ai_docs/documentation/PRD.md`, and `ai_docs/documentation/standards/system-architecture.md` focusing on Team requirements.
- Inspect `ai_docs/ui_reference/ui1.png` to extract exact spacing, colors, and layout cues.
- Revisit `app/(dashboard)/globals-dashboard.css` plus current shadcn components to reuse tokens/classes.

### 2. Define Mock Data & Helpers
- Update `app/(dashboard)/settings/team/page.tsx` to include TypeScript types for roles/status, mocked member array, role labels, and role card metadata.
- Implement helper utilities (e.g., initials extraction, status badge component) scoped within the file.

### 3. Build Hero & Action Row
- Create hero section with icon tile, title/description, and CTA buttons (`Export roster`, `Invite team member`) matching ui1.png styling.
- Ensure button variants/colors align with dashboard tokens (dark invite button, outlined export button) while leaving actions as static placeholders.

### 4. Implement Search, Filters, and Table
- Add search input with icon + role dropdown filter that operate on component state via `useState`/`useMemo`.
- Construct table with avatar, contact info, joined date, role select, status badges, and action menu per row.
- Include empty-state row when filters return no members.

---
✅ CHECKPOINT: Steps 1-4 complete (Frontend structure + interactions). Continue to step 5.
---

### 5. Organisation Roles Section
- Build three role cards (Admin, Company Admin, Company User) showing badge, description, and highlight bullet list using lucide check icons.
- Match card padding, border radius, and typography to design reference.

### 6. Author E2E Test Instructions File
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_basic_query.md` for formatting.
- Create `.claude/commands/e2e/test_team_management_page.md` describing manual verification steps (navigate to `/settings/team`, check hero, filter, empty state, role cards, etc.).

### 7. Validation & Cleanup
- Run `npm run lint` to ensure code quality.
- Review the Team page visually (if possible) or double-check class names for adherence to tokens.
- Update specs/team_management_page/team_management_page_implementation.log with key actions (when implementing).
- Prepare summary + next steps for handoff.

## Validation Commands
- `cat .claude/commands/test_e2e.md`
- `cat .claude/commands/e2e/test_team_management_page.md`
- `npm run lint`

# Implementation log created at:
# specs/team_management_page/team_management_page_implementation.log

## Notes
- Keep all colors as hexes from design tokens to maintain visual parity.
- Future backend wiring (invites, Supabase data) can reuse the same structure; avoid coupling UI to external data for now.

## Research Documentation
- None (not required for this scope).
