// Design: This notice is intentionally compact and transparent when the browser-safe Directiv public key has not been configured for the proof deployment.
import { ShieldCheck } from "lucide-react";

export function AssistantUnavailableNotice() {
  return (
    <aside className="fixed bottom-5 right-5 z-50 hidden max-w-xs border border-[#102b3d]/12 bg-[#f7f7f2] p-4 shadow-xl md:block">
      <div className="flex gap-3">
        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#277579]" />
        <p className="text-xs leading-5 text-[#102b3d]/70">
          <strong className="text-[#102b3d]">
            Directiv client-managed proof ready.
          </strong>{" "}
          The live assistant appears after{" "}
          <code>NEXT_PUBLIC_DIRECTIVSYS_API_KEY</code> is configured. Harborview
          remains the transcript and document owner.
        </p>
      </div>
    </aside>
  );
}
