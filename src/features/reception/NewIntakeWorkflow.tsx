"use client";

// Design: Reception’s operations canvas uses clear sequence markers, restrained contrast, and dense-but-legible administrative evidence—never a clinical diagnosis interface.
import { ChangeEvent, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CheckCircle2,
  FileSearch,
  LoaderCircle,
  SearchCheck,
  ShieldCheck,
  Upload,
  UserRoundPlus,
} from "lucide-react";
import { clinicApi } from "@/lib/clinic-api";
import type {
  AppointmentSlot,
  ExtractedDocument,
  IntakeCase,
  Patient,
  RegistrationDraft,
} from "@/lib/clinic-types";
import { formatAppointmentTime } from "@/lib/format";

const receptionist = { mode: "receptionist" as const, id: "receptionist-001" };
const specialtyOptions = [
  "Family Medicine",
  "Pediatrics",
  "Women’s Health",
  "Dermatology",
];

export function NewIntakeWorkflow() {
  const [extracted, setExtracted] = useState<ExtractedDocument | null>(null);
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
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    tone: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const candidateEntries = useMemo(
    () =>
      Object.entries(extracted?.candidateFields ?? {}).filter(
        ([, value]) => value,
      ),
    [extracted],
  );

  async function uploadAndCreateDraft(file?: File) {
    if (!file) return;
    setBusy("document");
    setNotice(null);
    try {
      const result = await clinicApi.extractRegistrationDocument(
        file,
        receptionist,
      );
      setExtracted(result);
      const created = await clinicApi.createRegistrationDraft(
        result.candidateFields,
        result.missingFields,
        result.documentId,
        receptionist,
      );
      setDraft(created);
      setNotice({
        tone: "success",
        text: "PDF candidate fields were copied into a Harborview registration draft. All values remain extracted/unverified until reception reviews them.",
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
        text: `Patient and intake were created. Reception may now search the earliest suitable recognition appointment; booking still needs an explicit confirmation.`,
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

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#277579]">
            Reception · new patient intake
          </p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-.045em]">
            Make the handoff explicit.
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#102b3d]/68">
            A receptionist may use a PDF to prepare a draft, review duplicates,
            create the patient/intake record, locate the earliest recognition
            time, and book only after staff confirmation.
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
      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <section className="border border-[#102b3d]/10 bg-white p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#102b3d] text-[#a9d9cf]">
              1
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#277579]">
                PDF-assisted draft
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                Receive and review source text
              </h2>
            </div>
          </div>
          <label className="mt-7 flex cursor-pointer gap-4 border border-dashed border-[#277579]/35 p-5">
            <Upload className="shrink-0 text-[#277579]" />
            <span>
              <strong className="block text-sm">
                Upload registration or source PDF
              </strong>
              <span className="mt-1 block text-xs leading-5 text-[#102b3d]/60">
                Harborview stores source-document metadata and candidate fields;
                Directiv only processes the document.
              </span>
              <input
                className="sr-only"
                type="file"
                accept="application/pdf"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  void uploadAndCreateDraft(event.target.files?.[0])
                }
              />
            </span>
          </label>
          {busy === "document" && (
            <p className="mt-4 flex items-center gap-2 text-sm text-[#277579]">
              <LoaderCircle className="animate-spin" size={16} /> Preparing
              draft…
            </p>
          )}
          {extracted && (
            <div className="mt-6 divide-y divide-[#102b3d]/10 border-y border-[#102b3d]/10">
              {candidateEntries.length ? (
                candidateEntries.map(([key, value]) => (
                  <div
                    className="grid grid-cols-[.8fr_1.2fr] gap-4 py-3 text-xs"
                    key={key}
                  >
                    <span className="capitalize text-[#102b3d]/55">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span>{value}</span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-sm text-[#102b3d]/60">
                  No labelled candidate text was extracted; collect the required
                  administrative fields directly.
                </p>
              )}
            </div>
          )}
          <p className="mt-5 text-xs leading-5 text-[#102b3d]/55">
            Any patient-reported condition, allergy, medication, or procedure is
            retained only as <strong>extracted/unverified</strong> text. Do not
            use this proof for diagnosis, triage, interpretation, urgency, or
            treatment decisions.
          </p>
        </section>
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
      </div>
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
              I confirm the patient, intake, and selected recognition time have
              been reviewed.
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
  );
}
