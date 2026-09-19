# Kanban Board Configuration

## Project Settings

- **Name**: My Project Board
- **Description**: Project management for my repository

## Category Labels

These labels do not typically change after they have been assigned and are not tied to a column in the Kanban board.

| Label                | Color     | Description  |
| -------------------- | --------- | ------------ |
| category:prd         | #ff5e00 | This is a product requirements document (PRD) and does not contain workable issues  |
| category:feature     | #053b78 | Feature or request from current PRD |
| category:enhancement | #a082ea | Future feature enhancement that is out of scope for current PRD |
| category:bug         | #bd1e2e | Something isn't working |

## Status Labels

These labels change as the state of the issue changes and are tied to the columns in the Kanban board.

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
