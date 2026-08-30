"use client";

// Design: Local-draft review preserves the same restrained Harborview clinical-administration style and makes the verification boundary a first-class conclusion.
import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function RegistrationReviewPage() {
  const [draft, setDraft] = useState<{
    fields?: Record<string, string>;
  } | null>(null);
  useEffect(
    () =>
      setDraft(
        JSON.parse(
          window.localStorage.getItem(
            "harborview:visitor-registration-draft",
          ) ?? "null",
        ),
      ),
    [],
  );
  return (
    <main className="min-h-screen bg-[#f7f7f2] px-5 py-12 text-[#102b3d] lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/register" className="text-sm font-semibold text-[#277579]">
          ← Back to local draft
        </Link>
        <p className="mt-10 text-xs font-bold uppercase tracking-[.22em] text-[#277579]">
          Local draft review
        </p>
        <h1 className="mt-4 font-serif text-5xl tracking-[-.045em]">
          Prepared, not submitted.
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#102b3d]/68">
          Review the information stored in this browser. It has not created a
          patient record or appointment.
        </p>
        <div className="mt-8 divide-y divide-[#102b3d]/10 border border-[#102b3d]/10 bg-white">
          {Object.entries(draft?.fields ?? {}).length ? (
            Object.entries(draft?.fields ?? {}).map(([key, value]) => (
              <div
                className="grid grid-cols-[.9fr_1.1fr] gap-6 px-5 py-4 text-sm"
                key={key}
              >
                <span className="capitalize text-[#102b3d]/55">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <span>{value || "Not provided"}</span>
              </div>
            ))
          ) : (
            <p className="p-6 text-sm text-[#102b3d]/60">
              No local draft has been prepared yet.
            </p>
          )}
        </div>
        <div className="mt-8 grid gap-4 border border-[#277579]/20 bg-[#dcece7] p-5 sm:grid-cols-[auto_1fr]">
          <ShieldCheck className="text-[#277579]" />
          <p className="text-sm leading-6">
            Any field obtained from a PDF remains{" "}
            <strong>extracted/unverified</strong> until the person provides it
            or a Harborview receptionist validates it. This proof does not use
            documents to create diagnoses or clinical decisions.
          </p>
        </div>
        <div className="mt-5 flex gap-3 border border-[#102b3d]/12 bg-white p-5">
          <LockKeyhole className="shrink-0 text-[#277579]" />
          <p className="text-sm leading-6">
            <strong>SIGN_IN_REQUIRED.</strong> Harborview blocks persistent
            registration and booking from this visitor path. If you are already
            a patient, use{" "}
            <Link
              className="font-semibold text-[#277579] underline"
              href="/patient"
            >
              patient services
            </Link>
            ; reception can complete a verified intake in its own workspace.
          </p>
        </div>
      </div>
    </main>
  );
}
