import Link from "next/link";
import { Brand } from "./Brand";
import { ClientManagedAssistantLoader } from "@/components/directiv/ClientManagedAssistantLoader";

const links = [
  { href: "/reception", label: "Dashboard" },
  { href: "/reception/intake", label: "Intake" },
  { href: "/reception/new-intake", label: "New intake" },
  { href: "/reception/patients", label: "Patients" },
  { href: "/reception/schedule", label: "Schedule" },
  { href: "/reception/laboratory", label: "Laboratory" },
];

export function ReceptionShell({ children }: { children: React.ReactNode }) {
  const actor = { mode: "receptionist" as const, id: "receptionist-001" };
  return (
    <main className="min-h-screen bg-[#eef2ef] text-[#102b3d]">
      <header className="border-b border-white/10 bg-[#102b3d] text-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Brand destination="/reception" />
          <nav
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
            aria-label="Reception workspace navigation"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/68 transition hover:text-[#a9d9cf]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/patient"
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white"
            >
              Patient portal
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8">{children}</div>
      <ClientManagedAssistantLoader
        actor={actor}
        conversationId="harborview-reception-001"
        pageName="Reception intake and operations"
      />
    </main>
  );
}
