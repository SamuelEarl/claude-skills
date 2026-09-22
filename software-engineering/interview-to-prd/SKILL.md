---
name: interview-to-prd
description: Turn the current conversation context into a PRD and publish it to the project issue tracker. Creates GitHub issues with "Enhancement" label for future feature enhancements. Requires a GRILL_WITH_DOCS_SUMMARY.md file. Use when user wants to create a PRD from the current context.
argument-hint: path/to/GRILL_WITH_DOCS_SUMMARY.md
---

This skill takes a GRILL_WITH_DOCS_SUMMARY.md file, the current conversation context, and codebase understanding and produces a PRD. Do NOT interview the user — just synthesize what you already know.

## Input

The user must provide a path to a GRILL_WITH_DOCS_SUMMARY.md file as an argument. If no path is provided, ask the user for it. This file should contain the grilling session summary that informs the PRD.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the PRD, and respect any ADRs in the area you're touching.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can.

   Plan the work **top-down, UI-first**: the feature will be built as ordered layer passes — **UI → API → DB**. The UI is built first against a **stub that returns dummy data** so it is demoable before any backend exists; the API pass then replaces the stub, and the DB pass adds real persistence behind it. For each layer boundary, identify the **stub seam** the UI will stand on (what gets faked, and which later layer makes it real). UI slices are tested at that stub seam.

Check with the user that these seams and the UI → API → DB layering match their expectations.

3. Get GitHub Project Configuration

Before publishing the PRD, retrieve the GitHub project configuration:

1. **Check for cached config** in `.claude/project-config.json`:
   ```bash
   if [ -f .claude/project-config.json ]; then
     PROJECT_ID=$(jq -r '.github.project.id // empty' .claude/project-config.json)
     OWNER=$(jq -r '.github.project.owner // empty' .claude/project-config.json)
     PROJECT_NUMBER=$(jq -r '.github.project.number // empty' .claude/project-config.json)
   fi
   ```

2. **If not cached, try to detect from repository**:
   ```bash
   if [ -z "$PROJECT_ID" ] || [ -z "$OWNER" ]; then
     # Get owner from git remote
     OWNER=$(git remote get-url origin | sed -n 's#.*github.com[:/]\([^/]*\)/.*#\1#p')
     # Project ID needs to be manually configured or detected from an existing issue on the board
     echo "⚠️  Project ID not found in cache. You may need to configure it manually."
   fi
   ```

3. **Manual configuration fallback**:
   ```bash
   if [ -z "$PROJECT_ID" ] || [ -z "$OWNER" ]; then
     echo "❌ Error: Could not determine GitHub project information."
     echo ""
     echo "Please manually create .claude/project-config.json with:"
     echo '{"github": {"project": {"id": "YOUR_PROJECT_ID", "owner": "YOUR_GITHUB_USERNAME"}}}'
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

4. Write the PRD using the template below, then publish it to the project issue tracker. Apply the `Ready to create issues` and `PRD` labels, then move to the project board:
   - Add labels: `gh issue edit <issue-number> --add-label "Ready to create issues,PRD"`
   - Move to "Ready" column. The Status field is **single-select**, so `--text` does not work — resolve the option id and use `--single-select-option-id`. The item id also cannot be read from `gh issue view` (its `projectItems` has no usable id); look it up on the board by issue number:
     ```bash
     FIELDS=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)
     FIELD_ID=$(echo "$FIELDS" | jq -r '.fields[] | select(.name=="Status") | .id')
     OPTION_ID=$(echo "$FIELDS" | jq -r '.fields[] | select(.name=="Status") | .options[] | select(.name=="Ready") | .id')
     ITEM_ID=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.items[] | select(.content.number==<issue-number>) | .id')
     gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" --field-id "$FIELD_ID" --single-select-option-id "$OPTION_ID"
     ```

5. Identify all items from the conversation and PRD context that should be handled as future feature enhancements (items that are related but out of scope for the current PRD). For each future feature enhancements:
   - Create a GitHub issue with a clear title and description
   - Apply the `Enhancement` label
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
