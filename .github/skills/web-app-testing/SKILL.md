---
name: web-app-testing
description: "Plan and implement practical testing for web apps. Use when users ask for unit tests, integration tests, end-to-end tests, test plans, flaky test fixes, or CI test coverage for front-end/back-end web projects."
---

# Web-App Testing

## Goal

Build a reliable test pyramid for web apps with fast feedback and confidence in releases.

## Workflow

1. Map risk areas: auth, forms, navigation, API boundaries, payments, and permissions.
2. Choose testing layers:
   - Unit tests for pure logic and components.
   - Integration tests for module interactions and API boundaries.
   - End-to-end tests for critical user paths.
3. Add deterministic fixtures and stable selectors.
4. Eliminate flakiness: explicit waits on state, isolated data, retries only when justified.
5. Integrate tests into CI with clear failure output.

## Coverage Priorities

- High-value user journeys first.
- Error handling and empty/loading states.
- Accessibility assertions for key UI flows.

## Done Criteria

- Critical paths covered by automated tests.
- Tests are reliable locally and in CI.
- Clear instructions for running tests are documented.
