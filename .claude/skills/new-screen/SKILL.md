---
name: new-screen
description: Scaffold a new screen following the established patterns in this SAP Web Client Extension project. Creates type, service layer method, hook, screen component, and wires up the route.
argument-hint: [ScreenName] [EntityName] e.g. "PurchaseOrderScreen PurchaseOrder"
allowed-tools: Read Write Edit Glob Grep Bash
---

# New Screen Scaffold

Scaffold a new screen for this SAP Web Client Extension project based on `$ARGUMENTS`.

Parse the arguments:
- First word = Screen component name (e.g. `PurchaseOrderScreen`)
- Second word = SAP B1 entity name (e.g. `PurchaseOrder`)

If arguments are missing or unclear, ask the user for:
1. Screen name (PascalCase, e.g. `PurchaseOrderScreen`)
2. SAP B1 entity name (e.g. `PurchaseOrder`)
3. SAP B1 Service Layer endpoint (e.g. `Orders`, `PurchaseOrders`, `BusinessPartners`)
4. Fields to display — name, type, and whether each is searchable
5. Whether the screen is a **list screen** (table with pagination + search) or a **form screen** (like SalesOrderScreen with header + lines)
6. If form screen: which fields need a CFL, and what entity each CFL looks up (BusinessPartner, ItemMaster, or a new one)
7. Whether any CFL needs multi-select

Then follow these steps in order:

## Step 1 — Add Type to `src/api/api.types.ts`

Read the current file first. Add the new type alongside existing ones:

```ts
export type EntityName = {
  Field1: string;
  Field2: number;
  // ... as specified by user
};
```

## Step 2 — Add Service Layer Method to `src/api/service-layer.client.ts`

Read the current file first. Add a paginated method following this exact pattern:

```ts
async getEntityNames(params: {
  page: number;
  search?: string;
}): Promise<{ value: EntityName[]; count: number }> {
  const skip = params.page * 10;
  let url = `b1s/v2/Endpoint?$select=Field1,Field2&$top=10&$skip=${skip}&$count=true`;
  if (params.search) {
    const escaped = params.search.replace(/'/g, "''");
    url += `&$filter=contains(Field1,'${escaped}') or contains(Field2,'${escaped}')`;
  }
  const response = await this.fetch<ODataList<EntityName>>(url, { method: "GET" });
  return { value: response.value, count: response["@odata.count"] ?? 0 };
}
```

Also add the new type to the import at the top of the file.

## Step 3 — Create Hook in `src/hooks/useEntityName.ts`

Follow this pattern exactly:

```ts
import { useQuery } from "@tanstack/react-query";
import { serviceLayerApi } from "../api";

export const useEntityName = (params: { page: number; search: string }) => {
  return useQuery({
    queryKey: ["getEntityName", params.page, params.search],
    queryFn: () => serviceLayerApi.getEntityNames(params),
  });
};
```

## Step 4 — Export from `src/hooks/index.ts`

Read the file, append:
```ts
export * from "./useEntityName";
```

## Step 5 — Create Screen in `src/screens/ScreenName.tsx`

### For a LIST screen (table with pagination + search bar):

Follow the DemoScreen pattern:
- `useState` for `page` and `search`
- Hook call with `{ page, search }`
- `Bar` with search `Input` on the left, Prev/page/Next on the right
- `BusyIndicator` while loading
- UI5 `Table` with `TableHeaderRow`, `TableRow`, `TableCell`
- `totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / 10))`

### For a FORM screen (header + optional lines table):

Follow the SalesOrderScreen pattern:
- Header section using `Form` + `FormItem` with `labelContent={<Label slot="label">...</Label>}`
- For CFL fields: `<Input readonly><Icon slot="icon" name="value-help" onClick={...} /></Input>`
- Separate `page`/`search` state per CFL
- Hook called per CFL entity
- `<ChooseFromList>` component at the bottom for each CFL
- For multi-select CFL: add `multiSelect` prop, `onSelect` receives `T[]`
- Lines table (if needed): array state, Add Line button, Remove button per row, calculated totals
- Doc Date defaults to today: `useState(() => new Date().toISOString().split("T")[0])`

## Step 6 — Export from `src/screens/index.ts`

Read the file, append:
```ts
export * from "./ScreenName";
```

## Step 7 — Add Route and Nav Link in `src/App.tsx`

Read the current file. Add:
- Import the new screen from `./screens`
- A `<Link to="/route-name">Screen Title</Link>` in the `<nav>`
- A `<Route path="/route-name" element={<ScreenName />} />` in `<Routes>`

Use kebab-case for the route path (e.g. `purchase-order`).

## Step 8 — Verify

After all files are written:
- Check all imports are correct
- Check the new type is imported in `service-layer.client.ts`
- Check `ODataList` is already imported (it should be)
- Remind the user to verify the Service Layer endpoint name and field names against their actual SAP B1 setup

## Key Conventions to Always Follow

- All UI uses `@ui5/webcomponents-react` components — never plain HTML inputs/buttons except for layout divs
- All icons are globally available via `AllIcons.js` in `main.tsx` — no need to import individual icons
- `ChooseFromList` is always fully controlled — parent owns `page` and `search` state
- Service Layer uses OData: `$top=10`, `$skip`, `$count=true`, `contains()` for search
- Escape single quotes in OData filter values: `.replace(/'/g, "''")`
- TanStack Query `queryKey` must include all params that affect the result: `[key, page, search]`
- Form labels use `labelContent={<Label slot="label">...</Label>}` on `FormItem`
- Value-help icon: `<Icon slot="icon" name="value-help" style={{ cursor: "pointer" }} onClick={...} />` inside `<Input>`
