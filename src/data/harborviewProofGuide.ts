export type ProofGuideVisual =
  | {
      kind: "overview" | "services";
      title: string;
      items: Array<{ label: string; detail: string }>;
    }
  | {
      kind: "pdf";
      path: string;
      alt: string;
      downloadName: string;
    }
  | {
      kind: "image";
      path: string;
      alt: string;
      downloadName: string;
    };

export type ProofGuideScenario = {
  id: "start" | "visitor" | "patient" | "reception";
  tab: string;
  eyebrow: string;
  title: string;
  route: string;
  routeLabel: string;
  visual: ProofGuideVisual;
  referenceDownloads?: Array<{ label: string; path: string; downloadName: string }>;
  setup: string;
  prompts: string[];
  expected: string;
  boundary: string;
};

export const HARBORVIEW_PROOF_SCENARIOS: ProofGuideScenario[] = [
  {
    id: "start",
    tab: "Start here",
    eyebrow: "Orientation",
    title: "Choose the lane that matches the person testing",
    route: "/",
    routeLabel: "Return to proof entrance",
    visual: {
      kind: "overview",
      title: "Three separate administrative lanes",
      items: [
        { label: "New patient", detail: "Prepare a browser-local registration draft." },
        { label: "Existing patient", detail: "Use a synthetic, patient-scoped portal." },
        { label: "Reception", detail: "Review and confirm staff-owned operations." },
      ],
    },
    setup:
      "Harborview is not a generic chatbot. Start in the lane whose permissions and administrative responsibilities you want to demonstrate.",
    prompts: [],
    expected:
      "Each lane exposes different routes, data, and permitted actions. The assistant follows the same actor boundary instead of carrying authority from one lane into another.",
    boundary:
      "This is an administrative coordination proof. It does not diagnose, triage, interpret clinical information, recommend treatment, or replace professional care.",
  },
  {
    id: "visitor",
    tab: "New patient",
    eyebrow: "01 · Visitor lane",
    title: "Fill a local form from a fictional referral",
    route: "/register",
    routeLabel: "Open registration",
    visual: {
      kind: "pdf",
      path: "/download/harborview-proof/harborview_avery_marshall_extended_registration.pdf",
      alt: "Fictional Avery Marshall registration and referral PDF prepared for the Harborview proof",
      downloadName: "harborview_avery_marshall_extended_registration.pdf",
    },
    referenceDownloads: [
      {
        label: "Spanish referral sample",
        path: "/download/harborview-proof/harborview_sofia_rivera_spanish_referral.pdf",
        downloadName: "harborview_sofia_rivera_spanish_referral.pdf",
      },
    ],
    setup:
      "Download Avery’s fictional registration packet. On the registration page, use the form control labelled “Prefill this form from a registration or medical-record PDF”—not chat—to populate the browser-local form.",
    prompts: [
      "What can you help me complete in this registration form?",
      "Show recognition appointment availability for Family Medicine.",
    ],
    expected:
      "Harborview marks populated values as PDF candidates for review and retains patient-reported medical text as extracted/unverified. The assistant can guide the local draft and browse availability, but it cannot create a patient, submit registration, reserve a time, or book.",
    boundary:
      "The recommended proof path sends the PDF directly to Harborview’s form uploader. Do not attach documents in chat for this direct-to-Harborview demonstration.",
  },
  {
    id: "patient",
    tab: "Existing patient",
    eyebrow: "02 · Active patient lane",
    title: "Use the patient portal without repeating intake",
    route: "/patient",
    routeLabel: "Open patient portal",
    visual: {
      kind: "services",
      title: "Synthetic portal scope",
      items: [
        { label: "Appointments", detail: "Own administrative appointment details." },
        { label: "Released results", detail: "Release status and portal link only." },
        { label: "Documents", detail: "Post-registration document requests." },
      ],
    },
    setup:
      "This route is already scoped to the fictional proof identity portal-patient-001. It demonstrates existing-patient services rather than registration.",
    prompts: ["What appointments do I have?", "Show me that appointment."],
    expected:
      "The assistant returns only the patient’s own administrative appointment information and can navigate to an authorized appointment detail view.",
    boundary:
      "Released-result status and portal links are available when appropriate. No diagnosis, result interpretation, urgency assessment, treatment advice, or repeated intake is available.",
  },
  {
    id: "reception",
    tab: "Reception desk",
    eyebrow: "03 · Receptionist lane",
    title: "Turn an intake document into a staff-reviewed next step",
    route: "/reception/new-intake",
    routeLabel: "Open new intake",
    visual: {
      kind: "image",
      path: "/download/harborview-proof/harborview_reception_duplicate_review.png",
      alt: "Fictional conceptual reference showing reception staff reviewing possible duplicate patient matches",
      downloadName: "harborview_reception_duplicate_review.png",
    },
    referenceDownloads: [
      {
        label: "Spanish referral sample",
        path: "/download/harborview-proof/harborview_sofia_rivera_spanish_referral.pdf",
        downloadName: "harborview_sofia_rivera_spanish_referral.pdf",
      },
    ],
    setup:
      "Open the staff intake workspace and upload the fictional Spanish referral through the intake form. Review candidate values and possible duplicate matches before continuing.",
    prompts: [
      "What information is still missing from this intake draft?",
      "Find the earliest recognition availability after I review the duplicate matches.",
    ],
    expected:
      "Reception reviews candidates and duplicate matches before creating or matching a patient and intake, then searches availability. Booking is written only after explicit staff confirmation.",
    boundary:
      "The assistant supports administrative orchestration. It does not diagnose, triage, interpret a record, or independently complete a consequential booking.",
  },
];
