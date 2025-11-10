# Assumptions
- **use-media-query hook is reliable and available for reuse** (validate by inspecting `hooks/use-media-query.ts` and running `npm run lint` after mapping). If the hook needs tweaks, expand coverage within the same mobile scope rather than introducing a new utility.
- **Radix Sheet component is present under `@/components/ui/sheet` and wired to accept `Sheet`, `SheetTrigger`, `SheetContent`** (verify imports and build after the first sidebar change). If missing, build a lightweight wrapper using the already-installed `@radix-ui/react-dialog` primitives.
- **Desktop layouts must remain untouched** (the plan explicitly forbids logic or styling changes for non-mobile contexts). Validate by ensuring all new utilities are prefixed with `max-md:` or apply only at `<md` breakpoints.

# Risks & Mitigations
- **Desktop regressions**: Hiding/showing markup may accidentally change margins/padding on ≥md screens. Mitigation: Always include `md:` variants for desktop, run `npm run build`/`npm run lint`, and spot-check high-impact screens before finishing each phase.
- **Missed touch targets**: Some interactive elements may still fall below 44px. Mitigation: Audit icon-only buttons after layout changes and add `max-md:p-3` wrappers; verify visually on phone viewport emulation during Phase 5.
- **Sheet accessibility issues**: The new sidebar sheet might trap focus or not close predictably. Mitigation: Reuse Radix primitives (they handle focus by default) and test the open/close flow manually and via simple keyboard navigation.
- **Dialog overflow**: Converting modals to full-screen might make long forms hard to dismiss. Mitigation: Keep desktop counterparts unchanged, ensure mobile wrappers include scroll, and confirm there is still a visible close/cancel control near the top.
- **Time escalation**: The plan covers 16 steps, and completing all may exceed a single session. Mitigation: Track progress in `TRACKING.md`, document heartbeats, and break future sessions into smaller part logs per phase so we can resume without losing context.

## Validation Notes
- Confirmed `use-media-query` behaves as expected by guarding the sidebar render and checking `isAtMost('sm')` before showing the sheet, satisfying the breakpoint assumption.
- Verified the Radix Sheet exports already exist and work with `SheetTrigger`/`SheetContent`, so no helper utilities were required.
- Desktop layouts were preserved thanks to new `md:`/`max-md:` utilities, and the full build/lint/type-check suite passed after all responsive tweaks, closing the "desktop untouched" risk.
