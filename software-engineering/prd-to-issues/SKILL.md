---
name: prd-to-issues
description: Break a PRD into independently-grabbable issues on the project issue tracker using UI-first layered slices. Requires a GitHub PRD issue link as input. Use when user wants to convert a PRD into issues, create implementation tickets, or break down work into issues.
argument-hint: <GitHub-PRD-issue-link>
disable-model-invocation: true
---

# PRD To Issues

Break a PRD into independently-grabbable issues using UI-first layered slices: build the UI first against stubs returning dummy data, then the API, then the DB.

Before proceeding, check that `docs/agents/issue-tracker.md` exists. If it does not, stop and tell the user to run `/setup-ai-skills` first.

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

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft UI-first layered slices

Work top-down, one feature at a time. Deliver each feature as an ordered sequence of **layer slices** — UI first, then API, then DB — so something visible and demoable exists before any backend is built.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<layered-slice-rules>
- Build each feature in up to three layer passes, in this order:
  1. **UI** — build the screens and interactions first, against a **stub that returns dummy data**. This slice is demoable on its own with no real backend. Name the stub seam explicitly (what is faked, and which later slice replaces it).
  2. **API** — replace the stub with the real endpoint/service. *Blocked by* its UI slice.
  3. **DB** — add real persistence behind the API. *Blocked by* its API slice.
- Include only the layers a feature actually touches — not every feature needs all three passes.
- Each layer slice is still narrow and independently verifiable/demoable.
- Each layer slice is sized to fit in a single fresh context window. This is not a hard requirement, but when it is possible to do this, then this is the preferred approach.
- Prefer many thin slices over few thick ones.
- Dependencies flow **UI → API → DB**: the UI leads and the backend follows. Never make a UI slice blocked by its own API or DB slice.
- Any prefactoring should be done first
</layered-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Layer**: UI / API / DB
- **Type**: HITL / AFK
- **Stub seam** (UI slices): what is faked with dummy data, and which slice replaces it
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories this addresses (if the source material has them)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the layer passes right, and does each UI slice stub the right seam?
- Are the dependency relationships correct? (UI → API → DB)
- Are the blocking issues correct: does each issue only depend on issues that genuinely gate it?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Get GitHub project configuration

Read `docs/agents/issue-tracker.md` and extract:
- `PROJECT_NUMBER` — from the `## Project board` section, e.g. `(#42)`
- `OWNER` — from the git remote: `git remote get-url origin | sed -n 's#.*github.com[:/]\([^/]*\)/.*#\1#p'`
- `AGENT_OPTION_ID` — Status option ID for `status:ready-for-agent`
- `HUMAN_OPTION_ID` — Status option ID for `status:ready-for-human`
- `IN_PROGRESS_OPTION_ID` — Status option ID for `status:in-progress`

If any of these option IDs are empty, `setup-ai-skills` did not complete successfully. Stop and tell the user to re-run `/setup-ai-skills`.

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

### 6. Publish the issues to the issue tracker

For each approved slice, publish a new issue to the issue tracker with the `category:feature` label plus the appropriate status label, then move to the project board:

1. Create the issue using the template below
2. Add labels based on slice type:
   - AFK slice: `gh issue edit <issue-number> --add-label "category:feature,status:ready-for-agent"`
   - HITL slice: `gh issue edit <issue-number> --add-label "category:feature,status:ready-for-human"`
3. Move to "Ready" column. The Status field is **single-select**, so `--text` does not work — use `--single-select-option-id` with the option ID from `docs/agents/issue-tracker.md`. The item ID cannot be read from `gh issue view`; look it up on the board by issue number:
   ```bash
   ITEM_ID=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.items[] | select(.content.number==<issue-number>) | .id')
   # AFK slice:
   gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" --field-id "$FIELD_ID" --single-select-option-id "$AGENT_OPTION_ID"
   # HITL slice:
   gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" --field-id "$FIELD_ID" --single-select-option-id "$HUMAN_OPTION_ID"
   ```

Publish issues in dependency order (blockers first) so you can reference real issue identifiers in the "Blocked by" field.

<issue-template>
## Parent

A reference to the parent PRD issue (link to the GitHub issue provided by the user).

## Layer

**UI**, **API**, or **DB**. For a UI slice, name the **stub** it stands on (what is faked with dummy data) and which later slice replaces it. For an API or DB slice, name the stub/seam it replaces.

## What to build

A concise description of this layer slice. Describe the observable behavior for this layer — for a UI slice, what the user sees and can click through against dummy data; for an API/DB slice, what real behavior now backs the layer above it.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- A reference to the blocking issue (if any)

Or "None - can start immediately" if no blockers.

</issue-template>

Avoid specific file paths or code snippets — they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it here and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.


### 6. Update the parent PRD issue

After all issues are created, update the parent PRD issue to reflect that implementation is underway:

1. **Update labels**:
   - Remove `status:ready-to-create-issues`: `gh issue edit <prd-issue-number> --remove-label "status:ready-to-create-issues"`
   - Add `status:in-progress`: `gh issue edit <prd-issue-number> --add-label "status:in-progress"`

2. **Move to "In progress" column** using `IN_PROGRESS_OPTION_ID` from `docs/agents/issue-tracker.md`:
   ```bash
   ITEM_ID=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.items[] | select(.content.number==<prd-issue-number>) | .id')
   gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" --field-id "$FIELD_ID" --single-select-option-id "$IN_PROGRESS_OPTION_ID"
   ```

Do NOT close the parent PRD issue.
