"use client";

import Link from "next/link";
import {
  CalendarDays,
  ClipboardCheck,
  FileWarning,
  FlaskConical,
  Users,
} from "lucide-react";
import { clinicApi } from "@/lib/clinic-api";
import { fallbackIntakeCases } from "@/lib/demo-data";
import { useClinicResource } from "@/hooks/use-clinic-resource";
import { StatusPanel } from "@/components/ui/StatusPanel";

const fallbackOverview = {
  patients: 12,
  intakeCases: 12,
  openStaffReviewTasks: 4,
  availableSlots: 6720,
};

export function ReceptionDashboard() {
  const overview = useClinicResource(
    "reception-overview",
    clinicApi.getOverview,
    fallbackOverview,
  );
  const intake = useClinicResource(
    "reception-intake-cases",
    clinicApi.getIntakeCases,
    fallbackIntakeCases,
  );
  const metrics = [
    [overview.data.openStaffReviewTasks, "Open reviews", ClipboardCheck],
    [overview.data.availableSlots, "Available visits", CalendarDays],
    [overview.data.intakeCases, "Intake cases", FileWarning],
    [overview.data.patients, "Patient records", Users],
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#277579]">
            Reception workspace
          </p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-.035em]">
            Today’s intake and scheduling desk.
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-[#102b3d]/65">
            Prioritize administrative review, maintain appointment requests, and
            coordinate laboratory collection without making clinical decisions.
          </p>
        </div>
        <span className="rounded-full bg-[#102b3d] px-4 py-2 text-xs font-semibold text-white">
          Administrative proof data only
        </span>
      </div>
      {overview.error && (
        <StatusPanel tone="info" title="Using proof workspace data">
          The live API was not available. The interface remains usable with
          synthetic fallback data.
        </StatusPanel>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([value, label, Icon]) => {
          const MetricIcon = Icon as typeof CalendarDays;
          return (
            <div
              key={String(label)}
              className="rounded-2xl bg-[#102b3d] p-5 text-white"
            >
              <MetricIcon className="text-[#a9d9cf]" size={20} />
              <strong className="mt-7 block font-serif text-4xl">
                {Number(value).toLocaleString()}
              </strong>
              <span className="mt-1 block text-sm text-white/62">
                {String(label)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-2xl border border-[#102b3d]/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#277579]">
                Priority queue
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                Intake requiring attention
              </h2>
            </div>
            <Link
              href="/reception/intake"
              className="text-sm font-semibold text-[#277579]"
            >
              Open intake desk
            </Link>
          </div>
          <div className="mt-6 divide-y divide-[#102b3d]/8">
            {intake.data
              .filter((item) => item.status === "NeedsStaffReview")
              .slice(0, 4)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <strong className="block text-sm">
                      {item.patient?.displayName ?? "Unassigned patient"}
                    </strong>
                    <span className="mt-1 block text-xs text-[#102b3d]/58">
                      {item.requestedSpecialty} · {item.id}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#fff1e7] px-3 py-1 text-xs font-semibold text-[#a65c29]">
                    Review required
                  </span>
                </div>
              ))}
          </div>
        </section>
        <aside className="rounded-2xl bg-[#dcece7] p-6">
          <FlaskConical className="text-[#277579]" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-[#277579]">
            Laboratory coordination
          </p>
          <h2 className="mt-3 font-serif text-3xl">
            Collection requests remain staff-led.
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#1a5a5d]">
            Review fasting requirements, pediatric support needs, and referral
            drop-off details before offering a collection request.
          </p>
          <Link
            href="/reception/laboratory"
            className="mt-7 inline-block text-sm font-semibold text-[#277579]"
          >
            Review laboratory services →
          </Link>
        </aside>
      </div>
    </div>
  );
}
