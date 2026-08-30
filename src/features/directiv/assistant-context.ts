// Design: Conversation context communicates the active Harborview lane and safety boundary without transferring documents or clinical decision-making to Directiv.
import type { DemoActor } from "@/lib/clinic-types";

export function createHarborviewAssistantContext(
  actor: DemoActor,
  pageName: string,
  pathname: string,
) {
  return {
    userId: actor.id,
    userName: actor.mode,
    userPreferences: `Actor lane: ${actor.mode}. Visitor: local draft and availability only; no persistent registration, holds, or booking. Active patient: own appointments, released-result status/link only, document requests, and appointment requests; never repeat intake. Receptionist: reviewed-draft duplicate review, patient/intake creation, availability search, and staff-confirmed recognition booking.`,
    interfaceState: {
      currentPageName: pageName,
      currentPageDescription: `Current internal route: ${pathname}. Administrative coordination only. Harborview owns documents and transcript; document uploads never go to Directiv. No clinical interpretation, triage, diagnosis, urgency, or treatment advice.`,
    },
  };
}
