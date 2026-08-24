# Frontend Validation Record

## Production build

`NODE_ENV=production pnpm build` completed successfully after the Client-Managed integration. Next.js generated the root, visitor registration/review, authenticated patient-services, and receptionist operational routes.

## Browser checks

The production preview was checked in a browser at the following routes:

| Route | Verified behavior |
|---|---|
| `/register` | Browser-local PDF-assisted prospective draft, availability browse action, and persistent-action boundary are compiled into the route. |
| `/patient/appointments` | Patient navigation, specialty selection, provider selection, availability cards, scoped appointment-request action, and truthful error state are compiled into the route. |
| `/patient/results` | Scoped released-result status and portal-link-only presentation are compiled into the route. |
| `/reception/new-intake` | Reception PDF extraction, duplicate review, patient/intake creation, earliest recognition search, and explicit booking confirmation are compiled into the route. |

The supplied Cloud Run hostname needs the newly generated database migration and Monday API deployment before live calls can be exercised. The configured API URL remains environment-overridable through `NEXT_PUBLIC_HARBORVIEW_API_URL`; when the deployed service is reachable, the new modules use actor-scoped workflow endpoints rather than fallback success messages.

## Interaction boundaries

The frontend exposes a demo actor lane through centralized request headers, but the API independently rejects non-permitted actions. Visitor registration remains local until identity verification/reception intake; an existing patient never re-enters intake; and reception booking requires an explicit staff confirmation. The Directiv assistant is configured for Client-Managed history and returns only tool-backed success, blocked, or error messages.
