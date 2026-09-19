---
name: project-setup
description: Sets up an `## Agent skills` block in AGENTS.md/CLAUDE.md and `docs/agents/` so the engineering skills know this repo's issue tracker (GitHub or local markdown), triage label vocabulary, and domain doc layout. Run before first use of `to-issues`, `to-prd`, `triage`, `diagnose`, `tdd`, `improve-codebase-architecture`, or `zoom-out`, or if those skills appear to be missing context about the issue tracker, triage labels, or domain docs.
disable-model-invocation: true
---

# Setup Project

Set up the per-repo configuration the engineering skills need.

- **Issue tracker.** Where issues live (GitHub by default; local markdown is also supported).
- **Triage labels.** The strings used for the five canonical triage roles.
- **Domain docs.** Where `CONTEXT.md` and ADRs live, and how skills should read them.

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the repo to understand its starting state. Read whatever exists; don't assume.

- Check `git remote -v` and `.git/config`. Is this a GitHub repo, and which one?
- Check `AGENTS.md` and `CLAUDE.md` at the repo root. Does either exist? Is there already an `## Agent skills` section in either?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root.
- `docs/adr/` and any `src/*/docs/adr/` directories.
- `docs/agents/`: does this skill's prior output already exist?
- `.scratch/`: does this indicate a local-markdown issue tracker is in use?
- Is the `triage` skill installed? Is there a `triage` skill folder alongside this one, or `triage` in your available skills? This decides whether Section B runs at all.
- Monorepo signals: a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. These are present only in a genuinely large multi-package repo; their absence means single-context, which is almost every repo.
- If the remote is GitHub, run `gh project list --owner <owner>` to check whether a project board already exists for this repo.
- `docs/agents/KANBAN_BOARD.md`: does it exist? If so, it provides label definitions, colors, and column mappings — Sections B and D become confirmations rather than questions, and `triage-labels.md` is not written.

### 2. Present findings and ask

Summarise what's present and what's missing. Then walk the user through the three decisions one at a time: present a section, get the user's answer, then move to the next. Don't present all three at once.

Assume the user does not know what these terms mean. Each section starts with a short explainer (what it is, why these skills need it, what changes if they pick differently). Then show the choices and the default.

Skip the following sections entirely if the Explore step indicated to do so (i.e. skip Section B if `triage` isn't installed, skip Section C if there is no monorepo, skip Section D if the issue tracker isn't GitHub). When `KANBAN_BOARD.md` exists, Sections B and D are confirmations: show what the file contains and ask the user to confirm or correct rather than asking from scratch.

**Section A: Issue tracker**

> The "issue tracker" is where issues live for this repo. Skills like `to-issues`, `triage`, `to-prd`, and `qa` read from and write to it. They need to know whether to call `gh issue create`, write a markdown file under `.scratch/`, or follow some other workflow you describe. Pick the place you actually track work for this repo.

Default: these skills were designed for GitHub. If a `git remote` points at GitHub, propose that. If it points at GitLab, propose GitLab. Otherwise, offer:

- **GitHub.** Issues live in the repo's GitHub Issues (uses the `gh` CLI).
- **GitLab.** Issues live in the repo's GitLab Issues (uses the [`glab`](https://gitlab.com/gitlab-org/cli) CLI).
- **Local markdown.** Issues live as files under `.scratch/<feature>/` in this repo (good for solo projects or repos without a remote).
- **Other** (Jira, Linear, etc.): ask the user to describe the workflow in one paragraph. The skill records it as freeform prose.

**Section B: Triage label vocabulary**

Skip this section entirely if the `triage` skill isn't installed, which should have been discovered during the Explore step.

If `KANBAN_BOARD.md` exists, derive the triage label vocabulary from its `status:*` rows instead of asking. Show the user the derived mapping and ask them to confirm. The five canonical roles map to KANBAN_BOARD.md labels as follows — show the actual label strings found in the file:

| Canonical role    | Label from KANBAN_BOARD.md      |
| ----------------- | ------------------------------- |
| needs-triage      | (the `status:needs-triage` row) |
| needs-info        | (the `status:needs-info` row)   |
| ready-for-agent   | (the `status:ready-for-agent` row) |
| ready-for-human   | (the `status:ready-for-human` row) |
| wontfix           | (the `status:no-action` row)    |

> When the `triage` skill processes an incoming issue, it moves it through a state machine: 

- needs evaluation
- waiting on reporter
- ready for an AFK agent
- ready for a human
- won't fix

It needs to apply labels (or the equivalent in your issue tracker) that match strings you've actually configured. If your repo uses different label names (e.g. `bug:triage` instead of `needs-triage`), map them here so the skill applies the right ones instead of creating duplicates.

The five canonical roles:

- `needs-triage`: maintainer needs to evaluate
- `needs-info`: waiting on reporter
- `ready-for-agent`: fully specified, AFK-ready (an agent can pick it up with no human context)
- `ready-for-human`: needs human implementation
- `wontfix`: will not be actioned

Default: each role's string equals its name. Ask the user if they want to override any. If their issue tracker has no existing labels, the defaults are fine.

**Section C: Domain docs**

> Some skills (`improve-codebase-architecture`, `diagnose`, `tdd`) read a `CONTEXT.md` file to learn the project's domain language, and `docs/adr/` for past architectural decisions. They need to know whether the repo has one global context or multiple (e.g. a monorepo with separate frontend/backend contexts) so they look in the right place.

Confirm the layout:

- **Single-context.** One `CONTEXT.md` and `docs/adr/` at the repo root. Most repos are this.
- **Multi-context.** `CONTEXT-MAP.md` at the root pointing to per-context `CONTEXT.md` files (typically a monorepo).

**Section D: GitHub project board** (GitHub issue tracker only)

> A GitHub project board gives you a Kanban view of your issues. Setting one up here links it to this repo so issues appear on the board automatically.

If the Explore step found an existing project board, ask whether to use it or create a new one.

If `KANBAN_BOARD.md` exists, derive the columns from the unique values in its Column column (preserving order of first appearance). Show the derived list and ask the user to confirm or edit.

Default columns when no `KANBAN_BOARD.md` exists: Backlog, Ready, In progress, In review, Done. Ask the user if they want those or a different list.

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md` is being edited (see step 4 for selection rules).
- The contents of `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, and `docs/agents/triage-labels.md` (the last only when `triage` is installed).

When GitHub is the issue tracker and Section D was answered, the draft of `issue-tracker.md` should include a `## Project board` section with the confirmed title and columns. Leave the project number, URL, and Status option IDs as placeholders — they get filled in during step 5 after the project is created.

When `KANBAN_BOARD.md` exists, omit `triage-labels.md` from the draft entirely. The `## Agent skills` block in CLAUDE.md/AGENTS.md should reference `KANBAN_BOARD.md` instead:

```markdown
### Triage labels

Labels and column mappings are in `docs/agents/KANBAN_BOARD.md`. Status labels (prefix `status:`) drive column placement; category labels (prefix `category:`) classify issues.
```

Let them edit before writing.

### 4. Write

**Pick the file to edit:**

- If `CLAUDE.md` exists, edit it.
- Else if `AGENTS.md` exists, edit it.
- If neither exists, ask the user which one to create; don't pick for them.

Never create `AGENTS.md` when `CLAUDE.md` already exists (or vice versa). Always edit the one that's already there.

If an `## Agent skills` block already exists in the chosen file, update its contents in place rather than appending a duplicate. Don't overwrite user edits to the surrounding sections.

The block:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout, "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

Then write the docs files using the seed templates in this skill folder as a starting point:

- [issue-tracker-github.md](./issue-tracker-github.md): GitHub issue tracker
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md): GitLab issue tracker
- [issue-tracker-local.md](./issue-tracker-local.md): local-markdown issue tracker
- [triage-labels.md](./triage-labels.md): label mapping (omit when `KANBAN_BOARD.md` exists)
- [domain.md](./domain.md): domain doc consumer rules and layout

For "other" issue trackers, write `docs/agents/issue-tracker.md` from scratch using the user's description.

### 5. Create the GitHub project board (GitHub only)

Skip this step if the issue tracker isn't GitHub.

**5a. Create labels** (when `KANBAN_BOARD.md` exists)

Create every label defined in `KANBAN_BOARD.md` using `gh label create`. Run one command per label:

```
gh label create "<name>" --color "<hex>" --description "<description>"
```

If a label already exists, use `gh label edit` instead.

**5b. Create the project** (skip if the user chose an existing one)

```
gh project create --owner <owner> --title "<project-title>"
```

Note the project number from the output.

**5c. Link the repo**

```
gh project link <number> --owner <owner> --repo <owner>/<repo>
```

**5d. Set up the columns**

GitHub Projects v2 stores columns as options on the built-in Status single-select field. The default options are "Todo", "In Progress", and "Done"; replace them with the confirmed column list.

First, get the project's node ID and the Status field's node ID:

```
gh api graphql -f query='
  query($owner: String!, $number: Int!) {
    user(login: $owner) {
      projectV2(number: $number) {
        id
        fields(first: 20) {
          nodes {
            ... on ProjectV2SingleSelectField {
              id
              name
              options { id name }
            }
          }
        }
      }
    }
  }
' -f owner=<owner> -F number=<number>
```

If the owner is an org, replace `user` with `organization` in the query.

Delete each existing option:

```
gh api graphql -f query='
  mutation($projectId: ID!, $fieldId: ID!, $optionId: String!) {
    deleteProjectV2FieldOption(input: {
      projectId: $projectId
      fieldId: $fieldId
      optionId: $optionId
    }) { deletedOptionId }
  }
' -f projectId=<project-node-id> -f fieldId=<status-field-id> -f optionId=<option-id>
```

Add each new column in order:

```
gh api graphql -f query='
  mutation($projectId: ID!, $fieldId: ID!, $name: String!) {
    createProjectV2FieldOption(input: {
      projectId: $projectId
      fieldId: $fieldId
      name: $name
    }) {
      projectV2Field {
        ... on ProjectV2SingleSelectField {
          options { id name }
        }
      }
    }
  }
' -f projectId=<project-node-id> -f fieldId=<status-field-id> -f name="<column-name>"
```

When `KANBAN_BOARD.md` exists, derive the column list from the unique values in its Column column (preserving order of first appearance). Otherwise use the confirmed list from Section D.

**5e. Update `docs/agents/issue-tracker.md`**

Fill in the `## Project board` section with the real values now known:

- Project number and URL (from step 5b)
- Status option IDs: after creating the columns, record each column name and its option ID so skills can update project items without extra lookups. Format:

```
| Column       | Status option ID |
| ------------ | ---------------- |
| Backlog      | <option-id>      |
| Ready        | <option-id>      |
| In progress  | <option-id>      |
| In review    | <option-id>      |
| Done         | <option-id>      |
```

### 6. Done

Tell the user the setup is complete and which engineering skills will now read from these files. Mention they can edit `docs/agents/*.md` directly later. Re-running this skill is only needed if they want to switch issue trackers or restart from scratch.
