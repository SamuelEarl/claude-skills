---
name: create-issues
description: Break a PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices. Requires a GitHub PRD issue link as input. Use when user wants to convert a PRD into issues, create implementation tickets, or break down work into issues.
argument-hint: <GitHub-PRD-issue-link>
---

# Create Issues

Break a PRD into independently-grabbable issues using vertical slices (tracer bullets).

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Input

The user must provide a GitHub issue link for the PRD as an argument. If no link is provided, ask the user for it with these instructions:

**How to find the issue link:**
1. Open the PRD issue in GitHub
2. Click the "Issue body actions" button at the top of the issue (i.e. the three dots at the top of the issue)
3. Select "Copy link"
4. Paste that link here

## Process

### 1. Gather context

Fetch the PRD issue from the GitHub link provided by the user. Read its full body and comments to understand the requirements.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Issue titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories this addresses (if the source material has them)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Publish the issues to the issue tracker

For each approved slice, publish a new issue to the issue tracker with the `Ready for implementation` label, then move to the project board:

1. Create the issue using the template below
2. Add label: `gh issue edit <issue-number> --add-label "Ready for implementation"`
3. Move to "Ready" column: `gh project item-edit --id $(gh issue view <issue-number> --json projectItems --jq '.projectItems[0].id') --project-id 5 --field-id $(gh project field-list --owner SamuelEarl --project 5 --format json | jq -r '.fields[] | select(.name=="Status") | .id') --text "Ready"`

Publish issues in dependency order (blockers first) so you can reference real issue identifiers in the "Blocked by" field.

<issue-template>
## Parent

A reference to the parent PRD issue (link to the GitHub issue provided by the user).

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

Avoid specific file paths or code snippets — they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it here and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- A reference to the blocking ticket (if any)

Or "None - can start immediately" if no blockers.

</issue-template>

### 6. Update the parent PRD issue

After all issues are created, update the parent PRD issue to reflect that implementation is underway:

1. **Update labels**:
   - Remove `Ready to create issues`: `gh issue edit <prd-issue-number> --remove-label "Ready to create issues"`
   - Add `In progress`: `gh issue edit <prd-issue-number> --add-label "In progress"`

2. **Move to "In progress" column**: `gh project item-edit --id $(gh issue view <prd-issue-number> --json projectItems --jq '.projectItems[0].id') --project-id 5 --field-id $(gh project field-list --owner SamuelEarl --project 5 --format json | jq -r '.fields[] | select(.name=="Status") | .id') --text "In progress"`

Do NOT close the parent PRD issue.
