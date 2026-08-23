"use client";

// Design: Harborview’s calm, paper-and-ink administrative experience uses warm neutrals, deep harbor blue, and restrained sea-glass accents; actions remain explicit and human-centred.
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, LockKeyhole, Search, ShieldCheck, Upload } from "lucide-react";
import { ClientManagedAssistantLoader } from "@/components/directiv/ClientManagedAssistantLoader";
import { clinicApi } from "@/lib/clinic-api";
import type { AppointmentSlot, ExtractedDocument } from "@/lib/clinic-types";
import { formatAppointmentTime } from "@/lib/format";

const visitor = { mode: "visitor" as const, id: "visitor-registration-001" };
const storageKey = "harborview:visitor-registration-draft";
const required = ["displayName", "dateOfBirth", "email", "phone", "preferredLanguage", "emergencyContactName", "emergencyContactPhone"];

type LocalDraft = { fields: Record<string, string>; sourceDocumentId?: string; extractedAt?: string };

export function VisitorRegistrationWorkspace() {
  const [draft, setDraft] = useState<LocalDraft>({ fields: { preferredLanguage: "English" } });
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

  const missing = useMemo(() => required.filter((field) => !draft.fields[field]?.trim()), [draft.fields]);
  const setField = (field: string, value: string) => setDraft((current) => ({ ...current, fields: { ...current.fields, [field]: value } }));

  async function upload(file?: File) {
    if (!file) return;
    setUploadState("loading");
    setNotice(null);
    try {
      const extracted: ExtractedDocument = await clinicApi.extractRegistrationDocument(file, visitor);
      setDraft({ fields: Object.fromEntries(Object.entries(extracted.candidateFields).map(([key, value]) => [key, value ?? ""])), sourceDocumentId: extracted.documentId, extractedAt: new Date().toISOString() });
      setUploadState("done");
      setNotice(`${extracted.extractionStatus === "CandidateFieldsExtracted" ? "Candidate registration fields were copied from your PDF" : "The PDF was received, but labelled registration fields were not found"}. Please review every item before continuing. All patient-reported medical text remains extracted/unverified.`);
    } catch {
      setUploadState("error");
      setNotice("The proof API could not receive this PDF. Your local draft is still available in this browser; no registration was created.");
    }
  }

  async function browseAvailability() {
    setFindingSlots(true);
    try { setSlots(await clinicApi.searchRecognitionSlots("Family Medicine", visitor)); }
    catch { setNotice("Availability is temporarily unavailable. Browsing does not create a hold or appointment."); }
    finally { setFindingSlots(false); }
  }

  return <main className="min-h-screen bg-[#f7f7f2] text-[#102b3d]">
    <header className="border-b border-[#102b3d]/10 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8"><Link className="font-serif text-2xl tracking-[-.03em]" href="/">Harborview <span className="text-[#277579]">Family Health</span></Link><Link href="/patient" className="text-sm font-semibold text-[#277579]">Already a patient?</Link></div></header>
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-16">
      <section><p className="text-xs font-bold uppercase tracking-[.22em] text-[#277579]">Prospective registration</p><h1 className="mt-4 max-w-2xl font-serif text-5xl leading-[.98] tracking-[-.045em]">Prepare your details <em className="font-normal text-[#277579]">without starting over.</em></h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#102b3d]/68">Use a PDF to prefill a local draft, then correct or complete the information. Harborview will not create a patient record, save your registration, or book a visit until identity verification and staff review are complete.</p>
        <div className="mt-8 border border-[#277579]/20 bg-[#dcece7] p-5 text-sm leading-6"><div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-[#277579]" size={19}/><p><strong>Administrative only.</strong> Any patient-reported conditions, allergies, medications, or procedures are copied as <strong>extracted/unverified</strong> text. This proof does not diagnose, triage, interpret results, or recommend treatment.</p></div></div>
        <div className="mt-8 border border-dashed border-[#277579]/35 bg-white p-6"><label className="flex cursor-pointer items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#102b3d] text-[#a9d9cf]"><Upload size={19}/></span><span><strong className="block">Add a registration or medical-record PDF</strong><span className="mt-1 block text-sm leading-6 text-[#102b3d]/62">Harborview scans labelled administrative and patient-reported candidate fields only. PDF, 10 MB maximum.</span><input className="sr-only" type="file" accept="application/pdf" onChange={(event: ChangeEvent<HTMLInputElement>) => void upload(event.target.files?.[0])}/></span></label>{uploadState === "loading" && <p className="mt-4 text-sm text-[#277579]">Reading labelled candidate fields…</p>}</div>
        {notice && <p className={`mt-4 border-l-2 px-4 py-3 text-sm leading-6 ${uploadState === "error" ? "border-red-500 bg-red-50 text-red-800" : "border-[#277579] bg-white text-[#102b3d]/75"}`}>{notice}</p>}
        <div className="mt-9 grid gap-4 sm:grid-cols-2">{[["displayName", "Full name"],["dateOfBirth", "Date of birth (YYYY-MM-DD)"],["email", "Email"],["phone", "Telephone"],["preferredLanguage", "Preferred language"],["countryOrRegion", "Country or region"],["emergencyContactName", "Emergency contact name"],["emergencyContactPhone", "Emergency contact telephone"]].map(([field, label]) => <label key={field} className="text-sm font-semibold text-[#102b3d]/75">{label}<input value={draft.fields[field] ?? ""} onChange={(event) => setField(field, event.target.value)} className="mt-2 w-full border border-[#102b3d]/15 bg-white px-3 py-3 font-normal outline-none transition focus:border-[#277579]"/></label>)}</div>
        <div className="mt-6 flex flex-wrap gap-3"><button onClick={() => void browseAvailability()} disabled={findingSlots} className="inline-flex items-center gap-2 bg-[#102b3d] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><Search size={16}/>{findingSlots ? "Checking availability…" : "Browse recognition availability"}</button><Link href="/register/review" className="inline-flex items-center gap-2 border border-[#102b3d]/20 bg-white px-5 py-3 text-sm font-semibold">Review local draft <FileText size={16}/></Link></div>
        {slots.length > 0 && <div className="mt-5 grid gap-3 sm:grid-cols-2">{slots.slice(0, 4).map((slot) => <div className="border border-[#102b3d]/12 bg-white p-4" key={slot.id}><p className="font-serif text-lg">{formatAppointmentTime(slot.startsAtUtc)}</p><p className="mt-2 text-xs leading-5 text-[#102b3d]/60">Available to browse. Signing in and confirmation are required before Harborview can request or book a time.</p></div>)}</div>}
      </section>
      <aside className="border border-[#102b3d]/10 bg-[#102b3d] p-7 text-white lg:mt-12"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#a9d9cf]">Local draft status</p><h2 className="mt-3 font-serif text-3xl">{missing.length ? `${missing.length} item${missing.length === 1 ? "" : "s"} still needed` : "Ready for verification"}</h2><p className="mt-3 text-sm leading-6 text-white/67">This browser retains your local draft for this proof. A visitor can prepare information and browse availability, but cannot create a patient account, persist an intake, hold a slot, or book an appointment.</p><ul className="mt-7 space-y-3 text-sm">{required.map((field) => <li className="flex items-center justify-between border-b border-white/10 pb-3" key={field}><span>{field.replace(/([A-Z])/g, " $1")}</span><span className={draft.fields[field] ? "text-[#a9d9cf]" : "text-white/42"}>{draft.fields[field] ? "Prepared" : "Needed"}</span></li>)}</ul><div className="mt-7 border border-white/15 bg-white/8 p-4 text-xs leading-5 text-white/65"><LockKeyhole className="mb-2 text-[#a9d9cf]" size={17}/>To save this information as a registration, Harborview needs a signed-in or verified identity and a staff-confirmed intake process.</div></aside>
    </div><ClientManagedAssistantLoader actor={visitor} conversationId="harborview-visitor-registration-001" pageName="Prospective registration"/>
  </main>;
}
