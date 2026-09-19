# Issue tracker: GitLab

Issues and PRDs for this repo live as GitLab issues. Use the [`glab`](https://gitlab.com/gitlab-org/cli) CLI for all operations.

## Conventions

- **Create an issue.** `glab issue create --title "..." --description "..."`. Use a heredoc for multi-line descriptions. Pass `--description -` to open an editor.
- **Read an issue.** `glab issue view <number> --comments`. Use `-F json` for machine-readable output.
- **List issues.** `glab issue list -F json` with appropriate `--label` filters.
- **Comment on an issue.** `glab issue note <number> --message "..."`. GitLab calls comments "notes".
- **Apply / remove labels.** `glab issue update <number> --label "..."` / `--unlabel "..."`. Use comma-separated values or repeat the flag for multiple labels.
- **Close.** `glab issue close <number>`. This command doesn't accept a closing comment, so post the explanation first with `glab issue note <number> --message "..."`, then close.
- **Merge requests.** GitLab calls PRs "merge requests". Use `glab mr create`, `glab mr view`, `glab mr note`, etc. The shape matches `gh pr ...` with `mr` in place of `pr` and `note`/`--message` in place of `comment`/`--body`.

Infer the repo from `git remote -v`. The `glab` CLI does this automatically when run inside a clone.

## When a skill says "publish to the issue tracker"

Create a GitLab issue.

## When a skill says "fetch the relevant ticket"

Run `glab issue view <number> --comments`.
