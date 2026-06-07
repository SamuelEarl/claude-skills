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

### Phase 1: Initial Agent QA

#### 1. Fetch and parse the issue

Fetch the GitHub issue and locate the "Agent QA" section. Extract the list of files that were changed during implementation.

If the "Agent QA" section is missing, inform the user that this issue was not prepared for QA (it needs to go through the `/implement` workflow first).

#### 2. Perform agent code review (initial round)

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

#### 3. Report findings

Display all findings organized by severity:

**Critical/High Severity Issues:**
Print to terminal with:
- File and location
- Description of the issue
- Why it's critical/high severity
- Suggested fix

**Medium/Low Severity Issues:**
Print to terminal with:
- File and location
- Description of the issue
- Suggested fix (if straightforward)

**If no issues found:**
Report that agent code review passed with no issues.

### Phase 2: Agent QA Iteration Loop

#### 4. Ask what to do next

Present options based on findings:

```
Agent QA round complete. What would you like to do?

Options:
- Fix agent-identified issues [only show if any issues found]
- Re-run agent QA [if user fixed issues outside this session]
- Proceed with Human QA Plan [recommended if no critical issues remain]
- Close the issue as complete [only if confident no QA needed]
```

**Recommendations to include:**
- If critical/high severity issues found: Recommend "Fix agent-identified issues" first
- If only medium/low issues: Recommend "Proceed with Human QA Plan"
- If no issues: Recommend "Proceed with Human QA Plan"

Wait for user selection and proceed to the corresponding step.

#### 5. Fix agent-identified issues (if selected)

1. Ask which issues to fix:
   - **Fix all** — Address all findings in this session
   - **Fix critical/high only** — Address only critical/high severity issues
   - **Select specific issues** — User picks which ones to fix

2. Fix the selected issues

3. Run another agent code review on the changed files (or all files if user requests)

4. Report new findings

5. **Check context window** (see step 6)

6. Return to step 4 (ask what to do next)

#### 6. Context window monitoring

After each QA round (review or fix), check the approximate token count:

- If context window is approaching **~100k tokens**, ask:
  ```
  Context window is at ~100k tokens. Would you like to run the `/compact` command to condense the conversation?
  
  Options:
  - Run /compact now [recommended to prevent context overflow]
  - Continue without compacting [if close to finishing]
  ```

- If user selects "Run /compact now":
  - Instruct user to type `/compact` in the chat
  - Wait for user to run the command
  - Continue after compact completes

#### 7. Re-run agent QA (if selected)

If user selected "Re-run agent QA" in step 4:

1. Ask which files to review:
   - **All files** — Review all files in the "Agent QA" section
   - **Specific files** — User specifies which files

2. Run agent code review on selected files

3. Report findings

4. Check context window (step 6)

5. Return to step 4 (ask what to do next)

### Phase 3: Human QA Plan Creation

#### 8. Create Human QA Plan (only when user selects "Proceed with Human QA Plan")

Generate a detailed, step-by-step Human QA Plan that a human can follow to thoroughly test the implemented changes.

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

#### 9. Add findings section to GitHub issue (if applicable)

If there were any Medium/Low severity issues found during Agent QA that weren't fixed, add an "Agent Code Review Findings" section to the GitHub issue:

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

#### 10. Update GitHub issue with Human QA Plan

Add the Human QA Plan section (and findings section if applicable) to the GitHub issue using `gh issue edit`.

### Phase 4: Post-QA Actions

#### 11. Ask what to do after Human QA Plan creation

Present final options:

```
Human QA Plan has been added to the issue. What would you like to do?

Options:
- Proceed with Human QA [you will test manually using the plan]
- Create follow-up issues [for remaining Medium/Low findings or new items]
- Close the issue as complete [if Human QA already done or not needed]
```

Wait for user selection.

#### 12. Close issue workflow (if selected)

If user selects "Close the issue as complete":

1. **Confirm with user:**
   ```
   Confirm close? This will:
   - Remove the `in-review` label
   - Move the issue to "Done" column
   - Close the issue
   
   Proceed? (yes/no)
   ```

2. **If confirmed, execute close workflow:**
   ```bash
   # Remove in-review label
   gh issue edit <issue-number> --remove-label "in-review"
   
   # Move to Done column
   gh project item-edit \
     --id $(gh issue view <issue-number> --json projectItems --jq '.projectItems[0].id') \
     --project-id 5 \
     --field-id $(gh project field-list --owner SamuelEarl --project 5 --format json | jq -r '.fields[] | select(.name=="Status") | .id') \
     --text "Done"
   
   # Close issue
   gh issue close <issue-number>
   ```

3. **Report completion:**
   ```
   ✓ Issue #<number> closed successfully
   ✓ Moved to Done
   ✓ Removed in-review label
   ```

#### 13. Create follow-up issues (if selected)

If user selects "Create follow-up issues":

1. Ask what type of follow-up issues to create:
   - **From Agent QA findings** — Create issues from remaining Medium/Low findings
   - **From Human QA results** — Create issues from manual testing discoveries
   - **Both** — Create issues from both sources

2. For each issue to create:
   - Ask for issue title and details
   - Create the GitHub issue with appropriate labels
   - Link to the original issue (e.g., "Follow-up from #123")

3. After creating follow-up issues, return to step 11 (ask what to do next)

## QA Principles

- **Be thorough but pragmatic** — Flag real issues, not nitpicks
- **Focus on behavior** — Does it work correctly for users?
- **Consider context** — What's the risk if this breaks? What's the usage pattern?
- **Provide actionable feedback** — Vague concerns aren't helpful
- **Respect project conventions** — Check CONTEXT.md and ADRs for project-specific standards
