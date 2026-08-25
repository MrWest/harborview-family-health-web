"use client";

// Design: clinic-paper editorial drawer with deep-navy structure, narrow teal signals, pale-seafoam emphasis, and a subtle bottom-only DirectivSys signature.
import Image from "next/image";
import Link from "next/link";
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clipboard,
  Compass,
  Download,
  FileDown,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  HARBORVIEW_PROOF_SCENARIOS,
  type ProofGuideScenario,
} from "@/data/harborviewProofGuide";

const DISMISS_KEY = "harborview-proof-guide-v1-dismissed";
const AUTO_OPEN_DELAY_MS = 4000;

function readDismissal() {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "true";
  } catch {
    return false;
  }
}

function persistDismissal() {
  try {
    window.localStorage.setItem(DISMISS_KEY, "true");
  } catch {
    // The guide remains fully usable when storage is unavailable.
  }
}

function ScenarioIcon({ id }: { id: ProofGuideScenario["id"] }) {
  if (id === "visitor") return <FileText size={18} />;
  if (id === "patient") return <CircleUserRound size={18} />;
  if (id === "reception") return <LayoutDashboard size={18} />;
  return <Compass size={18} />;
}

function GuideVisual({ scenario }: { scenario: ProofGuideScenario }) {
  const visual = scenario.visual;

  if (visual.kind === "pdf") {
    return (
      <div className="relative overflow-hidden border border-[#102b3d]/10 bg-white">
        <iframe
          title={`${scenario.title} sample document`}
          src={`${visual.path}#toolbar=0&navpanes=0`}
          className="h-56 w-full border-0 bg-white"
        />
        <a
          href={visual.path}
          download={visual.downloadName}
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#102b3d] text-white shadow-lg transition hover:bg-[#277579] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277579]"
          aria-label={`Download ${visual.downloadName}`}
          title="Download fictional test PDF"
        >
          <Download size={17} />
        </a>
      </div>
    );
  }

  if (visual.kind === "image") {
    return (
      <div className="relative overflow-hidden border border-[#102b3d]/10 bg-white">
        <Image
          src={visual.path}
          alt={visual.alt}
          width={1600}
          height={900}
          className="h-56 w-full object-contain bg-[#102b3d]/[0.03]"
        />
        <a
          href={visual.path}
          download={visual.downloadName}
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#102b3d] text-white shadow-lg transition hover:bg-[#277579] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277579]"
          aria-label={`Download ${visual.downloadName}`}
          title="Download fictional reference image"
        >
          <Download size={17} />
        </a>
      </div>
    );
  }

  return (
    <div className="border border-[#102b3d]/10 bg-[#102b3d] px-5 py-5 text-white">
      <div className="flex items-center gap-3 border-b border-white/12 pb-4">
        {visual.kind === "services" ? (
          <CircleUserRound
            className="text-[#a9d9cf]"
            size={20}
            aria-hidden="true"
          />
        ) : (
          <Compass className="text-[#a9d9cf]" size={20} aria-hidden="true" />
        )}
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a9d9cf]">
          {visual.title}
        </p>
      </div>
      <div className="divide-y divide-white/12">
        {visual.items.map((item, index) => (
          <div
            className="grid grid-cols-[32px_1fr] gap-3 py-3.5"
            key={item.label}
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#a9d9cf] text-xs font-bold text-[#102b3d]">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-bold">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-white/65">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HarborviewProofGuide() {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [copyAnnouncement, setCopyAnnouncement] = useState("");
  const panelRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const autoOpenTimerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  const scenario = HARBORVIEW_PROOF_SCENARIOS[scenarioIndex];

  const closeGuide = useCallback((persist = true) => {
    if (autoOpenTimerRef.current) {
      window.clearTimeout(autoOpenTimerRef.current);
      autoOpenTimerRef.current = null;
    }
    if (persist) persistDismissal();
    setIsOpen(false);
  }, []);

  const openGuide = useCallback(() => {
    if (autoOpenTimerRef.current) {
      window.clearTimeout(autoOpenTimerRef.current);
      autoOpenTimerRef.current = null;
    }
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const wasDismissed = readDismissal();
    const readyTimer = window.setTimeout(() => setIsReady(true), 0);
    if (wasDismissed) return () => window.clearTimeout(readyTimer);

    autoOpenTimerRef.current = window.setTimeout(openGuide, AUTO_OPEN_DELAY_MS);
    return () => {
      window.clearTimeout(readyTimer);
      if (autoOpenTimerRef.current)
        window.clearTimeout(autoOpenTimerRef.current);
    };
  }, [openGuide]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    const initialFocus = panel?.querySelector<HTMLElement>("button, a[href]");
    const focusFrame = window.requestAnimationFrame(() =>
      initialFocus?.focus(),
    );
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeGuide();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [closeGuide, isOpen]);

  function chooseScenario(index: number, focusTab = false) {
    const wrappedIndex =
      (index + HARBORVIEW_PROOF_SCENARIOS.length) %
      HARBORVIEW_PROOF_SCENARIOS.length;
    setScenarioIndex(wrappedIndex);
    if (focusTab)
      window.requestAnimationFrame(() =>
        tabRefs.current[wrappedIndex]?.focus(),
      );
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      chooseScenario(index + 1, true);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      chooseScenario(index - 1, true);
    } else if (event.key === "Home") {
      event.preventDefault();
      chooseScenario(0, true);
    } else if (event.key === "End") {
      event.preventDefault();
      chooseScenario(HARBORVIEW_PROOF_SCENARIOS.length - 1, true);
    }
  }

  async function copyPrompt(prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(prompt);
      setCopyAnnouncement("Prompt copied to clipboard.");
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedPrompt(null);
        setCopyAnnouncement("");
      }, 1800);
    } catch {
      setCopyAnnouncement(
        "Clipboard access was unavailable. Select and copy the prompt manually.",
      );
    }
  }

  if (!isReady) return null;

  return (
    <>
      <button
        type="button"
        onClick={openGuide}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="harborview-proof-guide"
        className="fixed bottom-5 left-4 z-40 inline-flex items-center gap-2 rounded-full border border-[#a9d9cf]/70 bg-[#102b3d] px-4 py-3 !text-sm font-bold tracking-[0.16em] text-white shadow-[0_12px_32px_rgba(16,43,61,.28)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#1d5267] active:scale-[.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9d9cf] motion-reduce:transform-none motion-reduce:transition-none"
      >
        <Compass size={16} className="text-[#a9d9cf]" aria-hidden="true" />
        Test this proof
      </button>

      <div
        className={`fixed inset-0 z-50 transition-[opacity,visibility] duration-300 ease-[cubic-bezier(.23,1,.32,1)] motion-reduce:transition-none ${
          isOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <button
          type="button"
          aria-label="Close proof testing guide"
          onClick={() => closeGuide()}
          tabIndex={-1}
          className="absolute inset-0 bg-[#081e2b]/62 backdrop-blur-[2px]"
        />
        <aside
          id="harborview-proof-guide"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="harborview-proof-guide-title"
          className={`relative flex h-dvh w-full flex-col overflow-y-auto bg-[#f7f7f2] text-[#102b3d] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)] motion-reduce:transition-none sm:w-[min(94vw,510px)] ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <header className="sticky top-0 z-10 border-b border-[#102b3d]/10 bg-[#f7f7f2]/96 px-5 pt-5 backdrop-blur sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#277579]">
                  Harborview live proof
                </p>
                <h2
                  id="harborview-proof-guide-title"
                  className="mt-2 font-serif text-3xl leading-none tracking-[-0.035em]"
                >
                  A short guide to testing the flow.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => closeGuide()}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#102b3d]/15 text-[#102b3d] transition duration-200 ease-out hover:border-[#277579] hover:bg-[#dcece7] active:scale-[.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277579] motion-reduce:transition-none"
                aria-label="Close guide"
              >
                <X size={18} />
              </button>
            </div>
            <div
              className="mt-5 grid grid-cols-2 gap-x-5 pt-1"
              role="tablist"
              aria-label="Proof testing scenarios"
            >
              {HARBORVIEW_PROOF_SCENARIOS.map((item, index) => (
                <button
                  key={item.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  id={`proof-guide-tab-${item.id}`}
                  role="tab"
                  aria-selected={index === scenarioIndex}
                  aria-controls={`proof-guide-panel-${item.id}`}
                  tabIndex={index === scenarioIndex ? 0 : -1}
                  onClick={() => chooseScenario(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={`inline-flex items-center justify-start gap-1.5 whitespace-nowrap border-b-2 px-1 py-2.5 text-xs font-bold transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#277579] motion-reduce:transition-none ${
                    index === scenarioIndex
                      ? "border-[#277579] text-[#102b3d]"
                      : "border-transparent text-[#102b3d]/50 hover:text-[#277579]"
                  }`}
                >
                  <ScenarioIcon id={item.id} />
                  {item.tab}
                </button>
              ))}
            </div>
          </header>

          <main
            id={`proof-guide-panel-${scenario.id}`}
            role="tabpanel"
            aria-labelledby={`proof-guide-tab-${scenario.id}`}
            tabIndex={0}
            className="flex-1 px-5 pt-6 sm:px-6"
          >
            <GuideVisual scenario={scenario} />

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#277579]">
              {scenario.eyebrow}
            </p>
            <h3 className="mt-2 font-serif text-3xl leading-[1.02] tracking-[-0.035em]">
              {scenario.title}
            </h3>
            <p className="mt-4 text-sm leading-6 text-[#102b3d]/70">
              {scenario.setup}
            </p>

            <Link
              href={scenario.route}
              onClick={() => closeGuide()}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#277579] px-4 py-2.5 text-sm font-bold text-white transition duration-200 ease-out hover:bg-[#1d5267] active:scale-[.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277579] motion-reduce:transition-none"
            >
              {scenario.routeLabel} <ArrowRight size={15} />
            </Link>

            {scenario.prompts.length > 0 ? (
              <section
                className="mt-8"
                aria-labelledby={`proof-guide-prompts-${scenario.id}`}
              >
                <p
                  id={`proof-guide-prompts-${scenario.id}`}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#277579]"
                >
                  Try these prompts
                </p>
                <div className="mt-3 divide-y divide-[#102b3d]/10 border-y border-[#102b3d]/10 bg-white">
                  {scenario.prompts.map((prompt) => (
                    <div key={prompt} className="flex items-start gap-3 py-3">
                      <p className="flex-1 text-sm leading-5 text-[#102b3d]/80">
                        {prompt}
                      </p>
                      <button
                        type="button"
                        onClick={() => void copyPrompt(prompt)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#102b3d]/12 text-[#277579] transition duration-200 ease-out hover:bg-[#dcece7] active:scale-[.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277579] motion-reduce:transition-none"
                        aria-label={`Copy prompt: ${prompt}`}
                      >
                        {copiedPrompt === prompt ? (
                          <Check size={16} />
                        ) : (
                          <Clipboard size={16} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                <p className="sr-only" aria-live="polite">
                  {copyAnnouncement}
                </p>
              </section>
            ) : null}

            <section className="mt-7 border-l-2 border-[#277579] pl-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#277579]">
                What happens
              </p>
              <p className="mt-2 text-sm leading-6 text-[#102b3d]/75">
                {scenario.expected}
              </p>
            </section>

            <section className="mt-5 bg-[#dcece7] p-4">
              <div className="flex gap-2 text-[#277579]">
                <ShieldCheck size={17} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    Boundary to notice
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#102b3d]/76">
                    {scenario.boundary}
                  </p>
                </div>
              </div>
            </section>

            {scenario.referenceDownloads?.length ? (
              <section className="mt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#277579]">
                  Additional fictional assets
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {scenario.referenceDownloads.map((asset) => (
                    <a
                      key={asset.path}
                      href={asset.path}
                      download={asset.downloadName}
                      className="inline-flex items-center gap-2 rounded-full border border-[#102b3d]/15 bg-white px-3 py-2 text-xs font-bold text-[#102b3d] transition duration-200 ease-out hover:bg-[#dcece7] active:scale-[.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277579] motion-reduce:transition-none"
                    >
                      <FileDown size={14} /> {asset.label}
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="mt-7 flex items-center gap-3 border-t border-[#102b3d]/10 py-5 text-xs leading-5 text-[#102b3d]/58">
              <CalendarDays
                size={17}
                className="shrink-0 text-[#277579]"
                aria-hidden="true"
              />
              All names, records, documents, appointments, and screenshots in
              this guide are fictional proof data.
            </div>
          </main>

          <footer className="sticky bottom-0 border-t border-[#102b3d]/10 bg-[#050A14] px-5 py-3 sm:px-6">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <button
                type="button"
                onClick={() => chooseScenario(scenarioIndex - 1)}
                className="inline-flex items-center gap-1 justify-self-start !text-xs font-bold text-white transition hover:text-[#277579] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277579]"
              >
                <ChevronLeft size={15} /> Previous
              </button>
              <div
                className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2"
                aria-label="Powered by DirectivSys"
              >
                <Image
                  src="/download/harborview-proof/harborview-proof-guide-vector.gif"
                  alt=""
                  width={44}
                  height={44}
                  unoptimized
                  className="h-11 w-11 object-contain"
                />
                <div className="text-center sm:text-left">
                  <span className="block text-[7px] font-bold uppercase tracking-[0.14em] text-white sm:text-[9px]">
                    Powered by
                  </span>
                  <strong className="block text-[9px] text-[#00F0FF] sm:mt-0.5 sm:text-xs">
                    DirectivSys
                  </strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => chooseScenario(scenarioIndex + 1)}
                className="inline-flex items-center gap-1 justify-self-end !text-xs font-bold text-white transition hover:text-[#277579] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277579]"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </footer>
        </aside>
      </div>
    </>
  );
}
