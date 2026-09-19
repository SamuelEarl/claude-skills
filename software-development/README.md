# Software Development Skills

These skills are borrowed from other people and tweaked to fit my workflows. I have renamed many of them to distinguish them from the original versions to make it easier for me to compare my skills to any updates from the originals, which will make it easier for me to make periodic updates when necessary.

## Preliminary Setup: `plain-english`, `triage` & `setup-project` skills

### The `plain-english` Skill

_This skill is a copy of @poteto's `unslop` skill: https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md_

Setup your AI agent so that every response is written in plain English. To make every Claude Code response follow a writing style persistently, add the rules to your global `~/.claude/CLAUDE.md` file. That file is loaded in every session across all projects, so adding the writing guidelines from that skill directly into `~/.claude/CLAUDE.md` will cause Claude Code to follow them automatically.

Create the following files:

* `~/.claude/CLAUDE.md`
* `~/.claude/skills/plain-english/SKILL.md`

Add this inside the `~/.claude/CLAUDE.md`:

```md
@skills/plain-english/SKILL.md
```

Check if you configured this skill correctly by opening a new Claude Code session and running this prompt: "Describe your writing instructions." The response should mention the `plain-english` skill rules. To test it, you can run this prompt in the same Claude Code session: "Show me a before and after example."

You can also invoke the `/plain-english` and ask Claude to rewrite difficult-to-understand or jargon-filled files or documentation so they are easier to understand.

### `triage`

Most skill-based setups are great for solo developers, but they are not so great when working with a team. When working with others (e.g. at work or on open source projects), you will often need to triage other people's ideas to figure out if they are good or not, to determine if they are worth building, to determine if it is a bug report that needs to be reproduced, etc.

You can run this skill, for example, on open source repos, when working through GitHub issues, or run it against a backlog to flesh-out that backlog and categorize the issues (e.g. turn them into actionable tasks that can be picked up by an AI agent, reject the tasks).

Watch Matt Pocock do a demo with this skill: [Burn through the backlog from hell with /triage](https://www.youtube.com/watch?v=MzWIIlx0Gpc)

### `setup-project`

Create a `/docs/agents/` folder in your repo's root directory and copy and paste the `KANBAN_BOARD.md` file from this skill inside that folder. Make any adjustments to the `KANBAN_BOARD.md` file that you want.

KANBAN_BOARD.md

```md
# Kanban Board Configuration

## Project Settings

- **Name**: My Project Board
- **Description**: Project management for my repository

## Category Labels

These do not typically change after they have been assigned and are not tied to a column in the Kanban board.

| Label                | Color     | Description  |
| -------------------- | --------- | ------------ |
| category:prd         | #ff5e00 | This is a product requirements document (PRD) and does not contain workable issues  |
| category:feature     | #053b78 | Feature or request from current PRD |
| category:enhancement | #a082ea | Future feature enhancement that is out of scope for current PRD |
| category:bug         | #a60818 | Something isn't working |

## Status Labels

These change as the state of the issue changes and are tied to the columns in the Kanban board.

| Label                         | Color     | Description  | Column |
| ----------------------------- | --------- | ------------ | ------ |
| status:needs-triage           | #d93f0b | A maintainer needs to evaluate this issue and decide what to do with it | Backlog |
| status:needs-info             | #d93f0b | Waiting for the reporter to provide more info | Backlog |
| status:ready-to-create-issues | #097110 | PRD is ready to be turned into issues which can be implemented | Ready |
| status:ready-for-agent        | #097110 | Issue is ready to be implemented by an AI agent | Ready |
| status:ready-for-human        | #097110 | Issue is ready to be implemented by a human | Ready |
| status:in-progress            | #6495ed | Issue is currently being worked on | In progress |
| status:in-review              | #fbca04 | Issue needs to go through QA before it can be marked Done. | In review |
| status:no-action              | #620783 | No action will be taken | Done |
| status:complete               | #620783 | Issue is complete | Done |
