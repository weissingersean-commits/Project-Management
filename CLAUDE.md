# Marine Alarm Systems — Project Management System

## What This Is
A project management web application for a marine alarm systems business (designs, builds, installs, and tests vessel machinery alarm systems). Built as a growing replacement for Odoo, starting with job tracking and expanding toward CRM, quoting, invoicing, and purchasing.

## Tech Stack
- **Output**: Single HTML file (`index.html`) for GitHub Pages deployment — open in any browser, works offline
- **Source**: Modular `/src/` directory; PowerShell `build.ps1` concatenates into `index.html`
- **Framework**: None — vanilla JS with `h()` DOM builder, CSS variables, no npm
- **Font**: Google Fonts — Outfit
- **Storage**: `localStorage` (key: `mas-pm-v1`); migrates automatically from old `mas-jm-v6` key
- **Data backup**: JSON export/import via Settings page

## Build
```powershell
.\build.ps1       # generates index.html
```
Push `index.html` to GitHub for GitHub Pages deployment.

## Source File Order (concatenated by build.ps1)
```
src/constants.js        PHASES, PHASE_CHECKLISTS, PART_STATUSES, DOC_STATUSES, DOC_TYPES, VESSEL_TYPES, UC
src/utils.js            uid(), dL(), urg(), urgLbl(), h()
src/state.js            S object, loadState(), saveState(), migrate, set(), persist(), updJob(), delJob()
src/views/header.js     renderHeader() — dark header with stats + nav tabs
src/views/modal-job.js  renderModal(), mkF(), mkSel()
src/views/tab-tasks.js  renderTasks(job)
src/views/tab-parts.js  renderParts(job)
src/views/tab-docs.js   renderDocs(job)
src/views/view-jobs.js  renderCard(job), renderJobsView(app)
src/views/view-materials.js  renderMats()
src/views/dashboard.js  renderDashboard()
src/views/settings.js   renderSettings(), exportData(), importData()
src/render.js           render() dispatcher + initial render() call
```

## Architecture
- **State**: Single `S` object with persisted data (`jobs`, `contacts`, `settings`) and UI state (not persisted)
- **Re-render**: Every state change calls `render()` which rebuilds the full DOM
- **Routing**: `S.view` drives the view (`dashboard` | `jobs` | `materials` | `settings`)
- **Persistence**: `persist()` calls `saveState()` then `render()`
- **DOM builder**: `h(tag, attrs, ...children)` — use this everywhere, never raw `innerHTML`

## State Shape
```js
S = {
  // persisted
  jobs: [],       // array of Job objects
  contacts: [],   // array of Contact objects (Phase 2)
  settings: {
    company: { name, address, phone, email },
    numbering: { quotePrefix, quoteNext, poPrefix, poNext, invPrefix, invNext },
    tax: { rate, label },
    currency
  },
  // ui state (not persisted)
  view: "dashboard",   // dashboard | jobs | materials | settings
  editing: null,       // job being edited in modal (null = modal closed)
  filter: "all",       // phase filter for jobs list
  search: "",          // search string
  expanded: {},        // { [jobId]: bool } card expand state
  tabs: {},            // { [jobId]: "tasks"|"parts"|"docs" }
  addingPart: {},      // { [jobId]: bool }
  editingPart: {},     // { [jobId]: partIndex }
  partForms: {},       // { [jobId]: partFormData }
  addingDoc: {},       // { [jobId]: bool }
  docForms: {}         // { [jobId]: docFormData }
}
```

## Data Models

### Job
```js
{
  id, name, vesselName, vesselType, client, imo,
  scope, poNumber, alarmPoints, value, phase,
  startDate, due, dockDate, seaTrialDate, notes,
  tasks: [], parts: [], docs: [], createdAt
  // Odoo: project.project
}
```

### Phases (in order)
Design → Procurement → Build/Assembly → Install → Test/Commission → Complete

### Task `{ id, text, done, phase }` — Odoo: project.task
### Part  `{ id, name, partNumber, supplier, qty, status, orderDate, etaDate, tracking, notes, phase }` — Odoo: stock.move
### Doc   `{ id, name, type, status, dueDate, notes }`

### Contact (Phase 2)
```js
{
  id, type: "client"|"supplier"|"surveyor"|"class_society",
  company, firstName, lastName, email, phone,
  address: { line1, city, state, zip, country },
  notes, createdAt, updatedAt
  // Odoo: res.partner
}
```

## Views
- **Dashboard**: stat cards (active/overdue/hot/parts), upcoming 14-day deadlines, phase distribution bar, parts alerts, recent jobs
- **Jobs**: search + phase filter, urgency-sorted expandable cards, tasks/materials/docs tabs
- **Materials**: cross-job procurement overview grouped by status, late items alert
- **Settings**: company info, JSON export/import, danger zone reset

## Roadmap
- **Phase 2**: Contacts / CRM module (`view-contacts.js`)
- **Phase 3**: Quotes, Purchase Orders, Invoices (financial modules)
- **Phase 4**: Odoo API bridge (`odoo-bridge.js`) — maps our models to `res.partner`, `sale.order`, `account.move`, `purchase.order`

## Key Patterns
- All data changes: `updJob(id, patch)` or modify `S` then call `persist()`
- New entities: push to `S.jobs`/`S.contacts`/etc. then `persist()`
- Navigation: `set({ view: "jobs" })` — triggers re-render
- Print/PDF: `@media print` CSS on financial views, `window.print()` — no library needed
- Auto-numbering: increment `S.settings.numbering.quoteNext` etc. when creating financial documents

## Vessel Types
Tugboat, Towboat, Push Boat, Barge, Crew Boat, Supply Vessel (OSV), Ferry, Tanker, Cargo/Freighter, Dredge, Workboat, Yacht, Military, Other

## Design
- Dark header (#111), warm neutral background (#EDECEA), white cards
- Outfit font, CSS variables for all colors
- Urgency: overdue (red, pulsing), hot ≤3d (amber), soon ≤7d (blue), ok (grey), done (green)
- Mobile-friendly via flexbox/grid; `@media(max-width:600px)` collapses 2-col grids
