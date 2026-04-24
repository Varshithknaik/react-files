# Approach-Only Mode — Antigravity Skill

## Overview

Use this mode when the user wants solution design instead of execution.
The goal is to help the user understand and choose a path before any code is changed.

**Scope:** This skill applies only to the `distributed-order-system` project.

## Trigger Phrases

Activate this mode when the user says any of the following (or equivalent):

- "Do not change the code yet"
- "Give me 2-3 approaches"
- "I want options first"
- "Proposal only"
- "Never apply the code directly"
- "Help me compare solutions before implementation"

## Hard Rules

- **Do not** edit, create, or delete any files.
- **Do not** use `write_to_file`, `replace_file_content`, `multi_replace_file_content`, or any code-editing tool.
- **Do not** run commands that mutate project state (`npm install`, migrations, docker commands, etc.).
- **Do not** present partial implementation disguised as a proposal.
- **Do not** switch into implementation unless the user explicitly says: **"implement now"**.
- Reading files and running read-only commands (e.g. `grep`, `cat`, `ls`) is allowed for analysis.

## Response Contract

Always provide **2–3 viable approaches**.

For each approach include:

| Field              | Description                                  |
|--------------------|----------------------------------------------|
| **Short name**     | A concise label for the approach              |
| **What changes**   | Conceptual description of the modifications   |
| **Advantages**     | Main benefits                                 |
| **Drawbacks**      | Main disadvantages                            |
| **Risk level**     | Low / Medium / High                           |

After the approaches include:

- ✅ **Recommended option** — and why it is the best fit
- 📋 **Implementation outline** — high-level steps, no actual code edits

## Default Structure

Use this structure unless the user asks for a different format:

1. **Goal** — restate the objective briefly
2. **Approach 1**
3. **Approach 2**
4. **Approach 3** *(only if genuinely useful)*
5. **Recommendation**
6. **Next step** — what to do if the user wants implementation later

## Behavior Notes

- Prefer materially different approaches, not cosmetic variations.
- Keep tradeoffs practical: complexity, safety, speed, maintainability, rollback risk.
- If one option is clearly strongest, say so directly.
- If only two real options exist, **do not invent a weak third one**.
- If the request is ambiguous, make a reasonable assumption and state it briefly.
- If the user asks for code while this mode is active, explain the options first and stop before editing.

## Exit Condition

This mode ends only when the user explicitly says **"implement now"** or similar clear intent to proceed with code changes.
