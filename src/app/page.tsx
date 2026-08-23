"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, CalendarDays, Check, ChevronRight, ClipboardCheck, Clock3,
  FileText, FlaskConical, HeartPulse, Menu, Search, ShieldCheck, Stethoscope,
  Upload, UserRound, UsersRound, X,
} from "lucide-react";

type View = "patient" | "staff";
type Slot = { id: string; startsAtUtc: string; endsAtUtc: string };
type Provider = { id: string; displayName: string; specialty?: { name: string } };
type IntakeCase = { id: string; requestedSpecialty: string; status: string; missingItemsJson: string; patient?: { displayName: string } };

const apiUrl = process.env.NEXT_PUBLIC_HARBORVIEW_API_URL ?? "http://localhost:5090";
const specialties = [
  { name: "Family Medicine", description: "New and returning family care appointments", icon: HeartPulse },
  { name: "Pediatrics", description: "Administrative appointment support for children", icon: UsersRound },
  { name: "Women’s Health", description: "Referral and appointment-readiness coordination", icon: ShieldCheck },
  { name: "Dermatology", description: "Specialist referral coordination", icon: Stethoscope },
];
const fallbackProviders: Provider[] = [
  { id: "prov-bennett", displayName: "Dr. Maya Bennett", specialty: { name: "Family Medicine" } },
  { id: "prov-alvarez", displayName: "Dr. Sofia Alvarez", specialty: { name: "Pediatrics" } },
  { id: "prov-patel", displayName: "Dr. Naomi Patel", specialty: { name: "Women’s Health" } },
  { id: "prov-park", displayName: "Dr. Hannah Park", specialty: { name: "Dermatology" } },
];
const fallbackSlots: Slot[] = [
  { id: "demo-slot-1", startsAtUtc: "2026-08-25T13:00:00Z", endsAtUtc: "2026-08-25T13:30:00Z" },
  { id: "demo-slot-2", startsAtUtc: "2026-08-26T15:30:00Z", endsAtUtc: "2026-08-26T16:00:00Z" },
  { id: "demo-slot-3", startsAtUtc: "2026-08-27T14:00:00Z", endsAtUtc: "2026-08-27T14:30:00Z" },
];
const fallbackCases: IntakeCase[] = [
  { id: "intake-001", requestedSpecialty: "Dermatology", status: "NeedsStaffReview", missingItemsJson: '["Referring provider signature"]', patient: { displayName: "Avery Collins" } },
  { id: "intake-004", requestedSpecialty: "Family Medicine", status: "NeedsStaffReview", missingItemsJson: '["Coverage member identifier"]', patient: { displayName: "Casey Patel" } },
  { id: "intake-007", requestedSpecialty: "Pediatrics", status: "InProgress", missingItemsJson: "[]", patient: { displayName: "Morgan Ellis" } },
];

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default function Home() {
  const [view, setView] = useState<View>("patient");
  const [menuOpen, setMenuOpen] = useState(false);
  const [specialty, setSpecialty] = useState("Family Medicine");
  const [providers, setProviders] = useState<Provider[]>(fallbackProviders);
  const [selectedProvider, setSelectedProvider] = useState<Provider>(fallbackProviders[0]);
  const [slots, setSlots] = useState<Slot[]>(fallbackSlots);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [intakeCases, setIntakeCases] = useState<IntakeCase[]>(fallbackCases);
  const [activeCase, setActiveCase] = useState<IntakeCase>(fallbackCases[0]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`${apiUrl}/api/providers?specialty=${encodeURIComponent(specialty)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((items: Provider[]) => {
        if (items.length) { setProviders(items); setSelectedProvider(items[0]); }
      })
      .catch(() => setProviders(fallbackProviders.filter((provider) => provider.specialty?.name === specialty)));
  }, [specialty]);

  useEffect(() => {
    fetch(`${apiUrl}/api/appointment-slots?resourceType=Provider&resourceId=${selectedProvider.id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((items: Slot[]) => setSlots(items.length ? items : fallbackSlots))
      .catch(() => setSlots(fallbackSlots));
  }, [selectedProvider]);

  useEffect(() => {
    fetch(`${apiUrl}/api/intake-cases`).then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((items: IntakeCase[]) => { if (items.length) { setIntakeCases(items); setActiveCase(items[0]); } })
      .catch(() => undefined);
  }, []);

  const filteredCases = useMemo(() => intakeCases.filter((item) => `${item.patient?.displayName} ${item.requestedSpecialty}`.toLowerCase().includes(query.toLowerCase())), [intakeCases, query]);

  async function requestAppointment(slot: Slot) {
    setSelectedSlot(slot);
    try {
      const response = await fetch(`${apiUrl}/api/appointments/hold`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: "pat-001", slotId: slot.id, administrativeReason: "Patient-selected proof appointment", staffReviewRequired: true }),
      });
      if (!response.ok) throw new Error();
    } catch { /* The visual proof remains usable when the local API is not started. */ }
    setNotice("Your selected time is held for administrative confirmation. Harborview reception will contact you if anything else is needed.");
  }

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#102b3d]">
      <header className="sticky top-0 z-40 border-b border-[#102b3d]/10 bg-[#f7f7f2]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button className="flex items-center gap-3 text-left" onClick={() => setView("patient")}>
            <img src="/manus-storage/harborview-mark_a8dc974b.png" alt="Harborview mark" className="h-10 w-10 object-contain" />
            <span><strong className="block font-serif text-xl leading-none tracking-tight">Harborview</strong><span className="mt-1 block text-[10px] font-bold tracking-[.2em] text-[#277579]">FAMILY HEALTH CENTRE</span></span>
          </button>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <button onClick={() => setView("patient")} className={view === "patient" ? "text-[#277579]" : "text-[#102b3d]/65"}>Patient portal</button>
            <button onClick={() => setView("staff")} className={view === "staff" ? "text-[#277579]" : "text-[#102b3d]/65"}>Reception workspace</button>
            <span className="rounded-full bg-[#dcece7] px-3 py-1 text-xs text-[#1a5a5d]">Proof environment</span>
          </nav>
          <button className="rounded-full border border-[#102b3d]/15 p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        {menuOpen && <div className="border-t border-[#102b3d]/10 px-5 py-3 md:hidden"><button onClick={() => { setView("patient"); setMenuOpen(false); }} className="block py-2">Patient portal</button><button onClick={() => { setView("staff"); setMenuOpen(false); }} className="block py-2">Reception workspace</button></div>}
      </header>

      {view === "patient" ? <>
        <section className="relative overflow-hidden bg-[#dfece8]">
          <div className="absolute inset-0 bg-[url('/manus-storage/harborview-clinic-hero_d1d0d803.jpg')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#edf4f1] via-[#edf4f1]/94 to-[#edf4f1]/10" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-28">
            <div className="max-w-2xl"><p className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.22em] text-[#277579]"><span className="h-px w-8 bg-[#277579]" />Administrative care coordination</p><h1 className="font-serif text-5xl leading-[.96] tracking-[-.04em] sm:text-6xl">Your next care step, <em className="font-normal text-[#277579]">made clear.</em></h1><p className="mt-7 max-w-xl text-lg leading-8 text-[#102b3d]/72">Find the right appointment, prepare your documents, and understand what Harborview reception needs before your visit.</p><div className="mt-9 flex flex-wrap gap-3"><button onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center gap-2 rounded-full bg-[#102b3d] px-6 py-3.5 text-sm font-semibold text-white hover:-translate-y-0.5">Find an appointment <ArrowRight size={16} /></button><button onClick={() => setView("staff")} className="rounded-full border border-[#102b3d]/20 bg-white/65 px-6 py-3.5 text-sm font-semibold">Reception sign in</button></div></div>
            <aside className="self-end rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_22px_70px_-30px_rgba(16,43,61,.45)] backdrop-blur"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#277579]">Before you book</p><div className="mt-5 space-y-4">{[["1", "Choose a care area", "Select the specialty that fits your appointment request."], ["2", "Select a time", "See appointment availability before you submit a request."], ["3", "Prepare documents", "Upload a referral or intake PDF for staff review."]].map(([n, title, text]) => <div className="flex gap-4" key={n}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dcece7] text-xs font-bold text-[#277579]">{n}</span><span><strong className="block text-sm">{title}</strong><small className="block pt-1 leading-5 text-[#102b3d]/60">{text}</small></span></div>)}</div></aside>
          </div>
        </section>

        <section id="booking" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#277579]">Appointments</p><h2 className="mt-3 font-serif text-4xl tracking-tight">Find a time that works.</h2></div><p className="max-w-sm text-sm leading-6 text-[#102b3d]/60">Availability is shown for administrative appointment requests. A Harborview team member confirms final details.</p></div>
          <div className="grid gap-5 md:grid-cols-4">{specialties.map(({ name, description, icon: Icon }) => <button key={name} onClick={() => setSpecialty(name)} className={`rounded-2xl border p-5 text-left ${specialty === name ? "border-[#277579] bg-[#102b3d] text-white shadow-lg" : "border-[#102b3d]/10 bg-white hover:border-[#277579]/40"}`}><Icon size={22} className={specialty === name ? "text-[#a9d9cf]" : "text-[#277579]"} /><strong className="mt-8 block text-lg">{name}</strong><small className={`mt-2 block leading-5 ${specialty === name ? "text-white/68" : "text-[#102b3d]/60"}`}>{description}</small><span className="mt-6 inline-flex items-center gap-1 text-xs font-bold">Explore <ChevronRight size={14} /></span></button>)}</div>
          <div className="mt-10 grid gap-7 lg:grid-cols-[.82fr_1.18fr]">
            <div className="rounded-[1.6rem] bg-[#102b3d] p-7 text-white"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#a9d9cf]">Your care area</p><h3 className="mt-4 font-serif text-3xl">{specialty}</h3><div className="mt-8 space-y-2">{providers.map((provider) => <button key={provider.id} onClick={() => setSelectedProvider(provider)} className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm ${selectedProvider.id === provider.id ? "bg-white text-[#102b3d]" : "bg-white/8 text-white hover:bg-white/15"}`}><span>{provider.displayName}</span><ChevronRight size={16} /></button>)}</div><div className="mt-8 rounded-xl border border-white/15 bg-white/6 p-4 text-sm leading-6 text-white/65">Harborview Diagnostics offers collection appointment coordination through reception.</div></div>
            <div className="rounded-[1.6rem] border border-[#102b3d]/10 bg-white p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#277579]">Available appointment requests</p><h3 className="mt-2 font-serif text-3xl">{selectedProvider.displayName}</h3></div><span className="rounded-full bg-[#dcece7] px-3 py-1 text-xs font-semibold text-[#1a5a5d]">30-minute visit</span></div><div className="mt-8 grid gap-3 sm:grid-cols-3">{slots.slice(0, 6).map((slot) => <button key={slot.id} onClick={() => requestAppointment(slot)} className={`rounded-xl border p-4 text-left hover:-translate-y-0.5 ${selectedSlot?.id === slot.id ? "border-[#277579] bg-[#e5f1ed]" : "border-[#102b3d]/10 hover:border-[#277579]/45"}`}><CalendarDays size={17} className="text-[#277579]" /><strong className="mt-3 block text-sm">{shortDate(slot.startsAtUtc).split(",")[0]}</strong><span className="mt-1 block text-xs text-[#102b3d]/60">{shortDate(slot.startsAtUtc).split(",").slice(1).join(",").trim()}</span></button>)}</div>{notice && <div className="mt-6 flex gap-3 rounded-xl bg-[#e5f1ed] p-4 text-sm text-[#1a5a5d]"><Check className="mt-0.5 shrink-0" size={18} /><p>{notice}</p></div>}</div>
          </div>
        </section>

        <section className="bg-[#e9efec]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-24"><div className="overflow-hidden rounded-[1.75rem]"><img src="/manus-storage/harborview-intake-documents_db9597b3.jpg" alt="Patient intake documents" className="h-full min-h-[340px] w-full object-cover" /></div><div className="self-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#277579]">Document readiness</p><h2 className="mt-4 font-serif text-4xl tracking-tight">Bring less uncertainty to your first visit.</h2><p className="mt-5 max-w-xl leading-7 text-[#102b3d]/70">Upload a referral or intake PDF before your appointment. Harborview staff review it for administrative completeness and contact you only when something is still needed.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{["Referral or requisition", "Coverage details", "Preferred contact method", "Guardian details when needed"].map((item) => <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm" key={item}><FileText size={17} className="text-[#277579]" />{item}</div>)}</div><button className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#102b3d]/20 px-5 py-3 text-sm font-semibold"><Upload size={16} />Upload PDF for staff review</button></div></div></section>
      </> :
        <section className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#277579]">Reception workspace</p><h1 className="mt-2 font-serif text-4xl tracking-tight">Today’s intake and scheduling desk.</h1></div><div className="rounded-full bg-[#102b3d] px-4 py-2 text-xs font-semibold text-white">Administrative proof data only</div></div><div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_330px]">
          <aside className="rounded-2xl border border-[#102b3d]/10 bg-white p-4"><div className="flex items-center gap-2 rounded-xl bg-[#f1f4f2] px-3 py-2"><Search size={16} className="text-[#277579]"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find patient or care area" className="w-full bg-transparent text-sm outline-none"/></div><p className="mt-6 px-2 text-xs font-bold uppercase tracking-[.16em] text-[#102b3d]/45">Intake cases</p><div className="mt-3 space-y-1">{filteredCases.map((item) => <button key={item.id} onClick={() => setActiveCase(item)} className={`w-full rounded-xl p-3 text-left ${activeCase.id === item.id ? "bg-[#dcece7]" : "hover:bg-[#f4f6f4]"}`}><span className="flex items-center justify-between"><strong className="text-sm">{item.patient?.displayName}</strong><span className={`h-2 w-2 rounded-full ${item.status === "NeedsStaffReview" ? "bg-[#c47c43]" : "bg-[#277579]"}`}/></span><small className="mt-1 block text-xs text-[#102b3d]/60">{item.requestedSpecialty}</small></button>)}</div></aside>
          <section className="rounded-2xl border border-[#102b3d]/10 bg-white p-7"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#277579]">Active intake</p><h2 className="mt-2 font-serif text-3xl">{activeCase.patient?.displayName}</h2><p className="mt-1 text-sm text-[#102b3d]/60">{activeCase.id} · {activeCase.requestedSpecialty}</p></div><span className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${activeCase.status === "NeedsStaffReview" ? "bg-[#fff1e7] text-[#a65c29]" : "bg-[#e5f1ed] text-[#1a5a5d]"}`}>{activeCase.status === "NeedsStaffReview" ? "Staff review required" : "Intake in progress"}</span></div><div className="mt-8 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-[#102b3d]/10 p-5"><ClipboardCheck size={20} className="text-[#277579]"/><h3 className="mt-5 font-semibold">Administrative checklist</h3><div className="mt-4 space-y-3 text-sm">{["Patient identity details", "Appointment preference", "Referral / intake PDF", ...JSON.parse(activeCase.missingItemsJson || "[]")].map((item, index) => <div className="flex gap-3" key={item}><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${index < 3 ? "bg-[#dcece7] text-[#277579]" : "bg-[#fff1e7] text-[#a65c29]"}`}>{index < 3 ? "✓" : "!"}</span>{item}</div>)}</div></div><div className="rounded-xl bg-[#102b3d] p-5 text-white"><FlaskConical size={20} className="text-[#a9d9cf]"/><h3 className="mt-5 font-semibold">Harborview Diagnostics</h3><p className="mt-3 text-sm leading-6 text-white/65">Standard collection, fasting collection, pediatric support, and referral drop-off are available for staff-coordinated requests.</p><button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#a9d9cf]">Check collection availability <ArrowRight size={16}/></button></div></div><div className="mt-5 rounded-xl bg-[#f1f4f2] p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#277579]">Staff action</p><h3 className="mt-2 font-semibold">Schedule after administrative review</h3></div><button onClick={() => setNotice(`Staff review action recorded for ${activeCase.patient?.displayName}.`)} className="shrink-0 rounded-full bg-[#277579] px-4 py-2.5 text-sm font-semibold text-white">Create review task</button></div>{notice && <p className="mt-4 text-sm text-[#1a5a5d]">{notice}</p>}</div></section>
          <aside className="space-y-5"><div className="rounded-2xl bg-[#102b3d] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#a9d9cf]">Today at a glance</p><div className="mt-6 grid grid-cols-2 gap-3">{[["08", "Open reviews"], ["31", "Available visits"], ["04", "Lab holds"], ["02", "Referral flags"]].map(([number, label]) => <div key={label} className="rounded-xl bg-white/8 p-3"><strong className="font-serif text-3xl">{number}</strong><small className="mt-1 block text-xs text-white/60">{label}</small></div>)}</div></div><div className="rounded-2xl border border-[#102b3d]/10 bg-white p-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#277579]">Scheduling policy</p><div className="mt-5 space-y-4 text-sm leading-6 text-[#102b3d]/70"><p><Clock3 size={16} className="mr-2 inline text-[#277579]"/>Patient portal requests become held times until staff confirms them.</p><p><UserRound size={16} className="mr-2 inline text-[#277579]"/>Reception selects providers and confirms administrative readiness.</p></div></div></aside>
        </div></section>}

      <footer className="border-t border-[#102b3d]/10 bg-[#f7f7f2]"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-7 text-xs text-[#102b3d]/55 sm:flex-row lg:px-8"><span>© 2026 Harborview Family Health Centre · Fictional proof environment</span><span>Administrative coordination only · Not medical advice</span></div></footer>
    </main>
  );
}
