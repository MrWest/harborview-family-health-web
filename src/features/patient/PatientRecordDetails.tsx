"use client";

// Design: Patient record detail views surface only administrative facts already authorized by Harborview, preserving a calm editorial hierarchy without clinical interpretation.
import Link from "next/link";
import {
  CalendarDays,
  FileText,
  FlaskConical,
  LockKeyhole,
} from "lucide-react";
import { clinicApi } from "@/lib/clinic-api";
import { useClinicResource } from "@/hooks/use-clinic-resource";
import { formatAppointmentTime } from "@/lib/format";

const patient = { mode: "activePatient" as const, id: "portal-patient-001" };

function DetailFrame({
  backHref,
  backLabel,
  eyebrow,
  title,
  children,
}: {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14 lg:px-8">
      <Link
        href={backHref}
        className="text-sm font-semibold text-[#277579] underline decoration-[#a9d9cf] underline-offset-4"
      >
        ← {backLabel}
      </Link>
      <p className="mt-10 text-xs font-bold uppercase tracking-[.22em] text-[#277579]">
        {eyebrow}
      </p>
      <h1 className="mt-4 font-serif text-5xl tracking-[-.045em]">{title}</h1>
      {children}
    </section>
  );
}

function LoadingOrError({
  loading,
  error,
}: {
  loading: boolean;
  error: string | null;
}) {
  if (loading)
    return (
      <p className="mt-10 border border-[#102b3d]/10 bg-white p-6 text-sm text-[#102b3d]/60">
        Loading authorized Harborview record…
      </p>
    );
  if (error)
    return (
      <p className="mt-10 border-l-2 border-red-500 bg-red-50 px-5 py-4 text-sm text-red-800">
        This record is unavailable in the current patient context. {error}
      </p>
    );
  return null;
}

export function PatientAppointmentDetail({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const resource = useClinicResource(
    `patient-appointment:${appointmentId}`,
    () => clinicApi.getMyAppointmentDetail(appointmentId, patient),
    null,
  );
  return (
    <DetailFrame
      backHref="/patient/appointments"
      backLabel="Appointments"
      eyebrow="Patient services · appointment"
      title="Appointment detail"
    >
      <LoadingOrError loading={resource.isLoading} error={resource.error} />
      {resource.data && (
        <div className="mt-10 border border-[#102b3d]/10 bg-white p-7">
          <div className="flex items-start gap-4">
            <CalendarDays className="mt-1 text-[#277579]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#277579]">
                {resource.data.patientVisibleStatus ?? resource.data.status}
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                {resource.data.appointmentType ?? "Administrative appointment"}
              </h2>
              <p className="mt-3 text-sm text-[#102b3d]/65">
                {resource.data.slot
                  ? formatAppointmentTime(resource.data.slot.startsAtUtc)
                  : "Appointment time is being confirmed by Harborview."}
              </p>
            </div>
          </div>
          <dl className="mt-8 grid gap-4 border-t border-[#102b3d]/10 pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[.12em] text-[#102b3d]/45">
                Appointment ID
              </dt>
              <dd className="mt-1 text-sm font-medium">{resource.data.id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[.12em] text-[#102b3d]/45">
                Administrative status
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {resource.data.status}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </DetailFrame>
  );
}

export function PatientLaboratoryReleaseDetail({
  resultReleaseId,
}: {
  resultReleaseId: string;
}) {
  const resource = useClinicResource(
    `patient-laboratory-release:${resultReleaseId}`,
    () => clinicApi.getMyLaboratoryResultDetail(resultReleaseId, patient),
    null,
  );
  return (
    <DetailFrame
      backHref="/patient/results"
      backLabel="Laboratory result status"
      eyebrow="Patient services · laboratory release"
      title="Release detail"
    >
      <LoadingOrError loading={resource.isLoading} error={resource.error} />
      {resource.data && (
        <div className="mt-10 border border-[#102b3d]/10 bg-white p-7">
          <div className="flex items-start gap-4">
            <FlaskConical className="mt-1 text-[#277579]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#277579]">
                {resource.data.releaseStatus}
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                {resource.data.serviceName}
              </h2>
              <p className="mt-3 text-sm text-[#102b3d]/65">
                Reference {resource.data.resultReference} · Collected{" "}
                {formatAppointmentTime(resource.data.collectedAtUtc)}
              </p>
            </div>
          </div>
          {resource.data.releaseStatus === "Released" &&
          resource.data.portalDocumentUrl ? (
            <a
              href={resource.data.portalDocumentUrl}
              className="mt-7 inline-block text-sm font-bold text-[#277579] underline decoration-[#a9d9cf] underline-offset-4"
            >
              Open Harborview release
            </a>
          ) : (
            <p className="mt-7 text-sm text-[#102b3d]/60">
              This result has not been released yet.
            </p>
          )}
          <div className="mt-8 flex gap-3 border-t border-[#102b3d]/10 pt-6 text-sm leading-6 text-[#102b3d]/65">
            <LockKeyhole className="shrink-0 text-[#277579]" size={18} />
            <p>
              Harborview provides release status and a portal link only. This
              page never interprets laboratory information or provides medical
              advice.
            </p>
          </div>
        </div>
      )}
    </DetailFrame>
  );
}

export function PatientDocumentRequestDetail({
  documentRequestId,
}: {
  documentRequestId: string;
}) {
  const resource = useClinicResource(
    `patient-document-request:${documentRequestId}`,
    () => clinicApi.getMyDocumentRequestDetail(documentRequestId, patient),
    null,
  );
  return (
    <DetailFrame
      backHref="/patient/intake"
      backLabel="Document requests"
      eyebrow="Patient services · document request"
      title="Document request detail"
    >
      <LoadingOrError loading={resource.isLoading} error={resource.error} />
      {resource.data && (
        <div className="mt-10 border border-[#102b3d]/10 bg-white p-7">
          <div className="flex items-start gap-4">
            <FileText className="mt-1 text-[#277579]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#277579]">
                {resource.data.status}
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                {resource.data.category}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#102b3d]/65">
                {resource.data.patientVisibleLabel}
              </p>
            </div>
          </div>
          {resource.data.dueAtUtc && (
            <p className="mt-8 border-t border-[#102b3d]/10 pt-6 text-xs font-semibold uppercase tracking-[.12em] text-[#102b3d]/50">
              Requested by{" "}
              {new Date(resource.data.dueAtUtc).toLocaleDateString("en-CA")}
            </p>
          )}
        </div>
      )}
    </DetailFrame>
  );
}
