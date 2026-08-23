# Harborview Family Health Centre Web

This private Next.js, React, and Tailwind application is the fictional Harborview proof interface. It contains two deliberately separate experiences: a patient-facing appointment and document-readiness flow, and a receptionist workspace for intake, staff review, and scheduling coordination.

## Start locally

Copy `.env.example` to `.env.local`, set the Harborview API URL, then run:

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

## DirectivSys readiness

DirectivSys is intentionally not integrated in this phase. The API and UI expose stable patient, intake, appointment, document, and conversation-event boundaries so a later Client-Managed integration can enhance the interaction without replacing the clinic business workflow.
