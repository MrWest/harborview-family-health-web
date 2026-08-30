"use client";

import { FlaskConical, ShieldCheck } from "lucide-react";
import { clinicApi } from "@/lib/clinic-api";
import { parseMissingItems } from "@/lib/format";
import type { LaboratoryService } from "@/lib/clinic-types";
import { useClinicResource } from "@/hooks/use-clinic-resource";
import { StatusPanel } from "@/components/ui/StatusPanel";

const fallbackServices: LaboratoryService[] = [
  {
    id: "lab-standard",
    name: "Standard collection",
    slotMinutes: 15,
    requirementsJson: "[]",
  },
  {
    id: "lab-fasting",
    name: "Fasting collection",
    slotMinutes: 20,
    requirementsJson: '["Confirm fasting preparation with clinical staff"]',
  },
  {
    id: "lab-pediatric",
    name: "Pediatric support collection",
    slotMinutes: 30,
    requirementsJson: '["Guardian coordination required"]',
  },
  {
    id: "lab-referral",
    name: "Referral drop-off",
    slotMinutes: 10,
    requirementsJson: '["Verify requisition is present"]',
  },
];

export function LaboratoryDesk() {
  const services = useClinicResource(
    "laboratory-services",
    clinicApi.getLaboratoryServices,
    fallbackServices,
  );
  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#277579]">
          Harborview Diagnostics
        </p>
        <h1 className="mt-3 font-serif text-5xl tracking-[-.035em]">
          Coordinate collection requests with care.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-[#102b3d]/65">
          Reception coordinates administrative readiness, appointment
          availability, and document handoff. Clinical instructions remain with
          the appropriate care team.
        </p>
      </div>
      {services.error && (
        <StatusPanel tone="info" title="Using proof laboratory services">
          The live laboratory directory is unavailable, so the workspace is
          showing synthetic service rules.
        </StatusPanel>
      )}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {services.data.map((service) => (
          <article
            key={service.id}
            className="rounded-2xl border border-[#102b3d]/10 bg-white p-6"
          >
            <FlaskConical className="text-[#277579]" size={22} />
            <h2 className="mt-6 font-serif text-2xl">{service.name}</h2>
            <p className="mt-3 text-sm text-[#102b3d]/58">
              {service.slotMinutes}-minute coordination slot
            </p>
            <div className="mt-5 space-y-2">
              {parseMissingItems(service.requirementsJson).length ? (
                parseMissingItems(service.requirementsJson).map((item) => (
                  <p
                    key={item}
                    className="rounded-lg bg-[#fff1e7] px-3 py-2 text-xs leading-5 text-[#8c3e1c]"
                  >
                    {item}
                  </p>
                ))
              ) : (
                <p className="rounded-lg bg-[#e5f1ed] px-3 py-2 text-xs leading-5 text-[#155447]">
                  No additional administrative item in the proof scenario.
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
      <section className="rounded-2xl bg-[#102b3d] p-7 text-white">
        <ShieldCheck className="text-[#a9d9cf]" />
        <h2 className="mt-5 font-serif text-3xl">Reception boundary</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
          This workspace can coordinate a collection request and verify the
          presence of administrative documents. It must not interpret results,
          tell a patient how to prepare clinically, or make a medical
          determination.
        </p>
      </section>
    </div>
  );
}
