---
name: implement
description: Implement a single issue using test-driven development. Requires a GitHub issue link as input, extracts what to build and acceptance criteria, then drives a red-green-refactor loop scoped to that issue. Use when user wants to implement an issue, build a feature from a ticket, or TDD a specific issue.
argument-hint: <GitHub-issue-link>
disable-model-invocation: true
---

# Implement

Implement a single issue using TDD.

Issues in this project are **layer slices** (UI, API, or DB) built top-down. A **UI-layer** issue is built against a **stub that returns dummy data** — do not reach for the real API or DB; implement and test the UI down to the stub seam named in the issue. An **API** or **DB** issue replaces the stub the layer above it stands on. Honor the issue's `## Layer` and stub seam: build only that layer.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.


## Input

The user must provide a GitHub issue link as an argument. If no link is provided, ask the user for it with these instructions:

**How to find the issue link:**
1. Open the issue in GitHub
2. Click the "Issue body actions" button at the top of the issue (i.e. the three dots at the top of the issue)
3. Select "Copy link"
4. Paste that link here

Fetch the issue from GitHub and extract:

- **What to build** — the scope of this issue
- **Acceptance criteria** — these become the behaviors to test
- **Blocked by** — if blockers exist, check they've been completed before proceeding

If the issue references a parent issue or related context, read those too.

Before proceeding, check that `docs/agents/issue-tracker.md` exists. If it does not, stop and tell the user to run `/setup-ai-skills` first.

## Get GitHub project configuration

Read `docs/agents/issue-tracker.md` and extract:
- `PROJECT_NUMBER` — from the `## Project board` section, e.g. `(#42)`
- `OWNER` — from the git remote: `git remote get-url origin | sed -n 's#.*github.com[:/]\([^/]*\)/.*#\1#p'`
- `IN_PROGRESS_OPTION_ID` — Status option ID for `status:in-progress`
- `IN_REVIEW_OPTION_ID` — Status option ID for `status:in-review`

If any option IDs are empty, `setup-ai-skills` did not complete successfully. Stop and tell the user to re-run `/setup-ai-skills`.

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

## Update issue status

Before beginning implementation:

1. **Update labels** — read the issue labels to determine whether `status:ready-for-agent` or `status:ready-for-human` is set, then remove it and add `status:in-progress`:
   ```bash
   gh issue edit <issue-number> --remove-label "status:ready-for-agent"
   # or: gh issue edit <issue-number> --remove-label "status:ready-for-human"
   gh issue edit <issue-number> --add-label "status:in-progress"
   ```

2. **Move to "In progress" column**. The Status field is **single-select**, so `--text` does not work — use `--single-select-option-id` with `IN_PROGRESS_OPTION_ID` from `docs/agents/issue-tracker.md`. The item id cannot be read from `gh issue view`; look it up on the board by issue number:
   ```bash
   ITEM_ID=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.items[] | select(.content.number==<issue-number>) | .id')
   gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" --field-id "$FIELD_ID" --single-select-option-id "$IN_PROGRESS_OPTION_ID"
   ```

## When You Encounter Errors

**STOP. DO NOT push through with trial and error.**

When tests fail unexpectedly or you encounter errors during implementation:

1. **Stop coding immediately** — Don't attempt fixes based on guesses
2. **Research thoroughly** — Understand the root cause before proceeding:
   - Read relevant documentation
   - Search the codebase for similar patterns
   - Check error messages carefully for hints
   - Look up unfamiliar APIs or frameworks
   - Review the project's conventions and patterns
3. **Learn what to do** — Form a clear understanding of the correct approach
4. **Then proceed** — Only write code once you understand the solution

**Why this matters**: Trial and error wastes time, introduces bugs, and creates technical debt. Five minutes of research often saves an hour of debugging. If you're guessing, you're not learning.


## When implementation is complete, document changes and prepare for QA

Once done, use /code-review to review the work.

Update the GitHub issue to prepare for quality assurance:

1. **Add "Agent QA" section** to the issue body with a list of all files that were added or modified during implementation:

```markdown
## Agent QA

Files changed during implementation:
- `path/to/file1.ts` - Added new module for X
- `path/to/file2.test.ts` - Tests for X
- `path/to/file3.ts` - Updated to integrate with X
```

2. **Update labels** on the issue:
   - Remove `status:in-progress`: `gh issue edit <issue-number> --remove-label "status:in-progress"`
   - Add `status:in-review`: `gh issue edit <issue-number> --add-label "status:in-review"`

3. **Move to "In review" column** using `IN_REVIEW_OPTION_ID` from `docs/agents/issue-tracker.md`. The Status field is **single-select**, so `--text` does not work — use `--single-select-option-id`. Look up the item id by issue number:
   ```bash
   ITEM_ID=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.items[] | select(.content.number==<issue-number>) | .id')
   gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" --field-id "$FIELD_ID" --single-select-option-id "$IN_REVIEW_OPTION_ID"
   ```

4. **Inform the user**: "Implementation complete. The issue has been documented and labeled for QA. You can now run `/qa <issue-link>` to perform quality assurance."

Commit your work to the current branch.
