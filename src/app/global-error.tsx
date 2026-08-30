"use client";

// Design: The emergency state follows Harborview’s quiet, administrative visual system and avoids loading optional interactive dependencies.
export default function GlobalError() {
  return (
    <html lang="en">
      <body className="bg-[#f7f7f2] text-[#102b3d]">
        <main className="mx-auto max-w-xl px-6 py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#277579]">
            Harborview Family Health Centre
          </p>
          <h1 className="mt-5 font-serif text-4xl tracking-[-.04em]">
            This page is temporarily unavailable.
          </h1>
          <p className="mt-4 text-base leading-7 text-[#102b3d]/68">
            No registration, document, or appointment action has been confirmed
            from this page. Please return to the appropriate Harborview service
            and try again.
          </p>
          <a
            className="mt-8 inline-flex bg-[#102b3d] px-5 py-3 text-sm font-semibold text-white"
            href="/"
          >
            Return to Harborview
          </a>
        </main>
      </body>
    </html>
  );
}
