"use client";

import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import Image from "next/image";
import { clinicApi } from "@/lib/clinic-api";
import { StatusPanel } from "@/components/ui/StatusPanel";

export function DocumentUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submitDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) { setState("error"); setMessage("Choose a PDF before submitting it for staff review."); return; }
    if (file.type !== "application/pdf") { setState("error"); setMessage("This proof accepts PDF documents only."); return; }
    setState("uploading");
    try { await clinicApi.uploadProofDocument("intake-001", file); setState("success"); setMessage(`${file.name} was received for administrative review.`); }
    catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "The document could not be uploaded."); }
  }

  return <section className="grid gap-10 lg:grid-cols-[.86fr_1.14fr]"><div className="relative min-h-[340px] overflow-hidden rounded-[1.75rem]"><Image src="/images/harborview-intake-documents.webp" alt="Organized patient intake documents" fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" priority/></div><div className="self-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#277579]">Administrative intake</p><h1 className="mt-4 font-serif text-5xl tracking-[-.035em]">Prepare documents before your visit.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-[#102b3d]/68">Harborview staff review documents for administrative completeness. They do not use this upload to diagnose, triage, or provide medical advice.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{["Referral or requisition", "Coverage details", "Preferred contact method", "Guardian details when needed"].map((item) => <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm shadow-sm" key={item}><FileText size={17} className="text-[#277579]"/>{item}</div>)}</div><form onSubmit={submitDocument} className="mt-8 rounded-2xl border border-dashed border-[#277579]/45 bg-white p-5"><label className="block text-sm font-semibold" htmlFor="proof-document">Referral or intake PDF</label><input id="proof-document" type="file" accept="application/pdf" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setState("idle"); }} className="mt-3 block w-full text-sm"/><button type="submit" disabled={state === "uploading"} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#102b3d] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><Upload size={16}/>{state === "uploading" ? "Uploading…" : "Submit for staff review"}</button></form>{state !== "idle" && <div className="mt-5"><StatusPanel tone={state === "success" ? "success" : "error"} title={state === "success" ? "Document received" : "Document needs attention"}>{message}</StatusPanel></div>}</div></section>;
}
