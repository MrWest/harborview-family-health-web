import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  FileCheck2,
  FlaskConical,
  HeartHandshake,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Brand } from "@/components/layout/Brand";

const patientSteps = [
  {
    step: "01",
    title: "Request the right time",
    copy: "Browse administrative availability by care area and provider, then request a staff-reviewed hold.",
    icon: CalendarDays,
  },
  {
    step: "02",
    title: "Prepare information once",
    copy: "Submit the referral or intake PDF that reception needs to make the next administrative step clear.",
    icon: FileCheck2,
  },
  {
    step: "03",
    title: "Receive a human confirmation",
    copy: "A Harborview receptionist confirms the administrative details before any appointment is final.",
    icon: HeartHandshake,
  },
];

const receptionFlows = [
  {
    title: "Intake desk",
    copy: "Review what arrived, identify what is still needed, and create a clear next task for the team.",
    href: "/reception/intake",
    icon: ClipboardCheck,
  },
  {
    title: "Scheduling desk",
    copy: "Coordinate requests, holds, confirmations, and alternatives without losing the patient’s context.",
    href: "/reception/schedule",
    icon: CalendarDays,
  },
  {
    title: "Laboratory coordination",
    copy: "Route administrative collection requests and readiness checks through one visible workflow.",
    href: "/reception/laboratory",
    icon: FlaskConical,
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#277579]">
      {children}
    </p>
  );
}

// --- HOME PAGE ---
export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f2] text-[#102b3d]">
      <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Brand inverse />
        <span className="hidden rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-white/85 backdrop-blur-sm sm:inline-flex">
          Fictional proof environment
        </span>
      </header>

      <section className="relative isolate min-h-[720px] overflow-hidden bg-[#102b3d] text-white">
        <Image
          src="/images/harborview-clinic-hero.webp"
          alt="Warm, welcoming Harborview clinic reception"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,35,52,.95)_0%,rgba(9,35,52,.83)_39%,rgba(9,35,52,.28)_76%,rgba(9,35,52,.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#102b3d] to-transparent" />

        <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-5 pb-20 pt-32 lg:px-8 lg:pb-24">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#a9d9cf]">
              Harborview Family Health Centre
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.04] tracking-[-0.05em] sm:text-7xl lg:text-[94px]">
              Clear coordination is
              <em className="block font-normal text-[#a9d9cf]">
                {" "}
                part of good care.
              </em>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
              Harborview gives new patients a simpler start and gives reception
              teams one practical view of intake, documents, appointments, and
              next steps.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#102b3d] transition hover:bg-[#dcece7]"
              >
                Register as a new patient <ArrowRight size={16} />
              </Link>
              <Link
                href="/patient"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/18"
              >
                I already have a patient portal <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-5 flex flex-col gap-2 text-sm text-white/68 sm:flex-row sm:items-center sm:gap-5">
              <p>
                Start a local, PDF-assisted registration draft. Submission and
                booking require verification.
              </p>
              <Link
                href="/reception"
                className="inline-flex w-fit items-center gap-2 font-semibold text-[#a9d9cf] transition hover:text-white"
              >
                Reception workspace <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#102b3d]/10 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-[#102b3d]/10 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
          {[
            [
              "Patient-first",
              "A calm, administrative path from request to staff confirmation.",
            ],
            [
              "Reception-led",
              "One workspace for document completeness, holds, and practical follow-through.",
            ],
            [
              "Administrative only",
              "No diagnosis, triage, treatment recommendation, or medical decisioning.",
            ],
          ].map(([title, copy]) => (
            <div
              className="py-7 sm:px-7 sm:first:pl-0 sm:last:pr-0"
              key={title}
            >
              <p className="font-serif text-2xl tracking-[-0.025em]">{title}</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[#102b3d]/62">
                {copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-32">
        <div className="lg:sticky lg:top-10 lg:self-start">
          <SectionLabel>The patient journey</SectionLabel>
          <h2 className="mt-5 max-w-md font-serif text-5xl leading-[0.98] tracking-[-0.045em] sm:text-6xl">
            Less back-and-forth.{" "}
            <em className="font-normal text-[#277579]">More clarity.</em>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-[#102b3d]/68">
            The patient portal is designed around the things a person actually
            needs to do before a visit—not a generic chat window and not a
            clinical decision tool.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#277579] underline decoration-[#a9d9cf] decoration-2 underline-offset-8"
          >
            New to Harborview? Begin registration <ArrowRight size={16} />
          </Link>
        </div>

        <div className="space-y-4">
          {patientSteps.map(({ step, title, copy, icon: Icon }) => (
            <article
              className="group grid gap-5 rounded-[1.5rem] border border-[#102b3d]/10 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#277579]/35 sm:grid-cols-[70px_1fr_auto] sm:items-center sm:p-8"
              key={step}
            >
              <span className="font-serif text-4xl text-[#277579]/55">
                {step}
              </span>
              <div>
                <h3 className="font-serif text-3xl tracking-[-0.03em]">
                  {title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#102b3d]/65">
                  {copy}
                </p>
              </div>
              <Icon className="text-[#277579]" size={28} strokeWidth={1.6} />
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#102b3d] py-24 text-white lg:py-32">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(169,217,207,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(169,217,207,.2)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            <SectionLabel>Reception management</SectionLabel>
            <h2 className="mt-5 font-serif text-5xl leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl">
              Built for the people who make care{" "}
              <em className="font-normal text-[#a9d9cf]">actually move.</em>
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/67">
              The reception workspace turns a scattered administrative handoff
              into visible queues, explicit next actions, and staff-owned
              confirmation.
            </p>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {receptionFlows.map(({ title, copy, href, icon: Icon }) => (
              <Link
                href={href}
                className="group flex min-h-72 flex-col rounded-[1.5rem] border border-white/15 bg-white/[0.06] p-7 backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#a9d9cf]/55 hover:bg-white/[0.1]"
                key={title}
              >
                <Icon className="text-[#a9d9cf]" size={27} strokeWidth={1.6} />
                <h3 className="mt-auto font-serif text-3xl tracking-[-0.03em]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/63">{copy}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#a9d9cf]">
                  Open flow <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-32">
        <div className="relative min-h-[430px] overflow-hidden rounded-[2rem]">
          <Image
            src="/images/harborview-lab.webp"
            alt="Harborview laboratory coordination space"
            fill
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102b3d]/78 via-transparent to-transparent" />
          <div className="absolute bottom-0 p-8 text-white">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#a9d9cf]">
              One operating picture
            </p>
            <p className="mt-3 max-w-sm font-serif text-3xl leading-tight">
              Appointments, documents, laboratory coordination, and staff
              review—not isolated tabs.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <SectionLabel>How Harborview operates</SectionLabel>
          <h2 className="mt-5 font-serif text-5xl leading-[0.98] tracking-[-0.045em] sm:text-6xl">
            Human confirmation is{" "}
            <em className="font-normal text-[#277579]">the point.</em>
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#102b3d]/68">
            The platform gives staff a better administrative handoff. It does
            not automate clinical judgment, make decisions for patients, or
            replace established care processes.
          </p>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#dcece7] p-5">
              <UsersRound className="text-[#277579]" size={24} />
              <h3 className="mt-5 font-serif text-2xl">One shared view</h3>
              <p className="mt-2 text-sm leading-6 text-[#102b3d]/65">
                Patient and reception experiences remain connected through the
                same administrative workflow.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f0eee5] p-5">
              <ShieldCheck className="text-[#277579]" size={24} />
              <h3 className="mt-5 font-serif text-2xl">Clear boundaries</h3>
              <p className="mt-2 text-sm leading-6 text-[#102b3d]/65">
                Every action is explicitly administrative, reviewable, and ready
                for staff follow-through.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#102b3d]/10 bg-white px-5 py-12 text-center lg:px-8">
        <Brand />
        <p className="mt-5 text-sm text-[#102b3d]/55">
          © 2026 Harborview Family Health Centre · Fictional proof environment
        </p>
        <p className="mt-2 text-xs text-[#102b3d]/45">
          Administrative coordination only · Not medical advice
        </p>
      </section>
    </main>
  );
}
