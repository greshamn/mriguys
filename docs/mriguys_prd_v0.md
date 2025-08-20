# MRIGuys Platform — Product Requirements Document (PRD)

**Version:** v0.2 (One-Week Visual Prototype)  
**Owner:** Product (you)  
**Stakeholders:** Engineering, Design, BizDev, Legal/Compliance, Ops  
**Target Markets:** US (PI/PIP emphasis), later UK & EU  

---

## 1) Vision & Goals
**Vision:** A PI‑friendly diagnostic imaging marketplace and workflow platform that matches Scan.com’s frictionless booking and developer surface, then goes beyond with lien/funding automation and end‑to‑end case packets for attorneys and payors.

**Top Goals for the One‑Week Visual Prototype:**
1. Ship **role‑specific dashboards** (Patient, Referrer, Center, Attorney, Funder, Ops, Admin) with mocked KPIs, charts, and actions.
2. Implement **three golden flows** with simulations: (a) Referral → Booking → Report; (b) Attorney Packet; (c) Funder Approval.
3. Apply **TweakCN** theme presets (light/dark + "MRI Neon" demo theme) across all screens; include a **Theme Switcher**.
4. Include **AI Insight Drawer** (mocked suggestions) on each dashboard using simple heuristics over seed JSON.
5. Deliver a **clickable, visually polished React demo** runnable with `pnpm dev`—no real backend.

**Non‑Goals (This Week):** HL7/FHIR, real PACS/DICOM streaming, real auth/payments/EDI, SOC2/HIPAA readiness, production API; all data is mock/simulated.

---

## 2) Competitive Context & Differentiation
**Parity:** D2C booking; referrer portal; imaging center scheduling; downloadable reports; developer API with referral + availability + booking + report endpoints.  
**Differentiation:** Built‑in lien/funding engine, attorney/funder case workspaces, automated “records + bills + images” packet, SLA scorecards, and show‑rate tooling (reminders, rideshare voucher hooks, pre‑screening).

---

## 3) Personas & Roles
- **Patient** (consumer): finds center, answers safety questions, books, views results.  
- **Referrer** (PCP/Chiro/Ortho/UC): creates referral, tracks status, reviews reports.  
- **Attorney**: monitors client care, builds case packet, manages lien & settlement.  
- **Funder**: evaluates cases, approves funding, tracks exposure and repayments.  
- **Imaging Center Staff**: manages slots, receives referrals, uploads reports, issues bills.  
- **Radiologist**: attaches reports (PDF), notes addenda.  
- **Ops (Internal)**: triage queues, exceptions (no‑shows, missing docs), quality.  
- **Admin**: master data, roles, compliance, audit.

---

## 4) Scope & Week Plan (Visual Demo)

**Approach:** Presentation‑grade demo using React + Tailwind v4 + shadcn/ui + TweakCN + Nivo + Framer Motion + MSW. All back‑end interactions are simulated.

### Day 1 – Scaffold & Theme
- Vite app; Tailwind v4; shadcn/ui install; routing & role guard stubs.
- Import TweakCN variables; build Theme Switcher (light/dark + "MRI Neon").
- Create layout shell (Left Sidebar + Top Bar + Right AI Drawer + Content + Sticky Action Bar).

### Day 2 – Core Data & MSW
- Seed JSON: centers, slots, referrals, appointments, reports, bills, liens, settlements.
- MSW handlers for `/centers`, `/slots`, `/referrals`, `/appointments`, `/reports`, `/liens`.
- Zustand store + selectors; demo webhooks simulator panel.

### Day 3 – Role Dashboards I
- Referrer, Imaging Center, Patient dashboards with KPIs, charts, and CTA cards.
- Implement Referral Wizard + Slot Picker (simulated availability).

### Day 4 – Role Dashboards II
- Attorney, Funder, Ops dashboards; Case Packet preview; Lien Ledger math (simplified).
- Charts wired to tokens (Nivo) with dark‑mode aware palette.

### Day 5 – Polish & Demo Script
- Framer micro‑interactions; a11y pass; empty states & skeleton loaders; screenshots export.
- Record 3 scripted paths; README + one‑click seed reset.

**Out of Scope This Week:** Auth, emailing/SMS, file uploads, payments, admin CRUD beyond theme toggles.

---


## 4a) Role‑Specific Dashboards (One‑Week Prototype)

> Each dashboard uses a consistent shell: **Left Sidebar** (role menu), **Top Bar** (search + notifications + theme switch + Command‑K), **Right AI Insight Drawer** (toggleable), **Content Grid** (cards/charts/tables), and a **Sticky Action Bar** for primary CTAs.

**Patient Dashboard**
- **Hero Card:** Next appointment (date, center, prep checklist, reschedule button).
- **Timeline:** Referral → Booking → Scan → Report Ready (badges).
- **AI Tip:** “Arrive 15 min early; metal object checklist.”
- **CTA:** "View Results" (opens mock PDF) and "Message Center" (disabled tooltip).

**Referrer Dashboard**
- **KPIs:** New results, upcoming scans, avg TAT, no‑show rate.
- **Chart:** Line (TAT 7/30 days), bar (modalities).
- **Worklist Table:** patients with status & center.
- **AI Suggestions:** Best center for new referral (distance + recent TAT).
- **CTA:** "New Referral" (opens Wizard).

**Imaging Center Dashboard**
- **KPIs:** Today’s scans, utilization %, no‑shows, avg report lag.
- **Calendar Heatmap:** slot fill (12 weeks).
- **Worklist:** check‑in/complete/upload report actions.
- **AI Suggestions:** "Open 2 extra MRI slots Fri 2–4pm to hit 85% util".

**Attorney Dashboard**
- **KPIs:** Active clients, attendance %, pending packets, lien exposure.
- **Table:** Cases with status and next action.
- **Packet Preview:** one‑click compile.
- **AI Suggestions:** Nudge clients at risk of no‑show; flag missing doc.

**Funder Dashboard**
- **KPIs:** Exposure, approvals pending, avg decision time, expected ROI (mock).
- **Chart:** Area (exposure over time) + table of cases.
- **AI Suggestions:** Top 3 cases to approve today.

**Ops Dashboard**
- **Queues:** Missing docs, no‑shows, aged referrals.
- **Scorecards:** Center SLA cards with badges.
- **AI Suggestions:** Reassign to nearby center for tomorrow availability.

**Admin Dashboard**
- **Theme Manager:** choose preset (TweakCN import) + dark mode.
- **Users/Roles:** static list, no CRUD this week.

---

## 5) Core Modules & Requirements
### A) Patient D2C Booking
**User Stories**  
- As a Patient, I can search centers by modality/body part, distance, and earliest availability.  
- As a Patient, I can answer safety questions and pick a slot.  
- As a Patient, I receive booking confirmation and reminders.  
- As a Patient, I can view my appointment details and later access my report (mock).  

**Acceptance Criteria**  
- Search returns centers with badges (modality, distance, rating, TAT).  
- SlotPicker enforces safety Q completion.  
- Booking writes an **Appointment** record and a timeline event.  
- Confirmation screen + email/SMS placeholders.  

### B) Referrer Portal (PCP/Chiro/Ortho/UC)
**Stories**  
- Create referral (patient + modality + clinical notes + attachments).  
- Prefer a center or “best next slot” routing.  
- Track status; download report; send note to center.  

**Acceptance**  
- Referral Wizard validates mandatory fields & contraindications.  
- Status timeline: Referred → Scheduled → Scanned → Report Ready.  

### C) Imaging Center Console
**Stories**  
- Manage weekly template and one‑off slots; view worklist; mark completed; upload report PDF; generate bill.  
- View SLA dashboard (no‑shows, TAT).  

**Acceptance**  
- Slot CRUD; worklist filters; report upload updates **ScanReport** and triggers notification.

### D) Attorney Workspace
**Stories**  
- See cases by client; ensure appointments kept; download **Case Packet** (records + bills + images placeholder + radiology report).  
- Manage lien ledger; propose settlement disbursement splits.  

**Acceptance**  
- Packet preview compiles latest docs; Ledger supports interest calc & adjustments; export PDF.

### E) Funder Desk
**Stories**  
- Review queue with required docs; approve funding; track exposure; schedule disbursement to providers; reconcile at settlement.  

**Acceptance**  
- Funding states: Intake → Review → Approved → Disbursed → Settled; exposure chart; export CSV.

### F) Ops Dashboard (Internal)
**Stories**  
- Triage queues: missing docs, no‑shows, aged referrals, unsigned liens.  
- Center scorecards; manual reassignment to nearby centers.  

**Acceptance**  
- Each queue has count, SLA indicator, and bulk actions; audit trail entries are immutable.

### G) Billing & Records
**Stories**  
- Create bill with CPT/ICD codes; attach to referral; show status (draft/sent/settled).  
- Generate “insurer packet” (mock).  

**Acceptance**  
- Bill total = sum(line items); packet includes bill + report + authorization letter placeholders.

### H) Master Data & Admin
- Entities: States (PIP flag), Centers, Locations, Modalities, Radiologists, Providers, Attorneys, Funders, Case Managers, Questionnaires.  
- Role management; audit log; theming presets management.

### I) Public API (Mock for Prototype)
- **Auth:** API key (mock).  
- **Endpoints:** `POST /referrals`, `GET /centers`, `GET /centers/:id/slots`, `POST /appointments`, `GET /referrals/:id`, `GET /reports/:id`, `POST /webhooks/test`.  
- **Docs:** OpenAPI YAML served at `/api-docs`.

---

## 6) UX System: Navigation & Layouts (This Week)

**Global Shell**
- **Left Sidebar:** compact icons + labels; collapsible; sections change by role.
- **Top Bar:** logo, global search input, notifications bell, Theme Switch, user menu; Command‑K opens quick actions.
- **Right Drawer:** **AI Insights** panel with tips/summaries; toggled per page.
- **Content:** 12‑column grid with responsive cards; section headers have descriptions.
- **Sticky Action Bar:** bottom‑right, primary CTA(s) for the page flow.

**Role Menus (examples)**
- *Referrer:* Dashboard, New Referral, Referrals, Messages.
- *Center:* Dashboard, Worklist, Slots, Billing.
- *Attorney:* Dashboard, Cases, Case Packet, Lien Ledger.
- *Funder:* Dashboard, Pipeline, Approvals, Exposure.
- *Ops:* Dashboard, Queues, Scorecards, Reports.
- *Admin:* Master Data (read‑only), Theme.

**Key Page Layouts**
- **Dashboard:** KPI row → Charts row → Tables row; AI Drawer open by default.
- **Referral Wizard:** stepper at top; 2‑column content; right rail shows validation & AI center pick.
- **Center Console:** calendar + worklist split view; upload modal with progress.
- **Attorney Packet:** left list of docs; right preview; export button in sticky bar.

---


## 7) Data Model (Prototype level)
- **Patient** {id, name, dob, phone, email, address, insurance, pipFlag}
- **Referral** {id, patientId, referrerId, modality, bodyPart, clinicalNotes, safetyAnswers[], preferredCenterId?, status}
- **Appointment** {id, referralId, centerId, datetime, status}
- **ScanReport** {id, referralId, radiologistId, reportPdfUrl, images[], releasedAt}
- **Bill** {id, referralId, cptCodes[], lineItems[{code, desc, qty, unitPrice}], total, status}
- **Lien** {id, referralId, attorneyId, funderId?, principal, rateApr, accrualBasis, ledger[]}
- **Settlement** {id, lienId, amount, disbursements[{payeeId, amount}], closedAt}
- **Center** {id, name, modalities[], address, geo, slots[]}
- **User** {id, role[Patient|Referrer|Center|Radiologist|Attorney|Funder|Ops|Admin], orgId?}
- **Org** {id, type[Provider|Attorney|Funder|Center], name}

---

## 8) Design System & Theming
**Stack:** Tailwind v4 + shadcn/ui.  
**Theme Source:** TweakCN export → CSS variables for `:root` and `.dark`.  
**Requirements:**
- Light & dark presets; brand preset switcher in **Admin → Theme**.  
- Token map: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, plus `--chart-1..5` for data viz.  
- Typography scale and radii set in variables; components inherit.

**Integration Steps (Prototype):**
1) Start with shadcn/ui project scaffold and Tailwind v4.  
2) Paste TweakCN‑exported variables into `src/styles/globals.css` under `:root` and `.dark`.  
3) Keep a `themes/` folder with JSON theme snapshots for auditability; build a small ThemeSwitcher that swaps a `data-theme` attribute or toggles `.dark`.  
4) Map chart colors to CSS variables (see **Charts**).

**Motion:** Framer Motion for micro‑interactions (page transitions ≤200ms, list item hover/press states, modal entrances). Respect `prefers-reduced-motion`.

**Accessibility:** Minimum contrast AA; focus rings visible; keyboard ops for all dialogs/menus.

---

## 9) Charts & Analytics

**Library:** Nivo (responsive). Charts adopt CSS variables from TweakCN presets.

**Charts to Ship This Week**
- Center Utilization (calendar heatmap).
- Turnaround Time (line by center).
- No‑Show Rate (stacked bars by cause).
- Funding Exposure (area over time).

**Theming:** map `--chart-1..5` to Nivo color scale; dark mode variants; AA contrast.

---


## 10) System Architecture (Prototype, Frontend‑Only)

**Frontend:** React + Vite + React Router + Zustand + shadcn/ui + Tailwind v4 + Framer Motion + Nivo.  
**Mock Backend:** MSW serving JSON fixtures from `/mock-api` (no persistence).  
**AI Layer (Mock):** heuristic functions over seed data produce suggestions; exposed via `/ai/suggest` MSW handler with small latency to feel real.  
**Docs:** OpenAPI YAML (static) for demo only.  
**PDF/Export:** html2pdf/React‑PDF (placeholder).  
**Dev Assistant:** Cursor.ai prompts + tasks (see section 16).

Repo layout unchanged.

---


## 11) Key Screens & Acceptance Criteria (Prototype)
1. **Patient Booking**  
   - Search (modality/body part, zip, earliest date), CenterCard, SlotPicker, SafetyQuestions, Confirmation.  
   - AC: Booking creates Appointment; Confirmation shows checklist + contact info.

2. **Referrer Wizard & Dashboard**  
   - Steps: Patient → Exam → Clinical Notes → Attachments → Center → Review.  
   - AC: Validates contraindications; shows status timeline.

3. **Center Console**  
   - Worklist (Today/Week), Slot Manager, Upload Report, Bill Creator.  
   - AC: Upload adds ScanReport; status moves to Report Ready.

4. **Attorney Workspace**  
   - Case list, Case Packet preview, Lien Ledger editor, Settlement split editor.  
   - AC: Packet compiles report + bill + summary; Ledger totals correct; export PDF.

5. **Funder Desk**  
   - Review queue with requirements, Approval, Exposure chart.  
   - AC: Approval creates Funder → Lien link; exposure updates.

6. **Ops Dashboard**  
   - Queues: No‑shows, Missing docs, Aged referrals; Scorecards; Reassign flow.  
   - AC: Each queue supports bulk actions and adds audit events.

7. **Admin → Master Data & Theme**  
   - CRUD of Centers, Providers, Attorneys, Radiologists, States (PIP).  
   - Theme preset switcher (loads exported variables).  

---

## 12) Notification & Reminders (Simulated)
- Email/SMS templates (booked, day‑before, report‑ready).  
- Toggle in Admin to simulate sends; record events in timeline.

---

## 13) Security, Privacy & Compliance (Prototype posture)
- Role‑based routing; no real PHI storage beyond mock data.  
- Audit log entity with immutable events.  
- Config file for environment toggles (PI demo vs general demo content).  
- Forward plan: HIPAA BAAs with centers, encryption at rest, SSO for B2B portals.

---

## 14) Testing & QA
- Unit tests for helpers (interest accrual, slot rules).  
- Playwright for 3 golden paths: Referral → Booking → Report; Attorney Packet; Center Upload.  
- Visual regression snapshots for theme presets.

---

## 15) Risks & Mitigations
- **Theme drift** between exports and components → lock tokens in a `design-tokens.ts` bridge and snapshot test.  
- **Chart readability** in dark mode → provide dedicated `--chart-*` tokens and AA checks.  
- **Scope creep** in funding maths → freeze formulas for MVP; add config later.  
- **Regulatory nuance** (self‑referral legality) → flag by state in Master Data.

---

## 16) One‑Week Timeline (Reality Plan)
- **Day 1:** Scaffold, theming, shell, routing, sample dashboard.
- **Day 2:** Seed data + MSW + store; Referrer + Patient dashboards.
- **Day 3:** Center dashboard + Wizard + Slot Picker.
- **Day 4:** Attorney + Funder + Ops dashboards; charts wired.
- **Day 5:** Polish (Framer, a11y, empty/skeleton states), demo script, README.

---


## 17) Demo Scenarios (One‑Week Visual Demo)
1) **Referrer flow:** Create referral → AI suggests best center → pick slot → status updates → mock report appears.
2) **Center flow:** See worklist → complete scan → upload report → KPIs/Charts update.
3) **Attorney flow:** Open case → AI flags missing doc → generate Case Packet → export PDF.
4) **Funder flow:** Open queue → approve 1 case → exposure chart changes.
5) **Ops flow:** Reassign a no‑show → utilization heatmap adjusts.

---


## 18) Open Questions
- Which 3–4 cities/states to seed for the demo? (Impacts copy.)
- Finalize the three AI copy styles (clinical, friendly, concise) for Insights.
- Select chart fonts (inherit vs condensed numeric fonts?).

---


## 19) Definition of Done (One‑Week Prototype)
- Role dashboards shipped with charts, KPIs, CTA cards, and AI Insight Drawer.
- Referral Wizard + Slot Picker works end‑to‑end with mock data.
- Theme switching (TweakCN) + dark mode fully applied to components & charts.
- Three demo scenarios run smoothly under `pnpm dev`.
- README contains Cursor.ai prompts and a demo script.

---

## 20) Developer Workflow (Cursor.ai)
- Create component stubs from PRD names; ask Cursor to fill props and stories.
- Enforce a11y: focus trap on modals; keyboard nav on menus; color tokens only.
- Use **MSW** to fake latency (300–700ms) for realism; add skeletons.
- Add `scripts/demo:reset` to reseed fixtures quickly.

