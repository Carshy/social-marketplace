
# ADR — Architectural Decision Record

This document records the main technical decisions made during implementation.

---

## Decision 1 — Use EJS for the page shell and Lit for interactive components

### Context

The assessment explicitly requires:

- EJS for server-side rendering of the page shell
- Lit for client-side interactive components
- server-determined components

### Options considered

1. Build the whole app with EJS only
2. Build the whole app as a pure client-side Lit SPA
3. Use EJS for shell rendering and Lit for interactive islands

### Decision

Use **EJS for the page shell** and **Lit for interactive components**.

### Why this was chosen

This matches the brief directly and supports a hybrid rendering model where the server decides which components belong to each page.

### Tradeoffs

#### Pros
- aligned closely with the assessment requirements
- page-level structure remains clear and easy to reason about
- interactive parts stay reusable and isolated
- good separation between shell rendering and client behavior

#### Cons
- slightly more setup complexity than using one rendering approach only
- requires a prop handoff pattern between EJS and Lit
- direct browser module loading needed additional setup

---

## Decision 2 — Implement server-determined components through a component plan

### Context

The brief says the server should decide which Lit components to render.

### Options considered

1. Hardcode Lit components directly inside each page template
2. Let the frontend decide component composition after page load
3. Build a server-side component planning layer per route

### Decision

Use a **server-side component plan** that returns the Lit components and props for each route.

### Why this was chosen

This approach makes the requirement explicit and keeps the route-level architecture clean:

- home page gets hero, search, and item grid
- item detail page gets item detail, offer panel, chat thread, and checkout panel
- seller dashboard gets seller summary and seller items

### Tradeoffs

#### Pros
- directly satisfies the architecture requirement
- keeps page composition predictable
- easy to explain during review
- easy to scale as more components are added

#### Cons
- adds one more abstraction layer
- requires a bootstrap script to hydrate planned components
- some debugging becomes split between server planning and component rendering

---

## Decision 3 — Use HTTP polling for chat updates instead of websocket infrastructure

### Context

The brief mentions direct messaging, but also notes that the provided backend supports **HTTP polling**.

### Options considered

1. Build full websocket support from scratch
2. Fake chat with manual refresh only
3. Build polling-based live updates using the provided backend capability

### Decision

Use **HTTP polling** for live message updates.

### Why this was chosen

The provided backend already supports polling. Using it allowed the app to remain aligned with the starter backend and complete the real-time-like messaging flow without introducing unnecessary infrastructure.

### Tradeoffs

#### Pros
- consistent with the provided starter backend
- simpler to implement and test
- reliable for an assessment-sized project
- good enough to simulate live chat behavior

#### Cons
- less efficient than true websocket-based updates
- introduces polling intervals instead of instant push
- not ideal for high-scale production chat systems

---

## Decision 4 — Keep file-based JSON persistence but wrap behavior cleanly in the application flow

### Context

The starter backend uses JSON files as storage instead of a database.

### Options considered

1. Replace the backend with a database-backed implementation
2. Use the starter backend as-is with minimal organization
3. Keep the JSON-backed backend but build cleaner route and UI contracts around it

### Decision

Retain the JSON-backed backend for the assessment, while improving route behavior and integrating it cleanly with the frontend.

### Why this was chosen

This kept the project aligned with the provided starter code while allowing the focus to remain on architecture, UI flow, component reuse, negotiation logic, and submission quality.

### Tradeoffs

#### Pros
- fast to iterate with
- easy to inspect during development
- aligned with the provided starter
- avoids unnecessary infrastructure overhead for the assessment

#### Cons
- not suitable for multi-user production scale
- file storage is fragile compared to a database
- limited concurrency guarantees

---

## Decision 5 — Use frontend API proxying through the web server

### Context

The frontend runs on one port and the backend runs on another.

### Options considered

1. Hardcode backend URLs in every Lit component
2. Use browser-side environment logic everywhere
3. Proxy `/api/*` through the frontend server

### Decision

Proxy `/api/*` requests through the frontend server.

### Why this was chosen

This keeps component code cleaner and makes the frontend behave as though it is talking to a single origin.

### Tradeoffs

#### Pros
- simpler frontend fetch code
- easier deployment transition later
- avoids repeating backend port URLs across components

#### Cons
- adds one extra layer in request flow
- proxy issues can complicate debugging if not logged clearly