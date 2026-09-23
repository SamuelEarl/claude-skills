---
name: requirements-to-prd
description: Turn the current conversation context into a PRD and publish it to the project issue tracker. Requires a REQUIREMENTS_CLARIFICATION_SUMMARY.md file. Use when user wants to create a PRD from the current context.
argument-hint: path/to/REQUIREMENTS_CLARIFICATION_SUMMARY.md
disable-model-invocation: true
---

## Input

This skill takes a REQUIREMENTS_CLARIFICATION_SUMMARY.md file, the current conversation context, and codebase understanding and produces a PRD. Do NOT interview the user. just synthesize what you already know.

Before proceeding, check that `docs/agents/issue-tracker.md` exists. If it does not, stop and tell the user to run `/setup-ai-skills` first.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the PRD, and respect any ADRs in the area you're touching.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

   Plan the work **top-down, UI-first**: the feature will be built as ordered layer passes — **UI → API → DB**. The UI is built first against a **stub that returns dummy data** so it is demoable before any backend exists; the API pass then replaces the stub, and the DB pass adds real persistence behind it. For each layer boundary, identify the **stub seam** the UI will stand on (what gets faked, and which later layer makes it real). UI slices are tested at that stub seam.

Check with the user that these seams and the UI → API → DB layering match their expectations.

3. Read `docs/agents/issue-tracker.md` and extract:
   - `PROJECT_NUMBER` — from the `## Project board` section, e.g. `(#42)`
   - `OWNER` — from the git remote: `git remote get-url origin | sed -n 's#.*github.com[:/]\([^/]*\)/.*#\1#p'`
   - `READY_OPTION_ID` — from the `## Label to column mapping` table, the Status option ID on the `status:ready-to-create-issues` row

   If `READY_OPTION_ID` is empty, `setup-ai-skills` did not complete successfully. Stop and tell the user to re-run `/setup-ai-skills`.

   Then fetch the project node ID and Status field ID via GraphQL (these are not cached):

   ```bash
   PROJECT_DATA=$(gh api graphql -f query='
     query($owner: String!, $number: Int!) {
       user(login: $owner) {
         projectV2(number: $number) {
           id
           fields(first: 20) {
             nodes {
               ... on ProjectV2SingleSelectField { id name }
             }
           }
         }
       }
     }
   ' -f owner="$OWNER" -F number="$PROJECT_NUMBER")
   PROJECT_ID=$(echo "$PROJECT_DATA" | jq -r '.data.user.projectV2.id')
   FIELD_ID=$(echo "$PROJECT_DATA" | jq -r '.data.user.projectV2.fields.nodes[] | select(.name=="Status") | .id')
   ```

   If the owner is an org, replace `user` with `organization` in the query.

4. Write the PRD using the template below, then publish it to the project issue tracker. Apply the `category:prd` and `status:ready-to-create-issues` labels, then move to the project board:
   - Add labels: `gh issue edit <issue-number> --add-label "category:prd,status:ready-to-create-issues"`
   - Move to "Ready" column. The Status field is **single-select**, so `--text` does not work — use `--single-select-option-id` with `READY_OPTION_ID` from `docs/agents/issue-tracker.md`. The item ID cannot be read from `gh issue view`; look it up on the board by issue number:
     ```bash
     ITEM_ID=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.items[] | select(.content.number==<issue-number>) | .id')
     gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" --field-id "$FIELD_ID" --single-select-option-id "$READY_OPTION_ID"
     ```

5. Identify all items from the conversation and PRD context that should be handled as future feature enhancements (items that are related but out of scope for the current PRD). For each future feature enhancement:
   - Create a GitHub issue with a clear title and description
   - Apply the `category:enhancement` label
   - Reference the main PRD issue in the description for traceability

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions
- **Layering (UI → API → DB)**: how the feature splits into a UI pass (built first against stubs returning dummy data), an API pass (replaces the stubs), and a DB pass (real persistence), and the **stub seams** the UI stands on until the backend passes make them real

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)
- How each layer is tested: UI slices are tested against the **stub seam** (dummy data, no real backend), and the API/DB passes are tested where they replace those stubs

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

</prd-template>
