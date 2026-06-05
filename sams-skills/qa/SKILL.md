---
name: qa
description: Perform agent code review and generate a Human QA Plan for implemented issues. Requires a GitHub issue link with an "Agent QA" section. Use when user wants to QA implemented code, review changes, or create a QA handoff plan.
argument-hint: <GitHub-issue-link>
---

# QA

Perform quality assurance on implemented code and create a detailed Human QA Plan.

## Input

The user must provide a GitHub issue link as an argument. If no link is provided, ask the user for it with these instructions:

**How to find the issue link:**
1. Open the issue in GitHub
2. Click the "Issue body actions" button at the top of the issue (i.e. the three dots at the top of the issue)
3. Select "Copy link"
4. Paste that link here

The issue must have an "Agent QA" section that lists the files changed during implementation.

## Process

### 1. Fetch and parse the issue

Fetch the GitHub issue and locate the "Agent QA" section. Extract the list of files that were changed during implementation.

If the "Agent QA" section is missing, inform the user that this issue was not prepared for QA (it needs to go through the `/implement` workflow first).

### 2. Perform agent code review

Review each file listed in the "Agent QA" section. Focus on:

**Correctness:**
- Logic errors or bugs
- Edge cases not handled
- Incorrect assumptions
- Error handling gaps

**Code Quality:**
- Readability and maintainability
- Naming clarity
- Code duplication
- Unnecessary complexity
- Adherence to project patterns (check CONTEXT.md, ADRs)
- Formatting and style compliance (check eslint.config.js, .prettierrc, or similar config files)

**Testing:**
- Test coverage for critical paths
- Test quality (behavior vs implementation testing)
- Missing test cases
- Test clarity and maintainability

**Security:**
- Input validation
- Authentication/authorization
- Data sanitization
- Common vulnerabilities (SQL injection, XSS, etc.)

**Performance:**
- Obvious inefficiencies
- Resource leaks
- Unnecessary computations

For each issue found, note:
- File and approximate location
- Severity (Critical, High, Medium, Low)
- Description of the issue
- Suggested fix (if straightforward)

### 3. Create Human QA Plan

Generate a detailed, step-by-step Human QA Plan that a human can follow to thoroughly test the implemented changes. Add this as a new section to the GitHub issue.

The plan should include:

1. **Setup steps** — How to prepare the environment for testing
2. **Core functionality tests** — Step-by-step instructions to verify each acceptance criterion
3. **Edge case tests** — Specific scenarios to test boundary conditions
4. **Integration tests** — How this change affects related features
5. **Regression tests** — Verify nothing broke
6. **User experience tests** — Real-world usage scenarios
7. **Performance tests** — If applicable, how to verify performance
8. **Security tests** — If applicable, security validation steps

Each test should be:
- **Concrete** — Exact steps to follow, exact inputs to use
- **Observable** — Clear expected outcomes
- **Ordered** — Logical progression from setup to advanced scenarios

**Format for the Human QA Plan section:**

```markdown
## Human QA Plan

### Setup
1. [Exact setup steps]
2. [Environment configuration]

### Core Functionality
**Test 1: [Test name]**
1. [Step-by-step instructions]
2. [Include exact inputs, clicks, commands]
3. **Expected result:** [What should happen]

**Test 2: [Test name]**
1. [Step-by-step instructions]
...

### Edge Cases
**Test 3: [Edge case name]**
1. [Steps to trigger edge case]
2. **Expected result:** [How it should handle this case]

### Integration
**Test 4: [Related feature name]**
1. [Steps to verify integration]
...

### Regression
- [ ] [Feature X still works as expected]
- [ ] [Feature Y is unaffected]

### User Experience
**Scenario: [Real-world use case]**
1. [End-to-end user workflow]
2. **Expected result:** [Smooth user experience]
```

Update the GitHub issue with this Human QA Plan section using `gh issue edit`.

### 4. Report findings and handle issues

Handle code review findings based on severity using a hybrid approach:

**Critical/High Severity Issues:**
1. Print findings to terminal with:
   - File and location
   - Description of the issue
   - Why it's critical/high severity
   - Suggested fix
2. Ask the user: "Critical/High severity issues found. Would you like to:"
   - **Fix them now** — Address issues immediately in this session
   - **Create blocking GitHub issues** — Create separate issues that block this one
   - **Document and proceed** — Add to findings section and continue (not recommended for critical issues)

**Medium/Low Severity Issues:**
1. Add an "Agent Code Review Findings" section to the GitHub issue:

```markdown
## Agent Code Review Findings

### Medium Severity
- **File: `path/to/file.ts`**
  - Issue: [Description]
  - Suggested fix: [Fix recommendation]

### Low Severity
- **File: `path/to/file.ts`**
  - Issue: [Description]
  - Suggested fix: [Fix recommendation]
```

2. These can be addressed later or turned into follow-up issues after human QA

**If no issues found:**
- Report that agent code review passed
- Skip the findings section
- Recommend proceeding directly to human QA

### 5. GitHub issue next steps

Ask the user what they would like to do with the GitHub issue now that QA is complete. Present options and recommendations:

**Options:**
- **Proceed with Human QA** — Use the Human QA Plan to manually test (recommended if no critical issues)
- **Fix agent-identified issues first** — Address code review findings before human QA (recommended if critical issues found)
- **Close the issue as complete** — Skip human QA and mark as done (only if very confident):
  1. Remove `in-review` label: `gh issue edit <issue-number> --remove-label "in-review"`
  2. Move to "Done" column: `gh project item-edit --id $(gh issue view <issue-number> --json projectItems --jq '.projectItems[0].id') --project-id 5 --field-id $(gh project field-list --owner SamuelEarl --project 5 --format json | jq -r '.fields[] | select(.name=="Status") | .id') --text "Done"`
  3. Close issue: `gh issue close <issue-number>`
- **Create follow-up issues** — Split QA findings or human QA into separate issues
- **Request peer review** — Get another developer to review before proceeding

**Recommended approach:**
- If critical/high severity issues found and fixed: Run `/qa` again to verify
- If critical/high issues turned into blocking GitHub issues: Address those first, then continue
- If only medium/low issues or no issues: Proceed with human QA using the plan
- If human QA reveals new issues: Create follow-up issues for those
- After successful human QA: 
  - Create follow-up issues for any remaining Medium/Low findings (if worth addressing)
  - Remove `in-review` label: `gh issue edit <issue-number> --remove-label "in-review"`
  - Move to "Done" column: `gh project item-edit --id $(gh issue view <issue-number> --json projectItems --jq '.projectItems[0].id') --project-id 5 --field-id $(gh project field-list --owner SamuelEarl --project 5 --format json | jq -r '.fields[] | select(.name=="Status") | .id') --text "Done"`
  - Close the issue: `gh issue close <issue-number>`

Ask: "Agent QA complete and Human QA Plan added to the issue. What would you like to do next?"

## QA Principles

- **Be thorough but pragmatic** — Flag real issues, not nitpicks
- **Focus on behavior** — Does it work correctly for users?
- **Consider context** — What's the risk if this breaks? What's the usage pattern?
- **Provide actionable feedback** — Vague concerns aren't helpful
- **Respect project conventions** — Check CONTEXT.md and ADRs for project-specific standards
