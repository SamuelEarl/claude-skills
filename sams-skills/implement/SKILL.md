---
name: implement
description: Implement a single issue using test-driven development. Requires a GitHub issue link as input, extracts what to build and acceptance criteria, then drives a red-green-refactor loop scoped to that issue. Use when user wants to implement an issue, build a feature from a ticket, or TDD a specific issue.
argument-hint: <GitHub-issue-link>
---

# Implement

Implement a single issue using TDD.

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

## Update Issue Status

Before beginning implementation, update the issue to reflect that work has started:

1. **Update labels**:
   - Remove `ready-for-implementation`: `gh issue edit <issue-number> --remove-label "ready-for-implementation"`
   - Add `in-progress`: `gh issue edit <issue-number> --add-label "in-progress"`

2. **Move to "In progress" column**: `gh project item-edit --id $(gh issue view <issue-number> --json projectItems --jq '.projectItems[0].id') --project-id 5 --field-id $(gh project field-list --owner SamuelEarl --project 5 --format json | jq -r '.fields[] | select(.name=="Status") | .id') --text "In progress"`

## TDD Philosophy

**Core principle**: Tests should verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't.

**Good tests** are integration-style: they exercise real code paths through public APIs. They describe _what_ the system does, not _how_ it does it. A good test reads like a specification - "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

**Bad tests** are coupled to implementation. They mock internal collaborators, test private methods, or verify through external means (like querying a database directly instead of using the interface). The warning sign: your test breaks when you refactor, but behavior hasn't changed. If you rename an internal function and tests fail, those tests were testing implementation, not behavior.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" - treating RED as "write all tests" and GREEN as "write all code."

This produces **bad tests**:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You end up testing the _shape_ of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes - they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle. Because you just wrote the code, you know exactly what behavior matters and how to verify it.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
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

## Workflow

### 1. Planning

When exploring the codebase, use the project's domain glossary so that test names and interface vocabulary match the project's language, and respect ADRs in the area you're touching.

Derive the test plan from the issue's acceptance criteria:

- [ ] Map each acceptance criterion to one or more testable behaviors
- [ ] Confirm with user which behaviors to test (prioritize)
- [ ] Identify opportunities for [deep modules](deep-modules.md) (small interface, deep implementation)
- [ ] Design interfaces for [testability](interface-design.md)
- [ ] List the behaviors to test (not implementation steps)
- [ ] Order behaviors so the first one is a tracer bullet through all layers
- [ ] Get user approval on the plan

Ask: "Here are the behaviors I'll test, derived from the acceptance criteria. What should the public interface look like? Which behaviors are most important to test?"

**You can't test everything.** Confirm with the user exactly which behaviors matter most. Focus testing effort on critical paths and complex logic, not every possible edge case.

### 2. Tracer Bullet

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test for first behavior → test fails
GREEN: Write minimal code to pass → test passes
```

This is your tracer bullet - proves the path works end-to-end.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
```

Rules:

- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior

### 4. Refactor

After all tests pass, look for [refactor candidates](refactoring.md):

- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] Consider what new code reveals about existing code
- [ ] Run tests after each refactor step

**Never refactor while RED.** Get to GREEN first.

### 5. Verify acceptance criteria

Walk through each acceptance criterion from the issue and confirm it's covered:

- [ ] Each criterion has at least one passing test
- [ ] No criteria were missed or only partially addressed

Report any criteria that couldn't be fully met and why.

### 6. Document changes and prepare for QA

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
   - Remove the `in-progress` label: `gh issue edit <issue-number> --remove-label "in-progress"`
   - Add the `in-review` label: `gh issue edit <issue-number> --add-label "in-review"`

3. **Move to "In review" column**: `gh project item-edit --id $(gh issue view <issue-number> --json projectItems --jq '.projectItems[0].id') --project-id 5 --field-id $(gh project field-list --owner SamuelEarl --project 5 --format json | jq -r '.fields[] | select(.name=="Status") | .id') --text "In review"`

4. **Inform the user**: "Implementation complete. The issue has been documented and labeled for QA. You can now run `/qa <issue-link>` to perform quality assurance."

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
```
