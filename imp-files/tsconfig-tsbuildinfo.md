# The Root cause

`tsconfig.tsbuildinfo` files store the metadata about the previous Typescript build for incremental compilation. When `tsc -b`,
Typescript uses these files to determine which files changes and only recompile whats necessary.

## why it fails in docker

1. Stale build metadata: when you caopy tsconfig.tsbuildinfo filesinto Docker without copying the actual compiled out ( `.dist/` , `build/` , etc), typescript's incremental compiler has outdated information about

- which files were previously compliled
- what packages have been build
- Module resolution state from the host machine

2. Path resolution issues: The cached metadata might reference paths or states yahat don;t exisits in the Docker filesystem, causing module resolutionto fails for path aliases like `@core/events`,`@core/loggers`, etc
3. Fresh docker environment: Docker's isolated environment differs from your local machine, so the incremental metadata becomes unreliable

Better solutions

Instead of ignoring tsconfig.tsbuildinfo lets use proper `.dockerignore` approach:

```bash
# .dockerignore
node_modules
.git
.env
.env.local
.next
dist
build
.tsbuildinfo
**/*.tsbuildinfo
**/node_modules
.docker
.vscode
.idea
```

Or force clean build in Docker by removeing build caches

```bash
FROM node:22-alpine

WORKDIR /app

====

====

RUN npm ci


COPY .  .
# Clean aly previous build artifacts before copying sources

RUN find . -name "*.tsbuildinfo" -delete 2>/dev/null || true
RUN find . -name "dist" -type d -exec rm -rf {} + 2>dev/null || true
```

Performace Trade-off

- Local `tsc -b` with `.tsbuildinfo` is fast ( only recompiles changed files)
- Docker: First build is slower (full rebuild), but subsequesnt builds are cached at Docker layer level
