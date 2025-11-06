# Plan, Implement, and Validate

Orchestrates the full engineering workflow by composing the `/plan` and `/implement` commands.

## Instructions

You will execute a two-phase engineering workflow:

### Phase 1: Planning
1. Derive a `plan_name` from the task description below (use snake_case, e.g., "user_authentication", "pdf_export_feature")
2. Execute the `/plan` command at /Users/varunprasad/code/prjs/tendercreator/tendercreator/.claude/commands/plan.md with the task description, in the format of `/plan $ARGUMENTS` 
3. Ensure the plan is created at `specs/<plan_name>/plan.md`

### Phase 2: Implementation
4. Execute the `/implement` command at /Users/varunprasad/code/prjs/tendercreator/tendercreator/.claude/commands/implement.md with the plan file path: `specs/<plan_name>/plan.md` in the format of `/implement  specs/<plan_name>/plan.md`
5. The implement command will handle execution, logging, and validation

That's it. No additional logic needed - just compose the two commands sequentially.

## Task Description
$ARGUMENTS
