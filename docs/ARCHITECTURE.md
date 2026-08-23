# Harborview Frontend Architecture

Harborview is a proof environment with two independently navigable applications sharing one visual system and one typed clinic API client. The browser never contains database credentials; it only receives the public API base URL through `NEXT_PUBLIC_HARBORVIEW_API_URL`.

## Route map

| Area | Route | Responsibility |
|---|---|---|
| Public entry | `/` | Choose patient or reception flow and understand proof boundaries. |
| Patient home | `/patient` | Administrative-care overview and patient navigation. |
| Appointment finder | `/patient/appointments` | Select specialty, provider, availability, and request a staff-reviewed hold. |
| Intake documents | `/patient/intake` | Upload a fictional PDF to the assigned administrative intake case. |
| Confirmation | `/patient/confirmation` | Explain what a held appointment means and what reception does next. |
| Reception dashboard | `/reception` | Operational overview and open-work queue. |
| Intake workspace | `/reception/intake` | Search cases, review missing items, and create a staff-review task. |
| Patient directory | `/reception/patients` | Search the synthetic clinic directory. |
| Scheduling desk | `/reception/schedule` | Review provider availability and staff scheduling policy. |
| Laboratory coordination | `/reception/laboratory` | Browse laboratory services and collection coordination rules. |

## Source boundaries

```text
src/
├── app/                 # Route composition only
├── components/          # Shared navigation and reusable visual primitives
├── features/            # Workflow-specific modules: appointments, intake, reception
├── hooks/               # Reusable client-side data loading and business-action hooks
└── lib/                 # Typed API client, domain types, formats, and synthetic fallbacks
```

The `lib/clinic-api.ts` module is the only place that knows HTTP endpoint paths. Page components do not build URLs or parse raw response payloads. Feature components own display-level interaction state; routes compose those features into complete workflows.

## Current proof boundaries

The application supports administrative coordination only. Appointment requests become held times until a receptionist confirms them. Document upload accepts a fictional PDF into the selected synthetic intake case. The application does not diagnose, triage, recommend treatment, or make clinical decisions.

## Future DirectivSys seam

The patient and reception routes are intentionally ordinary business software in this phase. Stable patient, intake-case, appointment, and document identifiers provide the future boundary for Client-Managed conversation storage and SDK tools, without embedding DirectivSys code in this proof version.
