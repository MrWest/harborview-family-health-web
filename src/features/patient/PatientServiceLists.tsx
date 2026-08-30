"use client";

// Design: Tabular patient information is intentionally rendered as editorial lists rather than opaque dashboards, keeping sensitive administrative status legible and calm.
import { FileText, FlaskConical, LockKeyhole } from "lucide-react";
import { clinicApi } from "@/lib/clinic-api";
import { useClinicResource } from "@/hooks/use-clinic-resource";
import { formatAppointmentTime } from "@/lib/format";

const patient = { mode: "activePatient" as const, id: "portal-patient-001" };

export function LaboratoryResultList() {
  const resource = useClinicResource(
    "my-laboratory-results",
    () => clinicApi.getMyLaboratoryResults(patient),
    [],
  );
  return (
    <section className="mx-auto max-w-5xl px-5 py-14 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[.22em] text-[#277579]">
        Patient services
      </p>
      <h1 className="mt-4 font-serif text-5xl tracking-[-.045em]">
        Laboratory result status
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#102b3d]/68">
        Harborview shows only the release status and a portal link when
        available. It does not interpret laboratory results or provide medical
        advice.
      </p>
      <div className="mt-10 divide-y divide-[#102b3d]/10 border-y border-[#102b3d]/10 bg-white">
        {resource.data.map((result) => (
          <article
            className="grid gap-4 px-5 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center"
            key={result.id}
          >
            <FlaskConical className="text-[#277579]" />
            <div>
              <h2 className="font-serif text-2xl">{result.serviceName}</h2>
              <p className="mt-1 text-sm text-[#102b3d]/60">
                Reference {result.resultReference} · Collected{" "}
                {formatAppointmentTime(result.collectedAtUtc)}
              </p>
            </div>
            {result.releaseStatus === "Released" && result.portalDocumentUrl ? (
              <a
                className="text-sm font-bold text-[#277579] underline decoration-[#a9d9cf] underline-offset-4"
                href={result.portalDocumentUrl}
              >
                Open release
              </a>
            ) : (
              <span className="text-sm font-semibold text-[#102b3d]/55">
                Not yet released
              </span>
            )}
          </article>
        ))}
        {!resource.isLoading && resource.data.length === 0 && (
          <p className="px-5 py-8 text-sm text-[#102b3d]/60">
            No laboratory result status is available in this proof account.
          </p>
        )}
      </div>
      <div className="mt-6 flex gap-3 border border-[#277579]/20 bg-[#dcece7] p-5 text-sm leading-6">
        <LockKeyhole className="shrink-0 text-[#277579]" size={18} />
        <p>
          Results are visible only to the signed-in patient who owns the
          release. The assistant may report whether a result has been released,
          but never interpret it.
        </p>
      </div>
    </section>
  );
}

export function PatientDocumentRequestList() {
  const resource = useClinicResource(
    "my-document-requests",
    () => clinicApi.getMyDocumentRequests(patient),
    [],
  );
  return (
    <section className="mx-auto max-w-5xl px-5 py-14 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[.22em] text-[#277579]">
        Patient services
      </p>
      <h1 className="mt-4 font-serif text-5xl tracking-[-.045em]">
        Document requests
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#102b3d]/68">
        These are administrative documents that Harborview has requested after
        registration. This is not an intake form and you will not be asked to
        complete your intake again.
      </p>
      <div className="mt-10 grid gap-4">
        {resource.data.map((item) => (
          <article
            className="flex gap-4 border border-[#102b3d]/10 bg-white p-6"
            key={item.id}
          >
            <FileText className="mt-1 shrink-0 text-[#277579]" size={21} />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-serif text-2xl">{item.category}</h2>
                <span className="bg-[#dcece7] px-2 py-1 text-xs font-semibold text-[#1a5a5d]">
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#102b3d]/65">
                {item.patientVisibleLabel}
              </p>
              {item.dueAtUtc && (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[.12em] text-[#102b3d]/45">
                  Requested by{" "}
                  {new Date(item.dueAtUtc).toLocaleDateString("en-CA")}
                </p>
              )}
            </div>
          </article>
        ))}
        {!resource.isLoading && resource.data.length === 0 && (
          <p className="border border-[#102b3d]/10 bg-white p-6 text-sm text-[#102b3d]/60">
            There are no open document requests in this proof account.
          </p>
        )}
      </div>
    </section>
  );
}
