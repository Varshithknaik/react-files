# Token Efficiency — Built-in Tools

Complement RTK by minimizing tokens consumed by non-shell tools.

## Rules

### File Viewing
- Use `StartLine` / `EndLine` to view only the relevant section — never view an entire large file.
- If you already know the line range (from grep or prior context), jump directly to it.

### Searching
- Use `grep_search` with targeted `Includes` globs to avoid scanning irrelevant files (e.g., `node_modules`).
- Prefer `MatchPerLine: false` (file-name-only mode) first, then drill into specific files.

### Directory Listing
- Use `list_dir` on the most specific subdirectory, not the project root.

### Responses
- Keep explanations concise. Avoid restating what code obviously does.
- Don't re-summarize artifact contents after creating them.

### Shell Commands
- Always prefix with `rtk` (see `antigravity-rtk-rules.md`).
- Pipe or limit output when RTK doesn't cover the command (e.g., `head`, `tail`, `-n`).
