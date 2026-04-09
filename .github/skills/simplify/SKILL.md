---
name: simplify
description: "Refactor code, docs, or workflows to be simpler without changing behavior. Use when users ask to simplify, clean up, reduce complexity, remove duplication, or improve readability."
---

# Simplify

## Goal

Reduce cognitive load while preserving behavior and public interfaces unless asked otherwise.

## Workflow

1. Identify complexity hotspots: nested conditionals, long functions, repeated logic, unclear naming.
2. Propose the smallest safe simplification path.
3. Apply targeted refactors: extract helpers, flatten control flow, remove dead code, and improve naming.
4. Keep external behavior unchanged.
5. Validate with existing tests, scripts, or focused checks.

## Rules

- Prefer fewer concepts over clever abstractions.
- Avoid broad rewrites when small changes solve the problem.
- Preserve public APIs unless explicitly instructed to change them.
- Add short comments only where intent is not obvious.

## Done Criteria

- Fewer moving parts and easier-to-read code.
- No functional regressions from simplification.
- Validation run and results reported.
