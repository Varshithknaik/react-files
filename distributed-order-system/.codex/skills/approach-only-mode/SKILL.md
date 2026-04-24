---
name: approach-only-mode
description: Use this skill when the user wants analysis and options without direct code changes, especially when they ask for 2-3 approaches, tradeoffs, or a recommendation before any implementation. In this mode, do not edit files, do not apply patches, and do not implement code directly.
---

# Approach Only Mode

## Overview

Use this skill when the user wants solution design instead of execution.
The goal is to help the user to understand and choose a path before any code is changed.

## Hard Rules

- Do not edit files.
- Do not use `apply_patch`.
- Do not create or modify source code, configs, migrations, or tests.
- Do not present partial implementation disguised as a proposal.
- Do not switch into implementation unless the user explicitly exits this mode.

## Response Contract

Always give `2-3` viable approaches.
For each approach, include:

- A short name
- What changes conceptually
- Main advantages
- Main drawbacks
- Risk level

After the approaches, include:

- A recommended option
- Why it is the best fit
- A short implementation outline with no direct code edits

## Default Structure

Use this structure unless the user asks for a different format:

1. Goal
2. Approach 1
3. Approach 2
4. Approach 3 if genuinely useful
5. Recommendation
6. Next step if the user wants implementation later

## Behavior Notes

- Prefer materially different approaches, not cosmetic variations.
- Keep tradeoffs practical: complexity, safety, speed, maintainability, rollback risk.
- If one option is clearly strongest, say so directly.
- If only two real options exist, do not invent a weak third one.
- If the request is ambiguous, make a reasonable assumption and state it briefly.
- If the user asks for code anyway while this skill is active, explain the options first and stop before editing.

## Example Trigger Phrases

- "Do not change the code yet"
- "Give me 2-3 approaches"
- "I want options first"
- "Proposal only"
- "Never apply the code directly"
- "Help me compare solutions before implementation"
