"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, FlaskConical, Search } from "lucide-react";
import { clinicApi } from "@/lib/clinic-api";
import { fallbackIntakeCases } from "@/lib/demo-data";
import { parseMissingItems } from "@/lib/format";
import type { IntakeCase } from "@/lib/clinic-types";
import { useClinicResource } from "@/hooks/use-clinic-resource";
import { StatusPanel } from "@/components/ui/StatusPanel";

export function IntakeWorkspace() {
  const resource = useClinicResource(
    "reception-intake-cases",
    clinicApi.getIntakeCases,
    fallbackIntakeCases,
  );
  const [query, setQuery] = useState("");
  const [activeCaseId, setActiveCaseId] = useState(fallbackIntakeCases[0].id);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const cases = resource.data;
  const filtered = useMemo(
    () =>
      cases.filter((item) =>
        `${item.patient?.displayName ?? ""} ${item.requestedSpecialty}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [cases, query],
  );
  const activeCase: IntakeCase =
    filtered.find((item) => item.id === activeCaseId) ??
    filtered[0] ??
    cases[0] ??
    fallbackIntakeCases[0];
  const missingItems = parseMissingItems(activeCase.missingItemsJson);

  async function createReview() {
    try {
      await clinicApi.createReviewTask(
        activeCase.id,
        "Reception follow-up requested from intake workspace",
      );
      setActionMessage(
        `Review task created for ${activeCase.patient?.displayName ?? activeCase.id}.`,
      );
    } catch {
      setActionMessage(
        `Proof review action recorded for ${activeCase.patient?.displayName ?? activeCase.id}.`,
      );
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#277579]">
          Intake desk
        </p>
        <h1 className="mt-3 font-serif text-5xl tracking-[-.035em]">
          Review what reception needs next.
        </h1>
      </div>
      {resource.error && (
        <StatusPanel tone="info" title="Using proof intake cases">
          The live API was not available. This view is displaying deterministic
          synthetic cases.
        </StatusPanel>
      )}
      <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)_320px]">
        <aside className="rounded-2xl border border-[#102b3d]/10 bg-white p-4">
          <label className="flex items-center gap-2 rounded-xl bg-[#f1f4f2] px-3 py-2">
            <Search size={16} className="text-[#277579]" />
            <span className="sr-only">Find intake case</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find patient or care area"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <p className="mt-6 px-2 text-xs font-bold uppercase tracking-[.16em] text-[#102b3d]/45">
            Intake cases
          </p>
          <div className="mt-3 space-y-1">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveCaseId(item.id)}
                className={`w-full rounded-xl p-3 text-left ${activeCase.id === item.id ? "bg-[#dcece7]" : "hover:bg-[#f4f6f4]"}`}
              >
                <span className="flex items-center justify-between">
                  <strong className="text-sm">
                    {item.patient?.displayName}
                  </strong>
                  <span
                    className={`h-2 w-2 rounded-full ${item.status === "NeedsStaffReview" ? "bg-[#c47c43]" : "bg-[#277579]"}`}
                  />
                </span>
                <small className="mt-1 block text-xs text-[#102b3d]/60">
                  {item.requestedSpecialty}
                </small>
              </button>
            ))}
          </div>
        </aside>
        <section className="rounded-2xl border border-[#102b3d]/10 bg-white p-7">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#277579]">
                Active intake
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                {activeCase.patient?.displayName}
              </h2>
              <p className="mt-1 text-sm text-[#102b3d]/60">
                {activeCase.id} · {activeCase.requestedSpecialty}
              </p>
            </div>
            <span
              className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${activeCase.status === "NeedsStaffReview" ? "bg-[#fff1e7] text-[#a65c29]" : "bg-[#e5f1ed] text-[#1a5a5d]"}`}
            >
              {activeCase.status === "NeedsStaffReview"
                ? "Staff review required"
                : "Intake in progress"}
            </span>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#102b3d]/10 p-5">
              <ClipboardCheck size={20} className="text-[#277579]" />
              <h3 className="mt-5 font-semibold">Administrative checklist</h3>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  "Patient identity details",
                  "Appointment preference",
                  "Referral / intake PDF",
                  ...missingItems,
                ].map((item, index) => (
                  <div className="flex gap-3" key={item}>
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${index < 3 ? "bg-[#dcece7] text-[#277579]" : "bg-[#fff1e7] text-[#a65c29]"}`}
                    >
                      {index < 3 ? "✓" : "!"}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-[#102b3d] p-5 text-white">
              <FlaskConical size={20} className="text-[#a9d9cf]" />
              <h3 className="mt-5 font-semibold">Laboratory coordination</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Collection requests are reviewed by reception for administrative
                completeness and scheduling requirements.
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-[#f1f4f2] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#277579]">
                  Staff action
                </p>
                <h3 className="mt-2 font-semibold">
                  Create administrative review task
                </h3>
              </div>
              <button
                onClick={() => void createReview()}
                className="rounded-full bg-[#277579] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Create review task
              </button>
            </div>
            {actionMessage && (
              <p className="mt-4 text-sm text-[#1a5a5d]" role="status">
                {actionMessage}
              </p>
            )}
          </div>
        </section>
        <aside className="rounded-2xl bg-[#102b3d] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a9d9cf]">
            Staff standard
          </p>
          <h2 className="mt-4 font-serif text-3xl">
            Coordinate, don’t decide.
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Use this workspace for document completeness, contact routing,
            appointment holds, and scheduling. Escalate clinical questions
            through established staff processes.
          </p>
        </aside>
      </div>
    </div>
  );
}
