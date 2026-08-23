"use client";

// Design: This patient service panel preserves Harborview’s warm clinical-administration visual language, with tangible paper-like surfaces and explicit, non-clinical status labels.
import Link from "next/link";
import { CalendarDays, FileText, FlaskConical, LoaderCircle } from "lucide-react";
import { clinicApi } from "@/lib/clinic-api";
import { useClinicResource } from "@/hooks/use-clinic-resource";

const patient = { mode: "activePatient" as const, id: "portal-patient-001" };

export function PatientServicesOverview() {
  const appointments = useClinicResource("my-appointments", () => clinicApi.getMyAppointments(patient), []);
  const releases = useClinicResource("my-laboratory-results", () => clinicApi.getMyLaboratoryResults(patient), []);
  const documents = useClinicResource("my-document-requests", () => clinicApi.getMyDocumentRequests(patient), []);
  const cards = [
    { icon: CalendarDays, title: "Appointments", value: appointments.isLoading ? "…" : String(appointments.data.length), copy: "Your requests and confirmed times", href: "/patient/appointments" },
    { icon: FlaskConical, title: "Released results", value: releases.isLoading ? "…" : String(releases.data.filter((item) => item.releaseStatus === "Released").length), copy: "Status and available portal links only", href: "/patient/results" },
    { icon: FileText, title: "Document requests", value: documents.isLoading ? "…" : String(documents.data.filter((item) => item.status === "Open").length), copy: "Administrative items awaiting you", href: "/patient/intake" },
  ];
  return <>
    <section className="relative overflow-hidden bg-[#dfece8]"><div className="absolute inset-0 bg-[url('/images/harborview-clinic-hero.webp')] bg-cover bg-center opacity-35"/><div className="absolute inset-0 bg-gradient-to-r from-[#edf4f1] via-[#edf4f1]/95 to-[#edf4f1]/15"/><div className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#277579]">Authenticated patient services</p><h1 className="mt-6 max-w-2xl font-serif text-6xl leading-[.94] tracking-[-.045em]">Your next administrative step, <em className="font-normal text-[#277579]">made clear.</em></h1><p className="mt-7 max-w-xl text-lg leading-8 text-[#102b3d]/70">Appointments, released laboratory-result status and portal links, and document requests—without repeating your original intake.</p><Link href="/patient/appointments" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#102b3d] px-6 py-3.5 text-sm font-semibold text-white">Request an appointment <CalendarDays size={16}/></Link></div></section>
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-16 md:grid-cols-3 lg:px-8">{cards.map(({ icon: Icon, title, value, copy, href }) => <Link href={href} className="group border border-[#102b3d]/10 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#277579]/45" key={title}><Icon className="text-[#277579]" size={23}/><p className="mt-7 font-serif text-5xl tracking-[-.05em]">{value}</p><h2 className="mt-2 font-serif text-2xl">{title}</h2><p className="mt-3 text-sm leading-6 text-[#102b3d]/65">{copy}</p></Link>)}</section>
    {(appointments.isLoading || releases.isLoading || documents.isLoading) && <p className="mx-auto mb-12 flex max-w-7xl items-center gap-2 px-5 text-sm text-[#102b3d]/55 lg:px-8"><LoaderCircle className="animate-spin" size={16}/> Loading your scoped service information…</p>}
  </>;
}
