---
name: prd-to-issues
description: Break a PRD into independently-grabbable issues on the project issue tracker using UI-first layered slices. Requires a GitHub PRD issue link as input. Use when user wants to convert a PRD into issues, create implementation tickets, or break down work into issues.
argument-hint: <GitHub-PRD-issue-link>
---

# Create Issues

Break a PRD into independently-grabbable issues using UI-first layered slices: build the UI first against stubs returning dummy data, then the API, then the DB.

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
- Prefer many thin slices over few thick ones.
- Dependencies flow **UI → API → DB**: the UI leads and the backend follows. Never make a UI slice blocked by its own API or DB slice.
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
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Get GitHub Project Configuration

Before publishing issues, retrieve the GitHub project configuration:

1. **Check for cached config** in `.claude/project-config.json`:
   ```bash
   if [ -f .claude/project-config.json ]; then
     PROJECT_ID=$(jq -r '.github.project.id // empty' .claude/project-config.json)
     OWNER=$(jq -r '.github.project.owner // empty' .claude/project-config.json)
     PROJECT_NUMBER=$(jq -r '.github.project.number // empty' .claude/project-config.json)
   fi
   ```

2. **If not cached, extract from PRD issue**:
   ```bash
   if [ -z "$PROJECT_ID" ] || [ -z "$OWNER" ]; then
     PROJECT_ID=$(gh issue view <prd-issue-url> --json projectItems --jq '.projectItems[0].project.id // empty')
     OWNER=$(gh issue view <prd-issue-url> --json projectItems --jq '.projectItems[0].project.owner.login // empty')
     PROJECT_NUMBER=$(gh issue view <prd-issue-url> --json projectItems --jq '.projectItems[0].project.number // empty')
   fi
   ```

3. **Error handling** if project info cannot be determined:
   ```bash
   if [ -z "$PROJECT_ID" ] || [ -z "$OWNER" ]; then
     echo "❌ Error: Could not determine GitHub project information."
     echo ""
     echo "Solutions:"
     echo "  1. Add the PRD issue to a GitHub project board first, OR"
     echo "  2. Manually create .claude/project-config.json with:"
     echo '     {"github": {"project": {"id": "YOUR_PROJECT_ID", "owner": "YOUR_GITHUB_USERNAME"}}}'
     exit 1
   fi
   ```

4. **Save to cache** for future use:
   ```bash
   mkdir -p .claude
   jq -n --arg id "$PROJECT_ID" --arg owner "$OWNER" --arg number "$PROJECT_NUMBER" \
     '{github: {project: {id: $id, owner: $owner, number: ($number | tonumber? // $number)}}}' > .claude/project-config.json
   echo "✓ Saved project config to .claude/project-config.json"
   ```

### 6. Publish the issues to the issue tracker

For each approved slice, publish a new issue to the issue tracker with the `Feature` and `Ready for implementation` labels, then move to the project board:

1. Create the issue using the template below
2. Add labels: `gh issue edit <issue-number> --add-label "Feature,Ready for implementation"`
3. Move to "Ready" column. The Status field is **single-select**, so `--text` does not work — resolve the option id and use `--single-select-option-id`. The item id also cannot be read from `gh issue view` (its `projectItems` has no usable id); look it up on the board by issue number:
   ```bash
   FIELDS=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)
   FIELD_ID=$(echo "$FIELDS" | jq -r '.fields[] | select(.name=="Status") | .id')
   OPTION_ID=$(echo "$FIELDS" | jq -r '.fields[] | select(.name=="Status") | .options[] | select(.name=="Ready") | .id')
   ITEM_ID=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.items[] | select(.content.number==<issue-number>) | .id')
   gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" --field-id "$FIELD_ID" --single-select-option-id "$OPTION_ID"
   ```

Publish issues in dependency order (blockers first) so you can reference real issue identifiers in the "Blocked by" field.

<issue-template>
## Parent

A reference to the parent PRD issue (link to the GitHub issue provided by the user).

## Layer

**UI**, **API**, or **DB**. For a UI slice, name the **stub** it stands on (what is faked with dummy data) and which later slice replaces it. For an API or DB slice, name the stub/seam it replaces.

## What to build

A concise description of this layer slice. Describe the observable behavior for this layer — for a UI slice, what the user sees and can click through against dummy data; for an API/DB slice, what real behavior now backs the layer above it.

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

2. **Move to "In progress" column** (single-select Status — resolve the option id; look up the item by issue number):
   ```bash
   FIELDS=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)
   FIELD_ID=$(echo "$FIELDS" | jq -r '.fields[] | select(.name=="Status") | .id')
   OPTION_ID=$(echo "$FIELDS" | jq -r '.fields[] | select(.name=="Status") | .options[] | select(.name=="In progress") | .id')
   ITEM_ID=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.items[] | select(.content.number==<prd-issue-number>) | .id')
   gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" --field-id "$FIELD_ID" --single-select-option-id "$OPTION_ID"
   ```

Do NOT close the parent PRD issue.
