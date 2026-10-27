# Fast-Test Homework — Angular + NestJS edition

> Adapted from the original Reaktivate assignment for React + MobX:
> <https://docs.google.com/document/d/1_P0OMeYnKpbyn46N-wiB3JURMiAwbt4Ap9-rgapc1-g/edit>
>
> Only the technology is changed: React / JSX → Angular components and templates,
> MobX / mobx-react → Angular Signals, the external `tdd.demo.reaktivate.com` API → the local
> NestJS API in `server/`, CodeSandbox → this repository. The requirements, their numbering and
> the split into Part 1 (main task) and Part 2 (power-up task) are kept as in the original.

The assignment is about the fast-test approach (TDD, BDD or whatever name you prefer).
Coding guidelines are in the [Appendix](#appendix-code-style). The UI look is not evaluated.

## Part 1 — main task

Refactor the "simple" Angular app in `client/` toward the fast-test approach. The focus is a
"flat presentation": the UI is completely separated from the logic.

### Intro

The page shows a list of books and a button to add a book. The data comes from the synthetic
seed of the local API.

The books API uses the URL format:

```
http://localhost:3000/v1/books/[user]
```

where `user` is your identifier (nickname). The starter uses `demo`
(`client/src/app/shared/config.ts`).

API reference: [README → API](README.md#api).

### The task

Refactor the existing starter in this repository (`client/`). Work in your own branch or fork.
However you share the result, include clear instructions on how to run it.

### Refactoring requirements

The basic requirement: the logic is separated from rendering, so that the logic can be tested on
its own. "Logic" means business logic and most of the UX.

Acceptance criteria:

1. Zero logic and calculations in Views (component templates and component classes). Use the
   MVP (a.k.a. MVVM) pattern: the component hands all the logic over to a Controller. Separating
   the View and being able to test the logic is what matters most; the rest is less important.
   Any TypeScript code in a View other than connecting the Controller is considered incorrect.
2. Hold state in Angular Signals (`signal`, `computed`) and rely on Angular's signal-based
   template reactivity. If you don't know Signals, come up with your own MVVM implementation.
3. Implement book creation.
4. Cover the logic with tests.

## Part 2 — power-up task

1. The customer asks for a switch in the UI between "All books" and "Private books" (see the
   [API reference](README.md#api)). The two options are mutually exclusive (buttons, radio or
   tabs — not checkboxes).
2. One more sticky, application-wide header is requested. It shows a counter of private books,
   like "Your books: 30".

## Refactoring target: architecture pattern

Naming follows this scheme (VM = "view model", PM = "programmer's model"):

```
            actions                     PM                      DTO
  View  ───────────────▶  Controller  ──────▶  Repository  ──────▶  services /
        ◀───────────────              ◀──────              ◀──────  gateways
          VM (signals)                  PM                      DTO
```

This is more or less the MVP (model-view-presenter) pattern. The Repository layer is optional:
if you don't see a use for it, it's fine to call the service directly.

## Appendix: code style

The guidelines assume Angular Signals are used for reactivity. With another state-management
approach some of the points may not apply.

1. The file structure separates reusable components from feature-specific components.
2. Every component that has logic (any branching is logic) or needs access to services/gateways
   has its own controller for that purpose.
3. If needed, use a global controller or store that only holds data shared across the whole
   application, e.g. `userStore`, `uiStore`.
4. A View only uses the state exposed by controllers/stores (signals). All the logic lives in
   Controllers; a View is only for rendering.
5. Tests on logic are a must. Snapshot and property-based testing are optional.
6. Views are thin: a component class only connects (injects) its controller — no own state and
   no methods with logic.
7. For local (per-component) controllers, take care of lifecycle and resource disposal
   (`DestroyRef` / `ngOnDestroy`).
8. Make sure reactivity doesn't cause unnecessary re-renders or recomputations: derive values with
   `computed` instead of copying state around, avoid redundant intermediate signal writes, use
   `untracked` where a read must not create a dependency (this replaces the MobX `runInAction`
   advice; see the Signals guide on angular.dev).
9. No `console.log`; use `console.debug` if something must stay for debugging.
