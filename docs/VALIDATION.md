# Frontend Validation Record

## Production build

`NODE_ENV=production pnpm build` completed successfully after the route refactor. Next.js generated ten application routes plus the root entry and not-found page.

## Browser checks

The production preview was checked in a browser at the following routes:

| Route | Verified behavior |
|---|---|
| `/patient/appointments` | Patient navigation, specialty selection, provider selection, availability cards, live-API fallback notice, and appointment-hold confirmation rendered correctly. |
| `/reception/intake` | Separate reception navigation, intake-case search, active-case selection, missing-item checklist, and review-task action rendered correctly. |

The supplied Cloud Run hostname currently returned a Google `404` from this validation environment, so the browser correctly exercised the documented synthetic fallback state. The configured API URL remains environment-overridable through `NEXT_PUBLIC_HARBORVIEW_API_URL`; when the deployed service is reachable, the same modules use live provider, slot, intake, directory, and laboratory endpoints.

## Interaction boundaries

The appointment confirmation makes the held-versus-confirmed distinction visible. The reception workspace describes administrative limits and does not expose diagnosis, treatment, triage, or medical decisioning controls.
