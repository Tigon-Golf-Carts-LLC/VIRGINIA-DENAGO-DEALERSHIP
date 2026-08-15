---
name: Code review base drift
description: The completion code review may compare against a base older than current main, falsely flagging code from other merged tasks.
---

# Code review base drift

## The rule
If the code review rejects and flags code you did not write (from other already-merged tasks), verify with `git diff main-repl/main --name-only` and `git log main-repl/main..HEAD --name-only`. If those show only your task's files, explain this clearly in `drift_reason` when calling `markTaskComplete` again.

**Why:** The review system sometimes compares against the repository state at task branch creation, not the current `main-repl/main`. Tasks merged between branch creation and completion appear in the diff from the reviewer's perspective even though `git diff main-repl/main` is clean.

## How to apply
- Run `git diff main-repl/main --name-only` to confirm your actual diff.
- Run `git log main-repl/main..HEAD --name-only` to enumerate only your commits' files.
- In `drift_reason`, cite these commands and their output to provide reviewers with evidence.
- Set `request_fresh_code_review: true` to force a new review after adding the explanation.
