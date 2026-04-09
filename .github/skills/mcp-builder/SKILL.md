---
name: mcp-builder
description: "Design and scaffold Model Context Protocol (MCP) servers and integrations. Use when users ask to create an MCP server, add MCP tools/resources/prompts, define schemas, or connect external systems through MCP."
---

# MCP Builder

## Goal

Create clear, maintainable MCP server implementations with safe tool contracts.

## Workflow

1. Capture requirements: tools, resources, prompts, auth model, and target runtime.
2. Design strict input/output schemas and error contracts.
3. Scaffold project structure and server entrypoints.
4. Implement handlers with validation, observability, and graceful errors.
5. Add local test and smoke-check paths.
6. Document setup, transport configuration, and security expectations.

## Design Rules

- Keep tools focused and composable.
- Validate all inbound params before execution.
- Return actionable errors with stable shapes.
- Avoid leaking secrets in logs or responses.

## Done Criteria

- Server starts and responds to at least one real tool/resource call.
- Schemas and usage are documented.
- Safety and auth assumptions are explicit.
