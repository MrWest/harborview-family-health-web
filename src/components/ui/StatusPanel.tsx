import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type StatusPanelProps = {
  tone: "success" | "error" | "info";
  title: string;
  children: React.ReactNode;
};

const styles = {
  success: "border-[#8abcae] bg-[#e5f1ed] text-[#155447]",
  error: "border-[#e3b59f] bg-[#fff1e7] text-[#8c3e1c]",
  info: "border-[#adc8d1] bg-[#edf5f6] text-[#24536a]",
};

export function StatusPanel({ tone, title, children }: StatusPanelProps) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? AlertCircle : Info;
  return <div className={`flex gap-3 rounded-xl border p-4 text-sm ${styles[tone]}`} role={tone === "error" ? "alert" : "status"}>
    <Icon size={18} className="mt-0.5 shrink-0" />
    <div><strong className="block">{title}</strong><div className="mt-1 leading-6">{children}</div></div>
  </div>;
}
