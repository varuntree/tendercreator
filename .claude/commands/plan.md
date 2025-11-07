# Planning

Create a plan to implement the task using the exact specified markdown `Plan Format`. Follow the `Instructions` to create the plan use the `Relevant Files` to focus on the right files.

## Instructions

- IMPORTANT: You're writing a plan to implement a task that will add value to the application.
- IMPORTANT: Before starting, read previous specifications in `/Users/varunprasad/code/prjs/tendercreator/tendercreator/ai_docs/documentation/` to understand context and dependencies.
- Create the plan in the `specs/` directory with structure: `specs/<descriptive-name>/<descriptive-name>.md`
  - Replace `<descriptive-name>` with a short, descriptive name based on the task (e.g., "add-auth-system", "implement-search", "create-dashboard")
- Use the `Plan Format` below to create the plan.
- MANDATORY: Before planning, explore codebase deeply using Task agent to:
  - Identify all patterns relevant to this task
  - Find similar implementations (not count, understand approach)
  - List all components that could be affected
  - Document patterns to follow with file:line references
- IMPORTANT: Replace every <placeholder> in the `Plan Format` with the requested value. Add as much detail as needed to implement successfully.
- Use your reasoning model: THINK HARD about requirements, design, implementation approach, AND impact. What breaks if this changes? What patterns must be followed? What edge cases exist?
- If specification documents don't clarify implementation choices (tech stack, AI/agent workflows, architecture patterns, etc.), ask explicit questions. Don't assume.
- Deploy research sub-agents for:
  - Unfamiliar tech/architectural decisions
  - Complex implementations needing best practices
  - Security/performance critical features
  - Create research docs in plan folder
- Follow existing patterns discovered in codebase exploration. Document pattern sources (file:line). Justify any deviations explicitly.
- Design for extensibility and maintainability.
- If you need a new library, use `npm install` and be sure to report it in the `Notes` section of the `Plan Format`.
- Don't use decorators. Keep it simple.
- IMPORTANT: If the task includes UI components or user interactions:
  - Add a task in the `Step by Step Tasks` section to create a separate E2E test file in `.claude/commands/e2e/test_<descriptive_name>.md` based on examples in that directory
  - Add E2E test validation to your Validation Commands section
  - IMPORTANT: When you fill out the `Plan Format: Relevant Files` section, add an instruction to read `.claude/commands/test_e2e.md`, and `.claude/commands/e2e/test_basic_query.md` to understand how to create an E2E test file. List your new E2E test file to the `Plan Format: New Files` section.
  - To be clear, we're not creating a new E2E test file, we're creating a task to create a new E2E test file in the `Plan Format` below
- Respect requested files in the `Relevant Files` section.
- Start your research by reading the `ai_docs/documentation/CONTEXT.md` and `ai_docs/documentation/PRD.md` files.

## Plan Structure Requirements

When creating the detailed plan, ensure:

1. **Single Clear Structure**: Use only "Step by Step Tasks" section with numbered steps (### 1, ### 2, etc.). Avoid dual structures (implementation phases + steps).

2. **Execution Directive**: Add immediately before step 1:
   ```
   **EXECUTION RULES:**
   - Execute ALL steps below in exact order
   - Check Acceptance Criteria - all items are REQUIRED
   - Do NOT skip UI/frontend steps if in acceptance criteria
   - If blocked, document and continue other steps
   ```

3. **Checkpoints**: Add after major section transitions:
   ```
   ---
   ✅ CHECKPOINT: Steps X-Y complete (Backend/Frontend/etc). Continue to step Z.
   ---
   ```

4. **Acceptance Criteria First**: Place Acceptance Criteria section BEFORE "Step by Step Tasks" so requirements are clear upfront.

5. **Logging Instructions**: Add to validation commands section:
   ```
   # Implementation log created at:
   # specs/<descriptive-name>/<descriptive-name>_implementation.log
   ```

## Relevant Files

Focus on the following files:
- `ai_docs/documentation/CONTEXT.md` - Contains the project context and overview.
- `ai_docs/documentation/PRD.md` - Contains the product requirements document.
- `ai_docs/documentation/standards/*` - Contains coding patterns and standards.

Ignore all other files in the codebase.

## Plan Format

```md
# Plan: <descriptive name>

## Plan Description
<describe the task in detail, including its purpose and value to users>

## User Story
As a <type of user>
I want to <action/goal>
So that <benefit/value>

## Problem Statement
<clearly define the specific problem or opportunity this task addresses>

## Solution Statement
<describe the proposed solution approach and how it solves the problem>

## Pattern Analysis
<what patterns were discovered in codebase exploration? which files demonstrate these patterns? any deviations needed and why?>

## Dependencies
### Previous Plans
<list previous plans this depends on and what specifically is needed from them>

### External Dependencies
<list any external libraries, services, or resources needed>

## Relevant Files
Use these files to implement the task:

<find and list the files that are relevant to the task describe why they are relevant in bullet points. If there are new files that need to be created to implement the task, list them in an h3 'New Files' section.>

## Acceptance Criteria
<list specific, measurable criteria that must be met for the task to be considered complete>

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. <First Step Name>

<list step details as bullet points>

### 2. <Second Step Name>

<list step details as bullet points>

<continue with all steps... use as many h3 headers as needed to implement the task. Order matters, start with the foundational shared changes required then move on to the specific implementation. Include creating tests throughout the implementation process.>

<If the task affects UI, include a task to create a E2E test file (like `.claude/commands/e2e/test_basic_query.md` and `.claude/commands/e2e/test_complex_query.md`) as one of your early tasks. That e2e test should validate the task works as expected, be specific with the steps to demonstrate the new functionality. We want the minimal set of steps to validate the task works as expected and screen shots to prove it if possible.>

<Add checkpoints after major transitions:>
---
✅ CHECKPOINT: Steps X-Y complete (Backend/Frontend/etc). Continue to step Z.
---

<Your last step should be running the `Validation Commands` to validate the task works correctly with zero regressions.>

## Testing Strategy
### Unit Tests
<describe unit tests needed for the task>

### Edge Cases
<list edge cases that need to be tested>

## Validation Commands
Execute every command to validate the task works correctly with zero regressions.

<list commands with EXPECTED OUTPUT. Not "validate works" but "npm test should show X passing" or "API returns {expected JSON}". Be specific about what you want to run and what output confirms success. Include commands to test the task end-to-end.>

<If you created an E2E test, include the following validation step: `Read .claude/commands/test_e2e.md`, then read and execute your new E2E `.claude/commands/e2e/test_<descriptive_name>.md` test file to validate this functionality works.>

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Reference absolute paths for test fixtures in test_fixtures/
- Sign in via email/password: test@tendercreator.dev / TestPass123!
- you will write the detailed tests in format of the workflow in the /Users/varunprasad/code/prjs/tendercreator/tendercreator/.claude/commands/test_e2e.md

# Implementation log created at:
# specs/<descriptive-name>/<descriptive-name>_implementation.log

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All validation commands pass with expected output
- [ ] No regressions (existing tests still pass)
- [ ] Patterns followed (documented in Pattern Analysis)
- [ ] E2E test created and passing (if UI change)

## Notes
<optionally list any additional notes, future considerations, or context that are relevant to the task that will be helpful to the developer>

## Research Documentation
<if research sub-agents were deployed, list the research documentation files created and their purpose>
```

## Plan Description
$ARGUMENTS
