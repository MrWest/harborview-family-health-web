import { PatientShell } from "@/components/layout/PatientShell";

export default function PatientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <PatientShell>{children}</PatientShell>;
}
