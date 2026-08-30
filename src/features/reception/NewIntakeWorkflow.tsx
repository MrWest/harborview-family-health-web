"use client";

// Design: Reception’s operations canvas uses clear sequence markers, restrained contrast, and dense-but-legible administrative evidence—never a clinical diagnosis interface.
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  FileSearch,
  LoaderCircle,
  SearchCheck,
  ShieldCheck,
  Trash2,
  Upload,
  UserRoundPlus,
} from "lucide-react";
import { ClientManagedAssistantLoader } from "@/components/directiv/ClientManagedAssistantLoader";
import { clinicApi } from "@/lib/clinic-api";
import type {
  AppointmentSlot,
  IntakeCase,
  Patient,
  RegistrationDraft,
} from "@/lib/clinic-types";
import { formatAppointmentTime } from "@/lib/format";

const receptionist = { mode: "receptionist" as const, id: "receptionist-001" };
const intakeStorageKey = "harborview:reception-intake-draft";
const requiredFields = [
  "displayName",
  "dateOfBirth",
  "email",
  "phone",
  "preferredLanguage",
  "emergencyContactName",
  "emergencyContactPhone",
];
const specialtyOptions = [
  "Family Medicine",
  "Pediatrics",
  "Women's Health",
  "Dermatology",
];

type LocalDraft = {
  fields: Record<string, string>;
  extractedFields?: string[];
};

type FormField = {
  key: string;
  label: string;
  required?: boolean;
  input?: "text" | "email" | "tel" | "date" | "textarea";
  helper?: string;
};

const formSections: Array<{
  title: string;
  description: string;
  fields: FormField[];
}> = [
  {
    title: "Personal details",
    description:
      "Use the name and contact information as presented by the patient or referring source.",
    fields: [
      { key: "displayName", label: "Full legal name", required: true },
      {
        key: "dateOfBirth",
        label: "Date of birth",
        required: true,
        input: "date",
      },
      { key: "preferredLanguage", label: "Preferred language", required: true },
      { key: "countryOrRegion", label: "Country or region" },
      { key: "email", label: "Email", required: true, input: "email" },
      { key: "phone", label: "Telephone", required: true, input: "tel" },
    ],
  },
  {
    title: "Contact and address",
    description: "Administrative contact details for follow-up and coordination.",
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
    description:
      "Required for intake. Verify with the patient before finalising.",
    fields: [
      {
        key: "emergencyContactName",
        label: "Emergency contact name",
        required: true,
      },
      { key: "emergencyContactRelationship", label: "Relationship" },
      {
        key: "emergencyContactPhone",
        label: "Emergency contact telephone",
        required: true,
        input: "tel",
      },
    ],
  },
  {
    title: "Coverage and referral",
    description: "Optional administrative details for intake coordination.",
    fields: [
      { key: "payerOrPlan", label: "Payer or coverage plan" },
      { key: "memberOrPolicyNumber", label: "Member or policy number" },
      { key: "referralSource", label: "Referral source or referring provider" },
      {
        key: "reasonForVisit",
        label: "Administrative reason for visit",
        input: "textarea",
      },
    ],
  },
  {
    title: "Patient-reported information",
    description:
      "Optional text retained only as extracted/unverified patient-reported information. Never used for diagnosis, triage, or treatment decisions.",
    fields: [
      {
        key: "patientReportedConditions",
        label: "Patient-reported conditions",
        input: "textarea",
        helper: "Extracted/unverified; not a diagnosis.",
      },
      {
        key: "patientReportedAllergies",
        label: "Patient-reported allergies",
        input: "textarea",
        helper: "Extracted/unverified; not a clinical decision.",
      },
      {
        key: "patientReportedMedications",
        label: "Patient-reported medications",
        input: "textarea",
        helper: "Extracted/unverified; no medication guidance is provided.",
      },
      {
        key: "patientReportedProcedures",
        label: "Patient-reported procedures",
        input: "textarea",
        helper: "Extracted/unverified; no clinical interpretation is provided.",
      },
    ],
  },
];

function CandidateTag({ isCandidate }: { isCandidate: boolean }) {
  if (!isCandidate) return null;
  return (
    <span className="ml-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#277579]">
      PDF candidate · review
    </span>
  );
}

export function NewIntakeWorkflow() {
  const [localDraft, setLocalDraft] = useState<LocalDraft>({
    fields: { preferredLanguage: "English" },
    extractedFields: [],
  });
  const [draft, setDraft] = useState<RegistrationDraft | null>(null);
  const [matches, setMatches] = useState<Patient[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | undefined>();
  const [specialty, setSpecialty] = useState("Family Medicine");
  const [intake, setIntake] = useState<{
    patient: Patient;
    intake: IntakeCase;
  } | null>(null);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [pdfPrefillOpen, setPdfPrefillOpen] = useState(false);
  const [clearConfirmationOpen, setClearConfirmationOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    tone: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(intakeStorageKey);
    if (saved) setLocalDraft(JSON.parse(saved) as LocalDraft);
  }, []);

  useEffect(() => {
    const onAssistantUpdate = (event: Event) =>
      setLocalDraft((event as CustomEvent<LocalDraft>).detail);
    window.addEventListener(
      "harborview:reception-intake-draft-updated",
      onAssistantUpdate,
    );
    return () =>
      window.removeEventListener(
        "harborview:reception-intake-draft-updated",
        onAssistantUpdate,
      );
  }, []);

  useEffect(() => {
    const hasData = Object.values(localDraft.fields).some(
      (v) => v.trim().length > 0,
    );
    if (hasData)
      window.localStorage.setItem(intakeStorageKey, JSON.stringify(localDraft));
    else window.localStorage.removeItem(intakeStorageKey);
  }, [localDraft]);

  const missing = useMemo(
    () => requiredFields.filter((field) => !localDraft.fields[field]?.trim()),
    [localDraft.fields],
  );
  const candidateFields = new Set(localDraft.extractedFields ?? []);

  const setField = (field: string, value: string) =>
    setLocalDraft((current) => ({
      ...current,
      fields: { ...current.fields, [field]: value },
      extractedFields: (current.extractedFields ?? []).filter(
        (item) => item !== field,
      ),
    }));

  async function extractFromPdf(file?: File) {
    if (!file) return;
    setBusy("document");
    setNotice(null);
    try {
      const result = await clinicApi.extractRegistrationDocument(
        file,
        receptionist,
      );
      const accepted = Object.entries(result.candidateFields).filter(
        ([, v]) => Boolean(v?.trim()),
      );
      setLocalDraft((current) => ({
        ...current,
        fields: {
          ...current.fields,
          ...Object.fromEntries(accepted.map(([k, v]) => [k, v ?? ""])),
        },
        extractedFields: accepted.map(([k]) => k),
      }));
      setNotice({
        tone: "info",
        text: `${accepted.length} candidate field${accepted.length === 1 ? " was" : "s were"} copied into the form. Review each PDF candidate before creating the draft. All patient-reported values remain extracted/unverified.`,
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "PDF extraction did not complete.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function createDraftFromForm() {
    setBusy("draft");
    setNotice(null);
    try {
      const allFieldKeys = formSections.flatMap((s) =>
        s.fields.map((f) => f.key),
      );
      const candidateFieldsRecord: Record<string, string | null> =
        Object.fromEntries(
          allFieldKeys.map((key) => [key, localDraft.fields[key] ?? null]),
        );
      const created = await clinicApi.createRegistrationDraft(
        candidateFieldsRecord,
        missing,
        undefined,
        receptionist,
      );
      setDraft(created);
      setNotice({
        tone: "success",
        text: "Registration draft was created from the form. Reception may now review for possible duplicates.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "No registration draft was created.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function reviewDuplicates() {
    if (!draft) return;
    setBusy("duplicates");
    setNotice(null);
    try {
      const found = await clinicApi.getReceptionDuplicateMatches(
        draft.id,
        receptionist,
      );
      setMatches(found);
      setNotice({
        tone: "info",
        text: found.length
          ? "Possible duplicates were returned for staff review. Select one only when the match is confirmed."
          : "No possible duplicate match was returned. Reception may create a new patient after review.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Duplicate review did not run.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function createIntake() {
    if (!draft) return;
    setBusy("intake");
    setNotice(null);
    try {
      const created = await clinicApi.createReceptionIntake(
        draft.id,
        specialty,
        receptionist,
        selectedMatch,
      );
      setIntake(created);
      setNotice({
        tone: "success",
        text: "Patient and intake were created. Reception may now search the earliest suitable recognition appointment; booking still needs an explicit confirmation.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "No patient or intake was created.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function searchEarliest() {
    setBusy("slots");
    setNotice(null);
    try {
      const found = await clinicApi.searchRecognitionSlots(
        specialty,
        receptionist,
      );
      setSlots(found);
      setNotice({
        tone: "info",
        text: found.length
          ? "Earliest currently available recognition times are shown below. Selecting a time does not book it."
          : "No currently available recognition times were returned.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Availability search did not complete.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function confirmBooking() {
    if (!intake || !selectedSlot || !confirmed) return;
    setBusy("book");
    setNotice(null);
    try {
      const appointment = await clinicApi.bookRecognitionAppointment(
        intake.patient.id,
        intake.intake.id,
        selectedSlot,
        receptionist,
      );
      setNotice({
        tone: "success",
        text: `Recognition appointment ${appointment.id} was confirmed by reception.`,
      });
      setSlots((current) => current.filter((slot) => slot.id !== selectedSlot));
      setSelectedSlot(null);
      setConfirmed(false);
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error ? error.message : "No appointment was booked.",
      });
    } finally {
      setBusy(null);
    }
  }

  function clearLocalForm() {
    const empty: LocalDraft = { fields: {}, extractedFields: [] };
    window.localStorage.removeItem(intakeStorageKey);
    setLocalDraft(empty);
    setNotice({
      tone: "info",
      text: "The browser-local intake form was cleared. No patient, draft, intake, or appointment was deleted.",
    });
    setClearConfirmationOpen(false);
    window.dispatchEvent(
      new CustomEvent("harborview:reception-intake-draft-updated", {
        detail: empty,
      }),
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#277579]">
            Reception · new patient intake
          </p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-.045em]">
            Fill the form, then hand off.
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#102b3d]/68">
            Complete the intake form directly or ask the assistant to pre-fill
            it. When all required fields are ready, create a draft to begin
            duplicate review and recognition coordination.
          </p>
        </div>
        <div className="flex items-center gap-2 border border-[#277579]/20 bg-[#dcece7] px-4 py-3 text-xs font-semibold text-[#1a5a5d]">
          <ShieldCheck size={17} /> Administrative workflow only
        </div>
      </section>

      {notice && (
        <div
          className={`border-l-2 px-5 py-4 text-sm leading-6 ${notice.tone === "error" ? "border-red-500 bg-red-50 text-red-800" : notice.tone === "success" ? "border-[#277579] bg-[#dcece7] text-[#174d50]" : "border-[#102b3d]/30 bg-white text-[#102b3d]/70"}`}
        >
          {notice.text}
        </div>
      )}

      {/* Step 1 — Form */}
      <section className="border border-[#102b3d]/10 bg-white p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#102b3d] text-[#a9d9cf]">
            1
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#277579]">
              Patient intake form
            </p>
            <h2 className="mt-2 font-serif text-3xl">
              Enter or confirm patient details
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-10 xl:grid-cols-[1.45fr_.55fr]">
          <div>
            <div className="space-y-10">
              {formSections.map((section) => (
                <section
                  className="border-t border-[#102b3d]/12 pt-7"
                  key={section.title}
                >
                  <div className="max-w-2xl">
                    <h3 className="font-serif text-2xl tracking-[-.03em]">
                      {section.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#102b3d]/62">
                      {section.description}
                    </p>
                  </div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {section.fields.map((field) => (
                      <label
                        className={
                          field.input === "textarea" ? "sm:col-span-2" : ""
                        }
                        key={field.key}
                      >
                        <span className="text-sm font-semibold text-[#102b3d]/78">
                          {field.label}
                          {field.required && (
                            <span className="ml-1 text-[#277579]">*</span>
                          )}
                          <CandidateTag
                            isCandidate={candidateFields.has(field.key)}
                          />
                        </span>
                        {field.input === "textarea" ? (
                          <textarea
                            value={localDraft.fields[field.key] ?? ""}
                            onChange={(e) => setField(field.key, e.target.value)}
                            rows={4}
                            className="mt-2 w-full resize-y border border-[#102b3d]/15 bg-[#f7f7f2] px-3 py-3 text-sm font-normal leading-6 outline-none transition focus:border-[#277579]"
                          />
                        ) : (
                          <input
                            type={field.input ?? "text"}
                            value={localDraft.fields[field.key] ?? ""}
                            onChange={(e) => setField(field.key, e.target.value)}
                            className="mt-2 w-full border border-[#102b3d]/15 bg-[#f7f7f2] px-3 py-3 text-sm font-normal outline-none transition focus:border-[#277579]"
                          />
                        )}
                        {field.helper && (
                          <span className="mt-2 block text-xs leading-5 text-[#277579]">
                            {field.helper}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* PDF prefill — secondary option */}
            <div className="mt-8 border border-[#102b3d]/10">
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-[#102b3d]/70"
                onClick={() => setPdfPrefillOpen((v) => !v)}
              >
                <span className="flex items-center gap-2">
                  <Upload size={15} />
                  Prefill from a registration PDF
                </span>
                <ChevronDown
                  size={15}
                  className={`transition-transform ${pdfPrefillOpen ? "rotate-180" : ""}`}
                />
              </button>
              {pdfPrefillOpen && (
                <div className="border-t border-[#102b3d]/10 px-5 pb-5 pt-4">
                  <label className="flex cursor-pointer gap-4 border border-dashed border-[#277579]/35 p-4">
                    <Upload className="shrink-0 text-[#277579]" />
                    <span>
                      <strong className="block text-sm">
                        Upload source PDF to prefill fields
                      </strong>
                      <span className="mt-1 block text-xs leading-5 text-[#102b3d]/60">
                        Extracted candidate values are copied into the form
                        above and marked for review. The PDF is not sent to
                        Directiv.
                      </span>
                      <input
                        className="sr-only"
                        type="file"
                        accept="application/pdf"
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          void extractFromPdf(event.target.files?.[0])
                        }
                      />
                    </span>
                  </label>
                  {busy === "document" && (
                    <p className="mt-4 flex items-center gap-2 text-sm text-[#277579]">
                      <LoaderCircle className="animate-spin" size={16} />{" "}
                      Reading candidate fields…
                    </p>
                  )}
                  <p className="mt-4 text-xs leading-5 text-[#102b3d]/55">
                    Any patient-reported condition, allergy, medication, or
                    procedure is retained only as{" "}
                    <strong>extracted/unverified</strong> text. Do not use this
                    proof for diagnosis, triage, interpretation, urgency, or
                    treatment decisions.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={missing.length > 0 || busy === "draft" || !!draft}
                onClick={() => void createDraftFromForm()}
                className="inline-flex items-center gap-2 bg-[#102b3d] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                <UserRoundPlus size={16} />
                {busy === "draft"
                  ? "Creating draft…"
                  : draft
                    ? "Draft created"
                    : "Create intake draft"}
              </button>
              <button
                type="button"
                onClick={() => setClearConfirmationOpen(true)}
                className="inline-flex items-center gap-2 border border-red-800/25 bg-white px-5 py-3 text-sm font-semibold text-red-800"
              >
                <Trash2 size={16} />
                Clear form
              </button>
            </div>

            {clearConfirmationOpen && (
              <section
                className="mt-4 border border-red-800/25 bg-red-50 p-5"
                aria-live="polite"
              >
                <p className="font-semibold text-red-950">
                  Clear this browser-local intake form?
                </p>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-red-950/72">
                  This removes values and PDF candidate markers from this
                  browser only. It does not delete a draft, patient, intake, or
                  appointment already created in Harborview.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={clearLocalForm}
                    className="bg-red-800 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Yes, clear form
                  </button>
                  <button
                    type="button"
                    onClick={() => setClearConfirmationOpen(false)}
                    className="border border-red-800/25 bg-white px-4 py-2 text-sm font-semibold text-red-900"
                  >
                    Keep form
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Form status sidebar */}
          <aside className="h-fit border border-[#102b3d]/10 bg-[#102b3d] p-7 text-white xl:sticky xl:top-8">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#a9d9cf]">
              Form status
            </p>
            <h3 className="mt-3 font-serif text-3xl">
              {missing.length
                ? `${missing.length} required item${missing.length === 1 ? "" : "s"} still needed`
                : draft
                  ? "Draft created"
                  : "Ready to create draft"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/67">
              Fill all required fields, then create a registration draft to
              proceed to duplicate review and recognition coordination.
            </p>
            <ul className="mt-7 space-y-3 text-sm">
              {requiredFields.map((field) => (
                <li
                  className="flex items-center justify-between border-b border-white/10 pb-3"
                  key={field}
                >
                  <span>{field.replace(/([A-Z])/g, " $1")}</span>
                  <span
                    className={
                      localDraft.fields[field]
                        ? "text-[#a9d9cf]"
                        : "text-white/42"
                    }
                  >
                    {localDraft.fields[field] ? "Ready" : "Needed"}
                  </span>
                </li>
              ))}
            </ul>
            {draft && (
              <div className="mt-7 border border-white/15 bg-white/8 p-4 text-xs leading-5 text-white/65">
                Draft <strong className="text-white">{draft.id}</strong> is
                ready for duplicate review below.
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Steps 2 and 3 */}
      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <section className="border border-[#102b3d]/10 bg-[#102b3d] p-6 text-white">
          <div className="flex items-start gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#a9d9cf] text-[#102b3d]">
              2
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a9d9cf]">
                Duplicate review
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                Match before creating
              </h2>
            </div>
          </div>
          <p className="mt-6 text-sm leading-6 text-white/65">
            Search is limited to reception. Treat every returned record as a
            possible match, not proof of identity.
          </p>
          <button
            disabled={!draft || busy === "duplicates"}
            onClick={() => void reviewDuplicates()}
            className="mt-6 inline-flex items-center gap-2 bg-white px-4 py-3 text-sm font-semibold text-[#102b3d] disabled:opacity-40"
          >
            <SearchCheck size={16} />
            {busy === "duplicates"
              ? "Reviewing…"
              : "Review possible duplicates"}
          </button>
          {matches.length > 0 && (
            <div className="mt-5 space-y-2">
              {matches.map((patient) => (
                <label
                  className={`block border p-3 text-sm ${selectedMatch === patient.id ? "border-[#a9d9cf] bg-white/12" : "border-white/15"}`}
                  key={patient.id}
                >
                  <input
                    className="mr-3"
                    type="radio"
                    name="match"
                    checked={selectedMatch === patient.id}
                    onChange={() => setSelectedMatch(patient.id)}
                  />
                  <strong>{patient.displayName}</strong>
                  <span className="ml-2 text-white/58">
                    {patient.dateOfBirth} · {patient.email}
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="mt-8 border-t border-white/15 pt-6">
            <label className="text-xs font-bold uppercase tracking-[.16em] text-white/55">
              Requested recognition care area
              <select
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                className="mt-2 block w-full bg-white px-3 py-3 text-sm text-[#102b3d]"
              >
                {specialtyOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <button
              disabled={!draft || busy === "intake"}
              onClick={() => void createIntake()}
              className="mt-4 inline-flex items-center gap-2 bg-[#277579] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              <UserRoundPlus size={16} />
              {busy === "intake"
                ? "Creating…"
                : selectedMatch
                  ? "Use reviewed patient & create intake"
                  : "Create patient & intake"}
            </button>
          </div>
        </section>

        <section className="border border-[#102b3d]/10 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#dcece7] text-[#277579]">
                3
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#277579]">
                  Recognition coordination
                </p>
                <h2 className="mt-2 font-serif text-3xl">
                  Find earliest, then confirm explicitly.
                </h2>
              </div>
            </div>
            <button
              disabled={!intake || busy === "slots"}
              onClick={() => void searchEarliest()}
              className="inline-flex items-center gap-2 border border-[#102b3d]/20 px-4 py-3 text-sm font-semibold disabled:opacity-40"
            >
              <FileSearch size={16} />
              {busy === "slots" ? "Searching…" : "Find earliest recognition time"}
            </button>
          </div>
          {intake && (
            <p className="mt-5 text-sm text-[#102b3d]/65">
              Working intake <strong>{intake.intake.id}</strong> for{" "}
              <strong>{intake.patient.displayName}</strong>. This record is now
              owned by Harborview; it originated from a reviewed draft.
            </p>
          )}
          {slots.length > 0 && (
            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {slots.slice(0, 9).map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`border p-4 text-left transition ${selectedSlot === slot.id ? "border-[#277579] bg-[#dcece7]" : "border-[#102b3d]/12 hover:border-[#277579]/40"}`}
                >
                  <CalendarCheck2 className="text-[#277579]" size={18} />
                  <strong className="mt-3 block text-sm">
                    {formatAppointmentTime(slot.startsAtUtc)}
                  </strong>
                  <span className="mt-2 block text-xs text-[#102b3d]/60">
                    Select only after confirming the patient, intake, and care
                    area.
                  </span>
                </button>
              ))}
            </div>
          )}
          {selectedSlot && (
            <div className="mt-6 flex flex-wrap items-center gap-4 border border-[#277579]/25 bg-[#dcece7] p-5">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                />
                I confirm the patient, intake, and selected recognition time
                have been reviewed.
              </label>
              <button
                disabled={!confirmed || busy === "book"}
                onClick={() => void confirmBooking()}
                className="inline-flex items-center gap-2 bg-[#102b3d] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                <CheckCircle2 size={16} />
                {busy === "book" ? "Booking…" : "Confirm booking"}
              </button>
            </div>
          )}
        </section>
      </div>

      <ClientManagedAssistantLoader
        actor={receptionist}
        conversationId="harborview-new-intake-001"
        pageName="Reception new patient intake"
      />
    </div>
  );
}
