# Autonomous Workflow

How to build a reliable and autonomous software engineering workflow? This workflow could use multiple agents working together to achieve the goal of building software, but it is not required. That would require more coordination and might be necessary if multiple human software engineers are trying to work together. I am trying to figure out a workflow that works for a single person.

I need to read through the articles, analyze, and synthesize the information into a complete feature request.

* I want to create a software factory that is like a michelin kitchen for software.
* I want my role to be a designer (designing UI and UX with Figma) and a software architect (designing APIs, creating a system design and architecture for the feature) and have the code generated autonomously by AI in this workflow.
    * For UI code: I will give the AI the Figma file and any necessary API documentation and ask it to generate the code for the feature.
    * For API code: I will work with the AI to design the APIs and create a system design and architecture for the feature and ask it to generate the code for the feature.
* The workflow is the same as my `top-down-software-engineering` workflow until we get to the implement skill. That skill and those that follow it should be run autonomously in a loop until all the issues that are related to the PRD (in GitHub) have been completed.
* Instead of `ralph.sh`, I think I want to call the bash script `autobots-once.sh` and `autobots-loop.sh`. See https://www.aihero.dev/getting-started-with-ralph.
* The **environment** that the AI agent operates in is probably the most critical part of the workflow. I think the environment is the combination of the code base (which provides the tests and other verification tools, code quality rules and patterns, linting rules) and the AI skills (which provide the context and instructions) so that the AI agents have clear expectations for what to do and how to do it without stepping out of bounds.
    * Once code has been written by the AI agents, the verifications are used to make sure that the code was written correctly.
    * Context (teach AI agents) not control (micro-manage AI agents). I want this workflow to teach AI agents how to do things properly so that I don't have to micromanage them, which is not scalable or efficient because I become the bottleneck. So how do I provide agents with the proper context?
* **Verification** allows you to build trust with your AI agents. Verification is related to the environment and is probably the second most critical part of the workflow. This workflow needs to verify that the code is correct and complete, but how do I do that? Verification is especially important since I plan on moving the HITL steps to the end where I can test and review the finished feature.
    * Tests need to run and pass.
    * Linting and formatting needs to run and pass.
    * AI agents should verify UI code against the figma file using the Claude in Chrome Extension or Playwright (https://playwright.dev/docs/getting-started-mcp).
* NOTE: The environment and verification are talked about in https://www.youtube.com/watch?v=MN9dGgmLyso at 15:12.
* Instead of writing a bash script to work as the orchestrator of the workflow, can the orchestration instructions be specified in a skill?
* Self-improvement Ideas:
    * Look through your previous conversation histories, coding patterns, corrections that you have had to make, etc. to identify issues that are brought up often with the AI and make adjustments to your skills, tests, lint rules, etc to address those issues. 
    * This is talked about in https://www.youtube.com/watch?v=MN9dGgmLyso at 1:02:24
    * Look at the `recall` skill in pstack for more ideas about this.
* Proof-Driven Development: Is there a way to implement proofs that ensure that the code is correct and complete (i.e. bug free)? Look at https://bend-lang.com/ for ideas about this.

---

I want to think of myself as a designer and software architect and have AI do the coding.

I should use my AI-assisted workflow to help me create an automated, multi-agent software engineering workflow. I can use the notes below as my feature request.

* Ensure that token window limits are followed.
* I want to move the HITL steps to the end where I can test and review the finished feature. 
* I don't want to give an entire product to AI agents and I also don't want to give only a single issue to AI agents. I want to plan out a feature and have the agents build it out. Then I want to take care of the Human (Manual) QA testing and review. This will include user testing from me.
* I want to include a step in the process where the AI learns from its previous mistakes and makes suggestions for improving the workflow for the next run. I will review those suggestions for improvement before they are implemented. Maybe this should be done in plan mode.
* The AI should document any decisions that were made by the AI and any problems that it ran into so I can review those and decide what I want to do. 
* Reference Matt Pocock's and poteto's repos for any ideas, skills, or AI workflows that I should use.
* Tips for minimizing token usage so I don't run out of tokens in the middle of a run.

---

To build reliable multi-agent software engineering workflows, you must treat the system like a distributed software architecture rather than a chain of unconstrained chat prompts. [1] (https://github.blog/ai-and-ml/generative-ai/multi-agent-workflows-often-fail-heres-how-to-engineer-ones-that-dont/)

Step 1: Design the Workflow First

* Map out stages: Define distinct software lifecycle stages (e.g., requirements analysis, architecture planning, coding, unit testing, and code review) before writing agent code. [1] (https://www.mindstudio.ai/blog/how-to-build-multi-agent-workflow)
* Identify dependencies and parallelism: Determine which steps must run sequentially (e.g., writing a failing test before implementation) and which can fan out in parallel (e.g., implementing separate UI components or refactoring independent modules). [1] (https://www.youtube.com/watch?v=qiDalcMeBFk), [2] (https://www.youtube.com/watch?v=g9cCcyIN9Jk&t=25), [3] (https://www.mindstudio.ai/blog/how-to-build-multi-agent-workflow)
* Specify inputs and outputs: Document strict data contracts for what each agent receives and produces so context does not degrade. [1] (https://www.mindstudio.ai/blog/how-to-build-multi-agent-workflow)

Step 2: Choose a Coordination Pattern

* Sequential Pipeline: One agent finishes its job and hands off the artifact to the next. Best for predictable ordering (Research → Plan → Code → Test). [1] (https://www.mindstudio.ai/blog/how-to-build-multi-agent-workflow)
* Supervisor / Orchestrator Pattern: A central lead agent or supervisor analyzes user intent, breaks down subtasks, assigns them to specialized worker agents, and collects results. [1] (https://adk.dev/workflows/), [2] (https://kinde.com/learn/ai-for-software-engineering/ai-agents/multi-agent-workflows-for-complex-refactoring-orchestrating-ai-teams/), [3] (https://www.youtube.com/watch?v=ujd4Sjn3fww&vl=en-US&t=6)
* Collaborative Team Pattern (e.g., CrewAI / TDD Driver-Navigator): Agents take on explicit team roles (such as a Navigator defining tests/requirements and a Driver writing code) interacting through iterative handoffs and shared scratchpads. [1] (https://kinde.com/learn/ai-for-software-engineering/ai-agents/multi-agent-workflows-for-complex-refactoring-orchestrating-ai-teams/), [2] (https://www.youtube.com/watch?v=qiDalcMeBFk)

Step 3: Narrow Roles & Restrict Tool Access

* Single-responsibility agents: Do not ask one agent to write, review, and explain code simultaneously. Create specialized personas (e.g., a Code-Review-Only agent or a Database-Query agent). [1] (https://www.forbes.com/sites/bernardmarr/2026/08/24/how-to-design-multi-agent-workflows-that-actually-work/), [2] (https://www.scaler.com/topics/agentic-ai/building-multi-agent-workflow/)
* Isolate toolsets: Equip each agent exclusively with the tools it needs (e.g., a research agent gets web search, a coding agent gets file system access and a REPL) to reduce security risks and action space errors. [1] (https://www.youtube.com/watch?v=ujd4Sjn3fww&vl=en-US&t=6), [2] (https://www.scaler.com/topics/agentic-ai/building-multi-agent-workflow/)
* Model optimization: Use fast, lightweight models (like Claude Haiku) for routing and classification, and heavier reasoning models (like GPT-4.1 or Claude Sonnet) for core architecture and coding logic. [1] (https://learn.microsoft.com/en-us/azure/architecture/ai-ml/idea/multiple-agent-workflow-automation), [2] (https://www.scaler.com/topics/agentic-ai/building-multi-agent-workflow/)

Step 4: Enforce Governance Contracts & Verification Gates

* Write explicit rules files: Define system instructions, boundaries, stack definitions, and API patterns in project configuration files (such as CLAUDE.md, .agent files, or rule directories) to keep prompts under control.
* Design for failure and retries: Treat agents as distributed systems that will hit token limits, hallucinate, or fail half-way. Log intermediate states, enforce automated test/lint validation gates, and program human-in-the-loop (HITL) check-ins for high-risk operations. [1] (https://x.com/Av1dlive/article/2061386872321130782), [2] (https://www.youtube.com/watch?v=g9cCcyIN9Jk&t=25), [3] (https://github.blog/ai-and-ml/generative-ai/multi-agent-workflows-often-fail-heres-how-to-engineer-ones-that-dont/)
Learn how to structure multi-agent roles, task handoffs, and test-driven development loops:
If you'd like to dive deeper, let me know:
* What specific software engineering task you want to automate (e.g., bug fixing, large-scale refactoring, feature generation)
* What orchestration framework you are considering (e.g., Claude Code, CrewAI, AutoGen, Microsoft Agent Framework)
I can outline a tailored architecture and file structure for your project.
