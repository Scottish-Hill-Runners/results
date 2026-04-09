---
name: skill-creator
description: "Create or improve Copilot Skill definitions. Use when users ask to build a new SKILL.md, refine skill descriptions, improve skill discoverability, or package reusable workflows."
---

# Skill Creator

## Goal

Create high-signal, discoverable, and reusable skills that are invoked at the right time.

## Workflow

1. Define scope: what the skill does and what it does not do.
2. Write a strong frontmatter description with trigger phrases:
   - Include 'Use when users ask for ...' wording.
   - Include likely keywords and synonyms.
3. Provide a short workflow with concrete steps.
4. Add done criteria so outputs are verifiable.
5. Keep the skill concise and action-oriented.

## Quality Checklist

- `name` matches the folder name.
- `description` is specific and quoted if it contains colons.
- Guidance is practical, not generic.
- No contradictory rules.

## Done Criteria

- Skill can be discovered from realistic user prompts.
- Skill instructions are clear enough to execute without extra interpretation.
