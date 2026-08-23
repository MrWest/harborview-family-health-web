# Harborview Family Health Centre Web

This private Next.js, React, and Tailwind application is the fictional Harborview proof interface. It contains two deliberately separate experiences: a patient-facing appointment and document-readiness flow, and a receptionist workspace for intake, staff review, scheduling coordination, patient lookup, and laboratory coordination.

## Start locally

The browser client defaults to the Harborview Cloud Run API configured in `src/lib/clinic-api.ts`. To point the frontend at a local API during development, create `.env.local` with `NEXT_PUBLIC_HARBORVIEW_API_URL=http://localhost:5090`. Then run:

```bash
pnpm install
pnpm dev
```

For a production validation build, use:

```bash
NODE_ENV=production pnpm build
```

## Product boundary

The patient portal presents administrative availability and creates appointment holds. The receptionist workspace reviews synthetic intake completeness, routes exceptional documents, and confirms scheduling. The application uses only fictional proof data and must not be presented as diagnosis, triage, treatment, or medical decision software.

## Application routes

| Area | Routes | Purpose |
|---|---|---|
| Patient portal | `/patient`, `/patient/appointments`, `/patient/intake`, `/patient/confirmation` | Appointment request, document intake, and staff-confirmation workflow. |
| Reception workspace | `/reception`, `/reception/intake`, `/reception/patients`, `/reception/schedule`, `/reception/laboratory` | Administrative dashboard, intake review, synthetic patient search, scheduling coordination, and laboratory service routing. |

The repository is organized for a human team to extend. `src/lib` contains typed domain and API boundaries; `src/hooks` holds reusable browser data loading; `src/components` provides shared layouts and status UI; `src/features` owns workflow modules; and `src/app` contains route composition only. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full map.

## API behavior

The frontend never contains database credentials. It calls the API base URL from `NEXT_PUBLIC_HARBORVIEW_API_URL` and provides clear fallback proof data if that service is unavailable. The deployed API enables cross-origin requests for this proof UI. Appointment holds, document uploads, and staff-review task actions surface explicit loading, success, and error states.

## DirectivSys readiness

DirectivSys is intentionally not integrated in this phase. The API and UI expose stable patient, intake, appointment, document, and conversation-event boundaries so a later Client-Managed integration can enhance the interaction without replacing the clinic business workflow.
