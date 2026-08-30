// Design: Conversation context communicates the active Harborview lane and safety boundary without transferring documents or clinical decision-making to Directiv.
import type { DemoActor } from "@/lib/clinic-types";

export function createHarborviewAssistantContext(
  actor: DemoActor,
  pageName: string,
  pathname: string,
) {
  // On the receptionist new-intake page, document upload to Directiv is the intended extraction path.
  const isNewIntakeForm =
    actor.mode === "receptionist" && pathname.includes("new-intake");
  return {
    userId: actor.id,
    userName: actor.mode,
    userPreferences: `Actor lane: ${actor.mode}. Visitor: local draft and availability only; no persistent registration, holds, or booking. Active patient: own appointments, released-result status/link only, document requests, and appointment requests; never repeat intake. Receptionist: reviewed-draft duplicate review, patient/intake creation, availability search, and staff-confirmed recognition booking.`,
    interfaceState: {
      currentPageName: pageName,
      currentPageDescription: `Current internal route: ${pathname}. Administrative coordination only. ${
        isNewIntakeForm
          ? "On this intake form page, the receptionist may upload a referral or registration document directly in chat. Extract all available administrative field values from it and apply them to the intake form via a single update_local_intake_draft call."
          : "Harborview owns documents and transcript; document uploads never go to Directiv."
      } No clinical interpretation, triage, diagnosis, urgency, or treatment advice.`,
    },
  };
}
