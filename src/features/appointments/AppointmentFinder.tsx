"use client";

import { useState } from "react";
import { CalendarDays, ChevronRight, HeartPulse, ShieldCheck, Stethoscope, UsersRound } from "lucide-react";
import Link from "next/link";
import { clinicApi } from "@/lib/clinic-api";
import { fallbackProviders, fallbackSlots, specialties } from "@/lib/demo-data";
import { formatAppointmentTime } from "@/lib/format";
import type { Appointment, AppointmentSlot } from "@/lib/clinic-types";
import { useClinicResource } from "@/hooks/use-clinic-resource";
import { StatusPanel } from "@/components/ui/StatusPanel";

const icons = { "Family Medicine": HeartPulse, Pediatrics: UsersRound, "Women’s Health": ShieldCheck, Dermatology: Stethoscope };

export function AppointmentFinder() {
  const [specialty, setSpecialty] = useState("Family Medicine");
  const [selectedProviderId, setSelectedProviderId] = useState(fallbackProviders[0].id);
  const [submission, setSubmission] = useState<Appointment | null>(null);
  const [submittingSlotId, setSubmittingSlotId] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const actor = { mode: "activePatient" as const, id: "portal-patient-001" };

  const providerResource = useClinicResource(`providers:${specialty}`, () => clinicApi.getProviders(specialty), fallbackProviders.filter((item) => item.specialty?.name === specialty));
  const providers = providerResource.data.length ? providerResource.data : fallbackProviders.filter((item) => item.specialty?.name === specialty);
  const selectedProvider = providers.find((provider) => provider.id === selectedProviderId) ?? providers[0] ?? fallbackProviders[0];
  const slotsResource = useClinicResource(`slots:${selectedProvider.id}`, () => clinicApi.getSlots(selectedProvider.id), fallbackSlots);
  const slots = slotsResource.data.length ? slotsResource.data : fallbackSlots;

  async function requestHold(slot: AppointmentSlot) {
    setSubmission(null);
    setSubmissionError(null);
    setSubmittingSlotId(slot.id);
    try {
      setSubmission(await clinicApi.requestMyAppointment(slot.id, "General appointment", actor));
      slotsResource.refresh();
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "The appointment request was not recorded.");
    } finally {
      setSubmittingSlotId(null);
    }
  }

  return <div className="space-y-10">
    <section className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#277579]">Patient appointments</p><h1 className="mt-4 font-serif text-5xl tracking-[-.035em]">Find a time that works.</h1><p className="mt-5 text-lg leading-8 text-[#102b3d]/68">Choose a care area, select a provider, and submit an administrative appointment request. A Harborview receptionist confirms the final appointment details.</p></section>
    {providerResource.error && <StatusPanel tone="info" title="Using proof availability">The live clinic service could not be reached, so this page is showing the built-in fictional scenario.</StatusPanel>}
    <section aria-labelledby="care-area-heading"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#277579]">Step 1</p><h2 id="care-area-heading" className="mt-2 font-serif text-3xl">Choose a care area</h2></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{specialties.map((item) => { const Icon = icons[item.name as keyof typeof icons]; const active = specialty === item.name; return <button key={item.id} onClick={() => { setSpecialty(item.name); setSubmission(null); }} className={`rounded-2xl border p-5 text-left transition ${active ? "border-[#277579] bg-[#102b3d] text-white shadow-lg" : "border-[#102b3d]/10 bg-white hover:border-[#277579]/40"}`}><Icon size={21} className={active ? "text-[#a9d9cf]" : "text-[#277579]"}/><strong className="mt-7 block text-lg">{item.name}</strong><span className={`mt-2 block text-sm leading-5 ${active ? "text-white/68" : "text-[#102b3d]/60"}`}>{item.description}</span><span className="mt-5 inline-flex items-center gap-1 text-xs font-bold">Select <ChevronRight size={14}/></span></button>; })}</div></section>
    <section className="grid gap-6 lg:grid-cols-[.78fr_1.22fr]" aria-label="Provider and appointment selection"><div className="rounded-[1.5rem] bg-[#102b3d] p-7 text-white"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#a9d9cf]">Step 2</p><h2 className="mt-3 font-serif text-3xl">{specialty}</h2><p className="mt-3 text-sm leading-6 text-white/65">Choose a provider for your administrative appointment request.</p><div className="mt-7 space-y-2">{providers.map((provider) => <button key={provider.id} onClick={() => { setSelectedProviderId(provider.id); setSubmission(null); setSubmissionError(null); }} className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm ${selectedProvider.id === provider.id ? "bg-white text-[#102b3d]" : "bg-white/8 text-white hover:bg-white/15"}`}><span>{provider.displayName}</span><ChevronRight size={16}/></button>)}</div></div><div className="rounded-[1.5rem] border border-[#102b3d]/10 bg-white p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#277579]">Step 3</p><h2 className="mt-2 font-serif text-3xl">Available requests with {selectedProvider.displayName}</h2></div><span className="rounded-full bg-[#dcece7] px-3 py-1 text-xs font-semibold text-[#1a5a5d]">30-minute visit</span></div>{slotsResource.isLoading ? <p className="mt-8 text-sm text-[#102b3d]/60">Loading appointment availability…</p> : <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{slots.slice(0, 9).map((slot) => <button key={slot.id} disabled={submittingSlotId !== null} onClick={() => void requestHold(slot)} className="rounded-xl border border-[#102b3d]/10 p-4 text-left transition hover:-translate-y-0.5 hover:border-[#277579]/45 disabled:cursor-wait disabled:opacity-50"><CalendarDays size={17} className="text-[#277579]"/><strong className="mt-3 block text-sm">{formatAppointmentTime(slot.startsAtUtc).split(",")[0]}</strong><span className="mt-1 block text-xs text-[#102b3d]/60">{formatAppointmentTime(slot.startsAtUtc).split(",").slice(1).join(",").trim()}</span><span className="mt-4 block text-xs font-bold text-[#277579]">{submittingSlotId === slot.id ? "Submitting request…" : "Request this time"}</span></button>)}</div>}{submissionError && <div className="mt-7"><StatusPanel tone="error" title="No appointment request was recorded">{submissionError}</StatusPanel></div>}{submission && <div className="mt-7"><StatusPanel tone="success" title="Your request is with reception">Your request reference is <strong>{submission.id}</strong>. It is not a confirmed appointment yet. <Link href="/patient/confirmation" className="font-semibold underline">See what happens next.</Link></StatusPanel></div>}</div></section>
  </div>;
}
