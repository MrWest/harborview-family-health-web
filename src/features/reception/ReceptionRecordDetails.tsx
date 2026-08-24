"use client";

// Design: Reception detail views reveal administrative workflow evidence and access context, never turning the proof into a diagnostic or clinical-record interface.
import Link from "next/link";
import { CalendarDays, ClipboardList, FileSearch, UserRound } from "lucide-react";
import { clinicApi } from "@/lib/clinic-api";
import { useClinicResource } from "@/hooks/use-clinic-resource";
import { formatAppointmentTime } from "@/lib/format";

const receptionist = { mode: "receptionist" as const, id: "receptionist-001" };

function DetailFrame({ backHref, backLabel, eyebrow, title, children }: { backHref: string; backLabel: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return <section><Link href={backHref} className="text-sm font-semibold text-[#277579] underline decoration-[#a9d9cf] underline-offset-4">← {backLabel}</Link><p className="mt-10 text-xs font-bold uppercase tracking-[.22em] text-[#277579]">{eyebrow}</p><h1 className="mt-4 font-serif text-5xl tracking-[-.045em]">{title}</h1>{children}</section>;
}

function LoadingOrError({ loading, error }: { loading: boolean; error: string | null }) {
  if (loading) return <p className="mt-10 border border-[#102b3d]/10 bg-white p-6 text-sm text-[#102b3d]/60">Loading authorized Harborview administrative record…</p>;
  if (error) return <p className="mt-10 border-l-2 border-red-500 bg-red-50 px-5 py-4 text-sm text-red-800">This record is unavailable in the current reception context. {error}</p>;
  return null;
}

export function ReceptionDraftDetail({ draftId }: { draftId: string }) {
  const resource = useClinicResource(`reception-draft:${draftId}`, () => clinicApi.getReceptionDraftDetail(draftId, receptionist), null);
  const fields = resource.data ? Object.entries(JSON.parse(resource.data.candidateFieldsJson || "{}") as Record<string, string | null>).filter(([, value]) => value) : [];
  return <DetailFrame backHref="/reception/new-intake" backLabel="New intake" eyebrow="Reception · registration draft" title="Draft detail"><LoadingOrError loading={resource.isLoading} error={resource.error}/>{resource.data && <div className="mt-10 border border-[#102b3d]/10 bg-white p-7"><div className="flex items-start gap-4"><FileSearch className="mt-1 text-[#277579]"/><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#277579]">{resource.data.status}</p><h2 className="mt-2 font-serif text-3xl">Reviewed candidate fields</h2><p className="mt-3 text-sm leading-6 text-[#102b3d]/65">Every item remains extracted/unverified until a receptionist confirms it. This view does not provide clinical interpretation.</p></div></div><dl className="mt-8 divide-y divide-[#102b3d]/10 border-y border-[#102b3d]/10">{fields.map(([key, value]) => <div className="grid grid-cols-[.8fr_1.2fr] gap-4 py-3 text-sm" key={key}><dt className="capitalize text-[#102b3d]/55">{key.replace(/([A-Z])/g, " $1")}</dt><dd>{value}</dd></div>)}</dl></div>}</DetailFrame>;
}

export function ReceptionPatientDetail({ patientId }: { patientId: string }) {
  const resource = useClinicResource(`reception-patient:${patientId}`, () => clinicApi.getReceptionPatientDetail(patientId, receptionist), null);
  return <DetailFrame backHref="/reception/patients" backLabel="Patients" eyebrow="Reception · patient" title="Administrative patient profile"><LoadingOrError loading={resource.isLoading} error={resource.error}/>{resource.data && <div className="mt-10 border border-[#102b3d]/10 bg-white p-7"><div className="flex items-start gap-4"><UserRound className="mt-1 text-[#277579]"/><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#277579]">{resource.data.registrationStatus ?? "Administrative profile"}</p><h2 className="mt-2 font-serif text-3xl">{resource.data.displayName}</h2><p className="mt-3 text-sm text-[#102b3d]/65">{resource.data.email ?? "No email recorded"} · {resource.data.phone ?? "No phone recorded"}</p></div></div><dl className="mt-8 grid gap-4 border-t border-[#102b3d]/10 pt-6 sm:grid-cols-2"><div><dt className="text-xs uppercase tracking-[.12em] text-[#102b3d]/45">Preferred language</dt><dd className="mt-1 text-sm font-medium">{resource.data.preferredLanguage ?? "Not recorded"}</dd></div><div><dt className="text-xs uppercase tracking-[.12em] text-[#102b3d]/45">Contact preference</dt><dd className="mt-1 text-sm font-medium">{resource.data.preferredContactMethod}</dd></div></dl></div>}</DetailFrame>;
}

export function ReceptionIntakeDetail({ intakeCaseId }: { intakeCaseId: string }) {
  const resource = useClinicResource(`reception-intake:${intakeCaseId}`, () => clinicApi.getReceptionIntakeDetail(intakeCaseId, receptionist), null);
  return <DetailFrame backHref="/reception/new-intake" backLabel="New intake" eyebrow="Reception · recognition intake" title="Intake detail"><LoadingOrError loading={resource.isLoading} error={resource.error}/>{resource.data && <div className="mt-10 border border-[#102b3d]/10 bg-white p-7"><div className="flex items-start gap-4"><ClipboardList className="mt-1 text-[#277579]"/><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#277579]">{resource.data.intake.status}</p><h2 className="mt-2 font-serif text-3xl">{resource.data.intake.requestedSpecialty}</h2><p className="mt-3 text-sm text-[#102b3d]/65">Patient: {resource.data.patient?.displayName ?? "Administrative record unavailable"}</p></div></div><p className="mt-8 border-t border-[#102b3d]/10 pt-6 text-sm text-[#102b3d]/65">Missing administrative items: {resource.data.intake.missingItemsJson}</p></div>}</DetailFrame>;
}

export function ReceptionAppointmentDetail({ appointmentId }: { appointmentId: string }) {
  const resource = useClinicResource(`reception-appointment:${appointmentId}`, () => clinicApi.getReceptionAppointmentDetail(appointmentId, receptionist), null);
  return <DetailFrame backHref="/reception/schedule" backLabel="Schedule" eyebrow="Reception · appointment" title="Appointment detail"><LoadingOrError loading={resource.isLoading} error={resource.error}/>{resource.data && <div className="mt-10 border border-[#102b3d]/10 bg-white p-7"><div className="flex items-start gap-4"><CalendarDays className="mt-1 text-[#277579]"/><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#277579]">{resource.data.patientVisibleStatus ?? resource.data.status}</p><h2 className="mt-2 font-serif text-3xl">{resource.data.appointmentType ?? "Administrative appointment"}</h2><p className="mt-3 text-sm text-[#102b3d]/65">{resource.data.slot ? formatAppointmentTime(resource.data.slot.startsAtUtc) : "Appointment slot is not available."}</p></div></div><dl className="mt-8 grid gap-4 border-t border-[#102b3d]/10 pt-6 sm:grid-cols-2"><div><dt className="text-xs uppercase tracking-[.12em] text-[#102b3d]/45">Patient ID</dt><dd className="mt-1 text-sm font-medium">{resource.data.patientId}</dd></div><div><dt className="text-xs uppercase tracking-[.12em] text-[#102b3d]/45">Staff review</dt><dd className="mt-1 text-sm font-medium">{resource.data.staffReviewRequired ? "Required" : "Not required"}</dd></div></dl></div>}</DetailFrame>;
}
