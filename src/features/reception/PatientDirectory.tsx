"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, Search, UserRound } from "lucide-react";
import { clinicApi } from "@/lib/clinic-api";
import { fallbackPatients } from "@/lib/demo-data";
import type { Patient } from "@/lib/clinic-types";
import { StatusPanel } from "@/components/ui/StatusPanel";

export function PatientDirectory() {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>(fallbackPatients);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const items = await clinicApi.getPatients(query);
        if (active) {
          setPatients(items.length ? items : fallbackPatients);
          setError(null);
        }
      } catch {
        if (active) {
          setPatients(
            fallbackPatients.filter((item) =>
              item.displayName.toLowerCase().includes(query.toLowerCase()),
            ),
          );
          setError("The live directory is unavailable; showing proof records.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }, 200);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#277579]">
          Patient directory
        </p>
        <h1 className="mt-3 font-serif text-5xl tracking-[-.035em]">
          Find a record, then coordinate the next step.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-[#102b3d]/65">
          This proof directory contains fictional patients only. Use it to
          orient the reception workflow, not to make medical decisions.
        </p>
      </div>
      {error && (
        <StatusPanel tone="info" title="Using proof records">
          {error}
        </StatusPanel>
      )}
      <label className="flex max-w-xl items-center gap-3 rounded-2xl border border-[#102b3d]/10 bg-white px-4 py-3">
        <Search className="text-[#277579]" size={18} />
        <span className="sr-only">Search patient records</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by patient name"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>
      <section className="overflow-hidden rounded-2xl border border-[#102b3d]/10 bg-white">
        <div className="grid grid-cols-[1.2fr_.7fr_.7fr] gap-4 border-b border-[#102b3d]/8 px-5 py-3 text-xs font-bold uppercase tracking-[.14em] text-[#102b3d]/45">
          <span>Patient</span>
          <span>Preferred contact</span>
          <span>Record ID</span>
        </div>
        {isLoading ? (
          <p className="px-5 py-8 text-sm text-[#102b3d]/60">
            Loading patient records…
          </p>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              className="grid grid-cols-[1.2fr_.7fr_.7fr] gap-4 border-b border-[#102b3d]/6 px-5 py-4 last:border-none"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dcece7] text-[#277579]">
                  <UserRound size={17} />
                </span>
                <div className="min-w-0">
                  <strong className="block truncate text-sm">
                    {patient.displayName}
                  </strong>
                  <span className="block truncate text-xs text-[#102b3d]/55">
                    Born {patient.dateOfBirth}
                  </span>
                </div>
              </div>
              <div className="text-sm text-[#102b3d]/65">
                {patient.preferredContactMethod === "Email" ? (
                  <span className="inline-flex items-center gap-2">
                    <Mail size={15} />
                    {patient.email ?? "Email"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Phone size={15} />
                    {patient.phone ?? "Phone"}
                  </span>
                )}
              </div>
              <span className="text-sm text-[#102b3d]/55">{patient.id}</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
