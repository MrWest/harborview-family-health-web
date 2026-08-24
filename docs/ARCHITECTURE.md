# Harborview Frontend Architecture

Harborview is a proof environment with three explicitly separated business lanes sharing one visual system and one typed clinic API client. The browser never contains database credentials; it only receives the public API base URL through `NEXT_PUBLIC_HARBORVIEW_API_URL` and, when the client-managed assistant is enabled, a public Directiv platform API key through `NEXT_PUBLIC_DIRECTIVSYS_API_KEY`.

## Route map

| Area | Route | Responsibility |
|---|---|---|
| Public entry | `/` | Choose a prospective visitor, existing-patient, or reception flow and understand proof boundaries. |
| Visitor registration | `/register` | Browser-local PDF-assisted candidate-field draft and availability browsing; never creates a patient, persisted registration, hold, or booking. |
| Visitor review | `/register/review` | Makes the local-only and `SIGN_IN_REQUIRED` boundaries explicit. |
| Patient home | `/patient` | Authenticated patient-service overview; never returns an existing patient to intake. |
| Appointment finder | `/patient/appointments` | Select specialty, provider, availability, and submit an authenticated patient appointment request for staff review. |
| Document requests | `/patient/intake` | Show administrative document requests after registration; no repeat intake. |
| Released result status | `/patient/results` | Show only release status and a portal link where available; no result interpretation. |
| Confirmation | `/patient/confirmation` | Explain what a held appointment means and what reception does next. |
| Reception dashboard | `/reception` | Operational overview and open-work queue. |
| Intake workspace | `/reception/intake` | Search cases, review missing items, and create a staff-review task. |
| New intake | `/reception/new-intake` | Receptionist PDF extraction, duplicate review, patient/intake creation, earliest recognition search, and explicit staff-confirmed booking. |
| Patient directory | `/reception/patients` | Search the synthetic clinic directory. |
| Scheduling desk | `/reception/schedule` | Review provider availability and staff scheduling policy. |
| Laboratory coordination | `/reception/laboratory` | Browse laboratory services and collection coordination rules. |

## Source boundaries

```text
src/
├── app/                 # Route composition only
├── components/          # Shared navigation and reusable visual primitives
├── features/            # Workflow-specific modules: registration, patient services, appointments, intake, reception
├── hooks/               # Reusable client-side data loading and business-action hooks
└── lib/                 # Typed API client, domain types, formats, and synthetic fallbacks
```

The `lib/clinic-api.ts` module is the only place that knows HTTP endpoint paths. Page components do not build URLs or parse raw response payloads. Feature components own display-level interaction state; routes compose those features into complete workflows. Actor headers are generated centrally through the typed client so the API independently enforces the demo lane even when a UI action is bypassed.

## Current proof boundaries

The application supports administrative coordination only. Visitor PDF extraction scans labelled identity/contact/language/emergency/payer/referral and patient-reported candidate fields; it retains all medical text as **extracted/unverified** and does not diagnose, triage, interpret, recommend treatment, or make clinical decisions. An authenticated patient can see only their own appointment information, released-result status/link, and document requests. A receptionist can create/match a patient and recognition intake, but a booking is written only after staff confirmation.

## Client-Managed DirectivSys seam

`components/directiv/ClientManagedAssistant.tsx` uses the published React/Core SDK in Client-Managed mode. It loads and appends visible and hidden transcript events through Harborview’s `/api/conversations/{conversationId}/events/v2` endpoints, with a maximum context window of ten events. The API records actor and correlation metadata, authorizes access by actor identity, and is the final authorization point for every domain action. `endConversation()` clears the client-owned transcript through Harborview and asks Directiv to clear its encrypted ephemeral sequential state.

The browser-only loader deliberately defers importing the SDK until after mount so the optional chat UI cannot affect server rendering. The front end passes role/actor context to the orchestrator and separately gates tool execution; the Harborview API repeats the authorization check. Tool definitions and operating instructions are versioned under `docs/directiv/` and contain no credential.
