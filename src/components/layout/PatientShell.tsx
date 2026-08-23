import Link from "next/link";
import { Brand } from "./Brand";

const links = [
  { href: "/patient", label: "Overview" },
  { href: "/patient/appointments", label: "Appointments" },
  { href: "/patient/intake", label: "Documents" },
];

export function PatientShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[#f7f7f2] text-[#102b3d]"><header className="sticky top-0 z-40 border-b border-[#102b3d]/10 bg-[#f7f7f2]/92 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8"><Brand destination="/patient" /><nav className="flex items-center gap-4 text-sm font-medium sm:gap-7" aria-label="Patient portal navigation">{links.map((link) => <Link key={link.href} href={link.href} className="text-[#102b3d]/70 transition hover:text-[#277579]">{link.label}</Link>)}<Link href="/reception" className="rounded-full border border-[#102b3d]/15 px-3 py-1.5 text-xs text-[#102b3d]">Reception sign in</Link></nav></div></header>{children}<footer className="border-t border-[#102b3d]/10 bg-[#f7f7f2]"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-7 text-xs text-[#102b3d]/55 sm:flex-row lg:px-8"><span>© 2026 Harborview Family Health Centre · Fictional proof environment</span><span>Administrative coordination only · Not medical advice</span></div></footer></main>;
}
