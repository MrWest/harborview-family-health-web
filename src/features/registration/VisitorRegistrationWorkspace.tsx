"use client";

// Design: Harborview’s calm, paper-and-ink administrative experience uses warm neutrals, deep harbor blue, and restrained sea-glass accents; actions remain explicit and human-centred.
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Database, FileScan, FileText, LockKeyhole, MessageSquareText, Search, ShieldCheck, ShieldOff, Upload } from "lucide-react";
import { ClientManagedAssistantLoader } from "@/components/directiv/ClientManagedAssistantLoader";
import { clinicApi } from "@/lib/clinic-api";
import type { AppointmentSlot, ExtractedDocument } from "@/lib/clinic-types";
import { formatAppointmentTime } from "@/lib/format";

const visitor = { mode: "visitor" as const, id: "visitor-registration-001" };
const storageKey = "harborview:visitor-registration-draft";
const requiredFields = [
  "displayName",
  "dateOfBirth",
  "email",
  "phone",
  "preferredLanguage",
  "emergencyContactName",
  "emergencyContactPhone",
];

type LocalDraft = {
  fields: Record<string, string>;
  extractedFields?: string[];
  sourceDocumentId?: string;
  extractedAt?: string;
};

type FormField = {
  key: string;
  label: string;
  required?: boolean;
  input?: "text" | "email" | "tel" | "date" | "textarea";
  helper?: string;
};

const formSections: Array<{ title: string; description: string; fields: FormField[] }> = [
  {
    title: "Personal details",
    description: "Use the name and contact information Harborview should use for registration follow-up.",
    fields: [
      { key: "displayName", label: "Full legal name", required: true },
      { key: "dateOfBirth", label: "Date of birth", required: true, input: "date" },
      { key: "preferredLanguage", label: "Preferred language", required: true },
      { key: "countryOrRegion", label: "Country or region" },
      { key: "email", label: "Email", required: true, input: "email" },
      { key: "phone", label: "Telephone", required: true, input: "tel" },
    ],
  },
  {
    title: "Contact and address",
    description: "These local fields help demonstrate the information a reception team may need before verification.",
    fields: [
      { key: "addressLine1", label: "Address line 1" },
      { key: "addressLine2", label: "Address line 2" },
      { key: "city", label: "City" },
      { key: "stateOrProvince", label: "State or province" },
      { key: "postalCode", label: "Postal or ZIP code" },
      { key: "communicationPreference", label: "Preferred contact method" },
    ],
  },
  {
    title: "Emergency contact",
    description: "Provide the person Harborview may contact only through its later verified intake process.",
    fields: [
      { key: "emergencyContactName", label: "Emergency contact name", required: true },
      { key: "emergencyContactRelationship", label: "Relationship" },
      { key: "emergencyContactPhone", label: "Emergency contact telephone", required: true, input: "tel" },
    ],
  },
  {
    title: "Coverage and referral",
    description: "Optional administrative details can be reviewed with reception after identity verification.",
    fields: [
      { key: "payerOrPlan", label: "Payer or coverage plan" },
      { key: "memberOrPolicyNumber", label: "Member or policy number" },
      { key: "referralSource", label: "Referral source or referring provider" },
      { key: "reasonForVisit", label: "Administrative reason for visit", input: "textarea" },
    ],
  },
  {
    title: "Patient-reported information from your document",
    description: "Optional text is shown only as extracted/unverified patient-reported information. Harborview does not diagnose, interpret, or triage it here.",
    fields: [
      { key: "patientReportedConditions", label: "Patient-reported conditions", input: "textarea", helper: "Extracted/unverified; not a diagnosis." },
      { key: "patientReportedAllergies", label: "Patient-reported allergies", input: "textarea", helper: "Extracted/unverified; not a clinical decision." },
      { key: "patientReportedMedications", label: "Patient-reported medications", input: "textarea", helper: "Extracted/unverified; no medication guidance is provided." },
      { key: "patientReportedProcedures", label: "Patient-reported procedures", input: "textarea", helper: "Extracted/unverified; no clinical interpretation is provided." },
    ],
  },
];

function CandidateTag({ isCandidate }: { isCandidate: boolean }) {
  if (!isCandidate) return null;
  return <span className="ml-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#277579]">PDF candidate · review</span>;
}

export function VisitorRegistrationWorkspace() {
  const [draft, setDraft] = useState<LocalDraft>({ fields: { preferredLanguage: "English" }, extractedFields: [] });
  const [uploadState, setUploadState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [findingSlots, setFindingSlots] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setDraft(JSON.parse(saved) as LocalDraft);
  }, []);
  useEffect(() => {
    const receiveAssistantDraftUpdate = (event: Event) => setDraft((event as CustomEvent<LocalDraft>).detail);
    window.addEventListener("harborview:visitor-draft-updated", receiveAssistantDraftUpdate);
    return () => window.removeEventListener("harborview:visitor-draft-updated", receiveAssistantDraftUpdate);
  }, []);
  useEffect(() => window.localStorage.setItem(storageKey, JSON.stringify(draft)), [draft]);

  const missing = useMemo(() => requiredFields.filter((field) => !draft.fields[field]?.trim()), [draft.fields]);
  const candidateFields = new Set(draft.extractedFields ?? []);
  const patientReportedCandidateCount = [
    "patientReportedConditions",
    "patientReportedAllergies",
    "patientReportedMedications",
    "patientReportedProcedures",
  ].filter((field) => candidateFields.has(field)).length;
  const setField = (field: string, value: string) => setDraft((current) => ({
    ...current,
    fields: { ...current.fields, [field]: value },
    extractedFields: (current.extractedFields ?? []).filter((item) => item !== field),
  }));

  async function upload(file?: File) {
    if (!file) return;
    setUploadState("loading");
    setNotice(null);
    try {
      const extracted: ExtractedDocument = await clinicApi.extractRegistrationDocument(file, visitor);
      const acceptedCandidates = Object.entries(extracted.candidateFields).filter(([, value]) => Boolean(value?.trim()));
      setDraft((current) => ({
        ...current,
        fields: { ...current.fields, ...Object.fromEntries(acceptedCandidates.map(([key, value]) => [key, value ?? ""])) },
        extractedFields: acceptedCandidates.map(([key]) => key),
        sourceDocumentId: extracted.documentId,
        extractedAt: new Date().toISOString(),
      }));
      setUploadState("done");
      setNotice(`${acceptedCandidates.length} candidate field${acceptedCandidates.length === 1 ? " was" : "s were"} copied into your local form. Review each PDF candidate before continuing. All patient-reported medical text remains extracted/unverified.`);
    } catch {
      setUploadState("error");
      setNotice("The proof API could not receive this PDF. Your local form is still available in this browser; no registration was created.");
    }
  }

  async function browseAvailability() {
    setFindingSlots(true);
    try { setSlots(await clinicApi.searchRecognitionSlots("Family Medicine", visitor)); }
    catch { setNotice("Availability is temporarily unavailable. Browsing does not create a hold or appointment."); }
    finally { setFindingSlots(false); }
  }

  return <main className="min-h-screen bg-[#f7f7f2] text-[#102b3d]">
    <header className="border-b border-[#102b3d]/10 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><Link className="font-serif text-2xl tracking-[-.03em]" href="/">Harborview <span className="text-[#277579]">Family Health</span></Link><Link href="/patient" className="text-sm font-semibold text-[#277579]">Already a patient?</Link></div></header>
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1.45fr_.55fr] lg:px-8 lg:py-16">
      <section><p className="text-xs font-bold uppercase tracking-[.22em] text-[#277579]">Prospective registration</p><h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[.98] tracking-[-.045em]">Complete your registration form <em className="font-normal text-[#277579]">once, in one place.</em></h1><p className="mt-5 max-w-3xl text-lg leading-8 text-[#102b3d]/68">Upload a labelled PDF to prefill this local form, review every candidate value, and complete what remains. Harborview will not create a patient record, save your registration, or book a visit until identity verification and staff review are complete.</p>
        <div className="mt-8 border border-[#277579]/20 bg-[#dcece7] p-5 text-sm leading-6"><div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-[#277579]" size={19}/><p><strong>Administrative only.</strong> Any patient-reported conditions, allergies, medications, or procedures are copied as <strong>extracted/unverified</strong> text. This proof does not diagnose, triage, interpret results, or recommend treatment.</p></div></div>
        <div className="mt-8 border border-dashed border-[#277579]/35 bg-white p-6"><label className="flex cursor-pointer items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#102b3d] text-[#a9d9cf]"><Upload size={19}/></span><span><strong className="block">Prefill this form from a registration or medical-record PDF</strong><span className="mt-1 block text-sm leading-6 text-[#102b3d]/62">Harborview scans labelled administrative and patient-reported candidate fields only. PDF, 10 MB maximum.</span><input className="sr-only" type="file" accept="application/pdf" onChange={(event: ChangeEvent<HTMLInputElement>) => void upload(event.target.files?.[0])}/></span></label>{uploadState === "loading" && <p className="mt-4 text-sm text-[#277579]">Reading labelled candidate fields…</p>}</div>
        {notice && <p className={`mt-4 border-l-2 px-4 py-3 text-sm leading-6 ${uploadState === "error" ? "border-red-500 bg-red-50 text-red-800" : "border-[#277579] bg-white text-[#102b3d]/75"}`}>{notice}</p>}
        {uploadState === "done" && <section className="mt-5 border border-[#277579]/30 bg-[#102b3d] p-6 text-white" aria-label="Document and data provenance">
          <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#a9d9cf]">Extraction provenance receipt</p><h2 className="mt-2 font-serif text-3xl tracking-[-.03em]">Your document helped populate this form—<em className="font-normal text-[#a9d9cf]">not a Directiv record.</em></h2></div><ShieldOff className="shrink-0 text-[#a9d9cf]" size={28}/></div>
          <div className="mt-6 grid gap-px border border-white/15 bg-white/15 sm:grid-cols-3">
            <div className="bg-[#102b3d] p-4"><FileScan className="text-[#a9d9cf]" size={20}/><p className="mt-4 text-sm font-bold">1. Direct to Harborview</p><p className="mt-2 text-xs leading-5 text-white/65">Your PDF was sent to Harborview’s candidate-field extraction endpoint, not to Directiv.</p></div>
            <div className="bg-[#102b3d] p-4"><Database className="text-[#a9d9cf]" size={20}/><p className="mt-4 text-sm font-bold">2. Local form is populated</p><p className="mt-2 text-xs leading-5 text-white/65">{candidateFields.size} labelled candidate fields now appear in this browser-local form for your review.</p></div>
            <div className="bg-[#102b3d] p-4"><ShieldOff className="text-[#a9d9cf]" size={20}/><p className="mt-4 text-sm font-bold">3. No Directiv registration</p><p className="mt-2 text-xs leading-5 text-white/65">The PDF and these extracted candidates were not attached to Directiv or registered as a patient record.</p></div>
          </div>
          <div className="mt-5 flex gap-3 border-t border-white/15 pt-5 text-xs leading-5 text-white/70"><MessageSquareText className="mt-0.5 shrink-0 text-[#a9d9cf]" size={17}/><p><strong className="text-white">Client-Managed assistant boundary:</strong> Directiv may process the bounded chat messages you choose to send, but Harborview does not automatically send the PDF or the extracted conditions, allergies, medications, or procedures below. {patientReportedCandidateCount ? `${patientReportedCandidateCount} patient-reported medical field${patientReportedCandidateCount === 1 ? " is" : "s are"} visibly marked extracted/unverified for your review.` : "Patient-reported medical candidates remain labelled extracted/unverified when present."}</p></div>
        </section>}

        <div className="mt-10 space-y-10">
          {formSections.map((section) => <section className="border-t border-[#102b3d]/12 pt-7" key={section.title}>
            <div className="max-w-2xl"><h2 className="font-serif text-3xl tracking-[-.03em]">{section.title}</h2><p className="mt-2 text-sm leading-6 text-[#102b3d]/62">{section.description}</p></div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {section.fields.map((field) => <label className={field.input === "textarea" ? "sm:col-span-2" : ""} key={field.key}>
                <span className="text-sm font-semibold text-[#102b3d]/78">{field.label}{field.required && <span className="ml-1 text-[#277579]">*</span>}<CandidateTag isCandidate={candidateFields.has(field.key)}/></span>
                {field.input === "textarea" ? <textarea value={draft.fields[field.key] ?? ""} onChange={(event) => setField(field.key, event.target.value)} rows={4} className="mt-2 w-full resize-y border border-[#102b3d]/15 bg-white px-3 py-3 text-sm font-normal leading-6 outline-none transition focus:border-[#277579]" /> : <input type={field.input ?? "text"} value={draft.fields[field.key] ?? ""} onChange={(event) => setField(field.key, event.target.value)} className="mt-2 w-full border border-[#102b3d]/15 bg-white px-3 py-3 text-sm font-normal outline-none transition focus:border-[#277579]" />}
                {field.helper && <span className="mt-2 block text-xs leading-5 text-[#277579]">{field.helper}</span>}
              </label>)}
            </div>
          </section>)}
        </div>
        <div className="mt-10 flex flex-wrap gap-3"><button onClick={() => void browseAvailability()} disabled={findingSlots} className="inline-flex items-center gap-2 bg-[#102b3d] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><Search size={16}/>{findingSlots ? "Checking availability…" : "Browse recognition availability"}</button><Link href="/register/review" className="inline-flex items-center gap-2 border border-[#102b3d]/20 bg-white px-5 py-3 text-sm font-semibold">Review local draft <FileText size={16}/></Link></div>
        {slots.length > 0 && <div className="mt-5 grid gap-3 sm:grid-cols-2">{slots.slice(0, 4).map((slot) => <div className="border border-[#102b3d]/12 bg-white p-4" key={slot.id}><p className="font-serif text-lg">{formatAppointmentTime(slot.startsAtUtc)}</p><p className="mt-2 text-xs leading-5 text-[#102b3d]/60">Available to browse. Signing in and confirmation are required before Harborview can request or book a time.</p></div>)}</div>}
      </section>
      <aside className="h-fit border border-[#102b3d]/10 bg-[#102b3d] p-7 text-white lg:sticky lg:top-8"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#a9d9cf]">Local form status</p><h2 className="mt-3 font-serif text-3xl">{missing.length ? `${missing.length} required item${missing.length === 1 ? "" : "s"} still needed` : "Ready for verification"}</h2><p className="mt-3 text-sm leading-6 text-white/67">This browser retains your local form for this proof. A visitor can prepare information and browse availability, but cannot create a patient account, persist an intake, hold a slot, or book an appointment.</p><ul className="mt-7 space-y-3 text-sm">{requiredFields.map((field) => <li className="flex items-center justify-between border-b border-white/10 pb-3" key={field}><span>{field.replace(/([A-Z])/g, " $1")}</span><span className={draft.fields[field] ? "text-[#a9d9cf]" : "text-white/42"}>{draft.fields[field] ? "Prepared" : "Needed"}</span></li>)}</ul><div className="mt-7 border border-white/15 bg-white/8 p-4 text-xs leading-5 text-white/65"><LockKeyhole className="mb-2 text-[#a9d9cf]" size={17}/>To save this information as a registration, Harborview needs a signed-in or verified identity and a staff-confirmed intake process.</div></aside>
    </div><ClientManagedAssistantLoader actor={visitor} conversationId="harborview-visitor-registration-001" pageName="Prospective registration form"/>
  </main>;
}
