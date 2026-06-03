---
name: research
description: Conduct codebase and/or external research from a structured request file. Reads a RESEARCH_REQUEST.md, investigates the questions, and writes findings to RESEARCH_FINDINGS.md in the same directory. Use when user wants to research a topic, evaluate options, explore the codebase, or investigate a technical question.
argument-hint: path/to/RESEARCH_REQUEST.md
---

# Research

## Input

Read the `RESEARCH_REQUEST.md` file the user provided as an argument. If no path was provided, ask for one.

The request file should follow this template:

```markdown
# Research Request

## Background
What context does the researcher need? What project, feature, or problem does this relate to?

## Questions
1. Specific question to answer
2. Another question
3. ...

## Constraints
Any limitations on scope, technology choices, timeline, or compatibility requirements.

## Success Criteria
How will we know the research is sufficient? What decisions should the findings enable?
```

If the request file is missing sections, work with what's provided — but flag gaps that limit the research.

## Process

1. **Read the request** and identify whether each question requires codebase exploration, external research, or both.
2. **Codebase research** — read files, trace code paths, grep for patterns, understand architecture. Prefer primary sources (the code itself) over assumptions.
3. **External research** — search the web, read documentation, compare libraries or approaches. Cite sources.
4. **Synthesize** — connect findings across questions. Note where answers to one question affect others.
5. **Write findings** — output to `RESEARCH_FINDINGS.md` in the same directory as the request file.

## Output format

Write `RESEARCH_FINDINGS.md` with this structure:

```markdown
# Research Findings

> Summary: [2-3 sentence executive summary of key findings]

## Findings

### [Question 1 from request]

[Answer with evidence. Include code paths, file references, links, or quotes as appropriate.]

### [Question 2 from request]

[Answer...]

## Recommendations

[Based on the findings, what should we do? Present options with trade-offs if the answer isn't clear-cut.]

## Open Questions

[Anything that came up during research that couldn't be resolved and needs further investigation.]

## Sources

[Links, file paths, documentation references used.]
```

## Rules

- Answer the questions that were asked. Don't expand scope unless a finding directly affects the request.
- Distinguish facts from opinions. Label recommendations as such.
- When comparing options, use a consistent structure (pros/cons or a comparison table).
- If a question can't be answered with available information, say so and explain what's needed.
- Reference code by file path and line number where applicable.
