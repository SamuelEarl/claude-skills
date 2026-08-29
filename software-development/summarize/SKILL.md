---
name: summarize
description: Compact the current conversation into a handoff summary that a fresh session can use to continue the work. Use when the user wants to summarize a session, create a handoff document, or capture decisions before clearing context.
argument-hint: path/to/summary.md
---

# Summarize

Write a handoff summary of the current conversation so a fresh agent session can continue the work.

## Output

Save the summary to the file path the user provided as an argument. If no path was provided, ask the user where to save it.

## Content

Include:

1. **Session date** — the date this session took place, formatted as "Session Date: DD MMM YYYY" (e.g., "Session Date: 04 Jun 2026") at the top of the file
2. **Goal** — what the session set out to accomplish
3. **Decisions made** — what was decided and why, including alternatives that were considered and rejected
4. **Current state** — what was built, changed, or configured so far. Include the **current layer/phase** (UI, API, or DB) of any feature in flight and the **stubs still standing** (what is still faked with dummy data and which later layer will replace it), so the next session knows what is real and what is not yet wired.
5. **Open questions** — unresolved issues that need answers
6. **Next steps** — what the next session should pick up
7. **Suggested skills** — skills the next session should invoke
8. **References** — paths or URLs to artifacts produced (PRDs, plans, ADRs, issues, commits, diffs)

## Rules

- Do not duplicate content already captured in other artifacts. Reference them by path or URL instead.
- Redact sensitive information (API keys, passwords, PII).
- Write for a reader with zero context — the next session starts cold.
