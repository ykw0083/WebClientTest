# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Vite dev server
pnpm build        # TypeScript compile + Vite build
pnpm build:ext    # Package as SAP Web Client Extension (runs scripts/build-ext.sh)
pnpm lint         # Run ESLint
pnpm preview      # Preview production build
```

`build:ext` accepts optional env vars: `EXT_ID` (extension identifier) and `EXT_SUBTITLE` (tile subtitle).

## Environment Variables

Create a `.env` file with:

```
VITE_SL_BASE_URL=   # SAP B1 Service Layer base URL
VITE_SL_COMPANY=    # SAP company database name
VITE_SL_USER=       # Service Layer username
VITE_SL_PASSWORD=   # Service Layer password
```

## Architecture

This is a **SAP Web Client Extension** — a React SPA that runs embedded inside SAP Web Client. It communicates with two backends:

1. **SAP B1 Service Layer** (`ServiceLayerClient`) — authenticates with SAP Business One, fetches API credentials from `FTAPICONFIG` UDT, and retrieves current user info.
2. **External SAP API** (`SapApiClient`) — singleton Axios client using bearer token auth (stored in `localStorage`). Handles 401s by reauthenticating automatically via interceptors.

### Initialization flow

`useAppStartup` → logs into Service Layer → fetches credentials from `FTAPICONFIG` → initializes `SapApiClient` singleton → fetches current user → returns user data to `UserContext`.

`App.tsx` shows `<Loader>` during startup, then renders the main screen once user data is available.

### State management

- **TanStack Query** for all server state (configured with no retries on 401, no auto-refetch on window focus). `QueryCache` shows error modals on query failures.
- **`UserContext`** propagates the logged-in user to the component tree.

### UI

All UI uses **SAP UI5 Web Components** (`@ui5/webcomponents-react` + Fiori components). `main.tsx` wraps the app in `ThemeProvider`. `SelectTheme` (dev-only) lets you switch UI5 themes at runtime.

### Extension packaging

`scripts/build-ext.sh` runs `pnpm build`, then zips the `dist/` output alongside `public/WebClientExtension.json` (the extension manifest defining the tile appearance) into a deployable archive.

### Key files

- [src/main.tsx](src/main.tsx) — React bootstrap, QueryClient config, ThemeProvider
- [src/App.tsx](src/App.tsx) — Root component, wires UserProvider and startup logic
- [src/api/api.client.ts](src/api/api.client.ts) — `SapApiClient` singleton with token management
- [src/api/service-layer.client.ts](src/api/service-layer.client.ts) — `ServiceLayerClient` for SAP B1
- [src/hooks/useAppStartup.ts](src/hooks/useAppStartup.ts) — Initialization sequence
- [src/contexts/UserContext.tsx](src/contexts/UserContext.tsx) — User context provider
- [public/WebClientExtension.json](public/WebClientExtension.json) — Extension manifest
