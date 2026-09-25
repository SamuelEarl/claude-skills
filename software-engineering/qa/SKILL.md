---
name: qa
description: Perform agent quality assurance and generate a Human QA Plan for implemented issues. Requires a GitHub issue link with an "Agent QA" section. Use when user wants to QA implemented code, review changes, or create a QA handoff plan.
argument-hint: <GitHub-issue-link>
disable-model-invocation: true
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

#### 2. Get GitHub project configuration

Before proceeding, check that `docs/agents/issue-tracker.md` exists. If it does not, stop and tell the user to run `/setup-ai-skills` first.

Read `docs/agents/issue-tracker.md` and extract:
- `PROJECT_NUMBER` — from the `## Project board` section, e.g. `(#42)`
- `OWNER` — from the git remote: `git remote get-url origin | sed -n 's#.*github.com[:/]\([^/]*\)/.*#\1#p'`
- `COMPLETE_OPTION_ID` — Status option ID for `status:complete`

If any option IDs are empty, `setup-ai-skills` did not complete successfully. Stop and tell the user to re-run `/setup-ai-skills`.

Then fetch the project node ID and Status field ID via GraphQL (these are not cached):

```bash
PROJECT_DATA=$(gh api graphql -f query='
  query($owner: String!, $number: Int!) {
    user(login: $owner) {
      projectV2(number: $number) {
        id
        fields(first: 20) {
          nodes {
            ... on ProjectV2SingleSelectField { id name }
          }
        }
      }
    }
  }
' -f owner="$OWNER" -F number="$PROJECT_NUMBER")
PROJECT_ID=$(echo "$PROJECT_DATA" | jq -r '.data.user.projectV2.id')
FIELD_ID=$(echo "$PROJECT_DATA" | jq -r '.data.user.projectV2.fields.nodes[] | select(.name=="Status") | .id')
```

If the owner is an org, replace `user` with `organization` in the query.

#### 3. Perform agent code review (initial round)

First note the issue's `## Layer` (UI, API, or DB). A **UI-layer** issue is built and QA'd **against a stub returning dummy data** — do not flag "talks to a stub instead of the real API/DB" or "no persistence" as a defect; that is by design and is delivered by the later API/DB passes. Review the UI's behavior down to its stub seam. For an API/DB issue, verify it correctly replaces the stub the layer above it stood on.

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

- If context window is approaching **~120k tokens**, ask:
  ```
  Context window is at ~120k tokens. Would you like to run the `/compact` command to condense the conversation?
  
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

For a **UI-layer** issue, the plan tests the UI against the **stub / dummy data** (that is what exists) and must explicitly state what is **deferred to the API and DB passes** (e.g. "real persistence, real invitations, and the enforced limit are verified in issues #X/#Y"), so the human does not test — or fail — behavior that is intentionally still stubbed.

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
   - Remove the `status:in-review` label and add `status:complete`
   - Move the issue to "Done" column
   - Close the issue
   
   Proceed? (yes/no)
   ```

2. **If confirmed, execute close workflow:**
   ```bash
   # Update labels
   gh issue edit <issue-number> --remove-label "status:in-review"
   gh issue edit <issue-number> --add-label "status:complete"

   # Move to Done column using COMPLETE_OPTION_ID from docs/agents/issue-tracker.md
   ITEM_ID=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.items[] | select(.content.number==<issue-number>) | .id')
   gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" --field-id "$FIELD_ID" --single-select-option-id "$COMPLETE_OPTION_ID"

   # Close issue
   gh issue close <issue-number>
   ```

3. **Report completion:**
   ```
   ✓ Issue #<number> closed successfully
   ✓ Moved to Done
   ✓ Updated labels to status:complete
   ```

#### 13. Create follow-up issues (if selected)

If user selects "Create follow-up issues":

1. Ask what type of follow-up issues to create:
   - **From Agent QA findings** — Create issues from remaining Medium/Low findings
   - **From Human QA results** — Create issues from manual testing discoveries
   - **Both** — Create issues from both sources

2. For each issue to create:
   - Ask for issue title and details
   - Create the GitHub issue
   - Apply labels: `category:bug` for QA findings, `category:enhancement` for new items; plus `status:needs-triage`
   - Link to the original issue (e.g., "Follow-up from #123")
   - Move to the project board:
     ```bash
     TRIAGE_OPTION_ID=<Status option ID for status:needs-triage from docs/agents/issue-tracker.md>
     ITEM_ID=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.items[] | select(.content.number==<new-issue-number>) | .id')
     gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" --field-id "$FIELD_ID" --single-select-option-id "$TRIAGE_OPTION_ID"
     ```

3. After creating follow-up issues, return to step 11 (ask what to do next)

## QA Principles

- **Be thorough but pragmatic** — Flag real issues, not nitpicks
- **Focus on behavior** — Does it work correctly for users?
- **Consider context** — What's the risk if this breaks? What's the usage pattern?
- **Provide actionable feedback** — Vague concerns aren't helpful
- **Respect project conventions** — Check CONTEXT.md and ADRs for project-specific standards
