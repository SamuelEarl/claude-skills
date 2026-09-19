# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue.** `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue.** `gh issue view <number> --comments`, filtering comments by `jq` and fetching labels.
- **List issues.** `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue.** `gh issue comment <number> --body "..."`
- **Apply / remove labels.** `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close.** `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v`. The `gh` CLI does this automatically when run inside a clone.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Project board

Project: [project-title] (#[project-number])
URL: https://github.com/orgs/[owner]/projects/[project-number]

| Column       | Status option ID |
| ------------ | ---------------- |
| Backlog      |                  |
| Ready        |                  |
| In progress  |                  |
| In review    |                  |
| Done         |                  |

To move an issue to a column, update its project item's Status field using the option ID from this table. The project node ID and Status field ID are needed for the GraphQL mutation — look them up with `gh api graphql` using the project number above if not cached here.
