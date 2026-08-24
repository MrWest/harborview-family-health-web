// Design: This executor is Harborview's final client-side action boundary. It maps only approved Directiv tool names to actor-gated Harborview API calls or local UI navigation.
import type { OnIntentDetected, ToolCall, ToolResult } from "@directivsys/react-sdk";
import { ClinicApiError, clinicApi } from "@/lib/clinic-api";
import type { DemoActor } from "@/lib/clinic-types";
import { ASSISTANT_RECORD_ROUTES, ASSISTANT_VIEW_ROUTES, isNavigationDestination, isNavigationRecordType, isSafeHarborviewRecordId } from "@/lib/assistant-navigation";

type AgentActionOptions = {
  actor: DemoActor;
  pathname: string;
  navigate: (pathname: string) => void;
};

function blocked(summary: string): ToolResult {
  return { status: "error", summary, detailed_data: { status: "blocked" } };
}

function toToolError(error: unknown): ToolResult {
  if (error instanceof ClinicApiError) {
    const reason = error.body && "reason" in error.body ? error.body.reason : undefined;
    return { status: "error", summary: reason ? `${reason}: ${error.message}` : error.message, detailed_data: error.body ?? {} };
  }

  return { status: "error", summary: "The Harborview service could not complete that action. No registration or booking was recorded.", detailed_data: {} };
}

function slotItems(slots: Array<{ id: string; resourceId: string; startsAtUtc: string; endsAtUtc: string }>) {
  return slots.map((slot) => ({
    id: slot.id,
    name: new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(slot.startsAtUtc)),
    type: `Provider ${slot.resourceId}`,
    price: 0,
    description: `Available through ${new Date(slot.endsAtUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
  }));
}

function updateVisitorDraft(toolCall: ToolCall, actor: DemoActor): ToolResult {
  if (actor.mode !== "visitor") return blocked("This local registration-draft action is available only in the prospective visitor lane.");
  const field = typeof toolCall.parameters.field === "string" ? toolCall.parameters.field : "";
  const value = typeof toolCall.parameters.value === "string" ? toolCall.parameters.value : "";
  if (!field || !value) return blocked("A field name and a user-confirmed value are required before updating a local draft.");

  const storageKey = "harborview:visitor-registration-draft";
  const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "{\"fields\":{}}") as { fields?: Record<string, string> };
  const next = { ...saved, fields: { ...(saved.fields ?? {}), [field]: value } };
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("harborview:visitor-draft-updated", { detail: next }));

  return { status: "success", summary: `Updated the local visitor draft field '${field}'. No patient, registration, or appointment was created.`, detailed_data: { field, persisted: false } };
}

function navigateToView(toolCall: ToolCall, options: AgentActionOptions): ToolResult {
  const destination = typeof toolCall.parameters.destination === "string" ? toolCall.parameters.destination : "";
  if (!isNavigationDestination(destination)) return blocked("NAVIGATION_DESTINATION_INVALID: Harborview could not match that request to an approved internal view.");

  const route = ASSISTANT_VIEW_ROUTES[destination];
  if (route.actor !== options.actor.mode) return blocked("NAVIGATION_ACCESS_DENIED: That view is not available in the current Harborview actor lane.");
  if (options.pathname === route.pathname) return { status: "success", summary: `The ${route.label} view is already open.`, detailed_data: { destination, pathname: route.pathname, navigationStatus: "already_open" } };

  options.navigate(route.pathname);
  return { status: "success", summary: `Navigation to the ${route.label} view has been initiated.`, detailed_data: { destination, pathname: route.pathname, navigationStatus: "initiated" } };
}

function navigateToRecord(toolCall: ToolCall, options: AgentActionOptions): ToolResult {
  const recordType = typeof toolCall.parameters.recordType === "string" ? toolCall.parameters.recordType : "";
  const recordId = typeof toolCall.parameters.recordId === "string" ? toolCall.parameters.recordId.trim() : "";
  if (!isNavigationRecordType(recordType)) return blocked("RECORD_NAVIGATION_TYPE_INVALID: Harborview could not match that request to an approved record detail view.");
  if (!isSafeHarborviewRecordId(recordId)) return blocked("RECORD_NAVIGATION_ID_INVALID: A valid Harborview record identifier is required before navigation can begin.");

  const route = ASSISTANT_RECORD_ROUTES[recordType];
  if (route.actor !== options.actor.mode) return blocked("NAVIGATION_ACCESS_DENIED: That record type is not available in the current Harborview actor lane.");

  const targetPath = route.pathname(recordId);
  options.navigate(targetPath);
  return { status: "success", summary: `Navigation to the requested ${route.label} has been initiated.`, detailed_data: { recordType, recordId, pathname: targetPath, navigationStatus: "initiated" } };
}

export function createHarborviewAgentActions(options: AgentActionOptions): OnIntentDetected {
  return async (toolCall: ToolCall): Promise<ToolResult> => {
    const { actor } = options;

    try {
      switch (toolCall.toolName) {
        case "set_local_registration_field":
          return updateVisitorDraft(toolCall, actor);
        case "navigate_to_view":
          return navigateToView(toolCall, options);
        case "navigate_to_record":
          return navigateToRecord(toolCall, options);
        case "search_recognition_availability": {
          const specialty = typeof toolCall.parameters.specialty === "string" ? toolCall.parameters.specialty : "Family Medicine";
          const preference = toolCall.parameters.timePreference === "Morning" || toolCall.parameters.timePreference === "Afternoon" ? toolCall.parameters.timePreference : undefined;
          const slots = await clinicApi.searchRecognitionSlots(specialty, actor, preference);
          return { status: "success", summary: slots.length ? `Found ${slots.length} available administrative time${slots.length === 1 ? "" : "s"} for ${specialty}.` : `No availability was found for ${specialty}.`, items: slotItems(slots), detailed_data: slots };
        }
        case "get_my_appointments": {
          if (actor.mode !== "activePatient") return blocked("SIGN_IN_REQUIRED: Only an authenticated patient may access their own appointments.");
          const appointments = await clinicApi.getMyAppointments(actor);
          return { status: "success", summary: `Returned ${appointments.length} appointment record${appointments.length === 1 ? "" : "s"} owned by this signed-in patient.`, detailed_data: appointments };
        }
        case "get_my_laboratory_result_status": {
          if (actor.mode !== "activePatient") return blocked("SIGN_IN_REQUIRED: Laboratory result status is only available to the authenticated patient who owns the release.");
          const results = await clinicApi.getMyLaboratoryResults(actor);
          return { status: "success", summary: "Returned release status and portal links only. No laboratory result interpretation is provided.", detailed_data: results };
        }
        case "get_my_document_requests": {
          if (actor.mode !== "activePatient") return blocked("SIGN_IN_REQUIRED: Only an authenticated patient may access their own document requests.");
          const requests = await clinicApi.getMyDocumentRequests(actor);
          return { status: "success", summary: `Returned ${requests.length} document request${requests.length === 1 ? "" : "s"} for this patient.`, detailed_data: requests };
        }
        case "request_my_appointment": {
          if (actor.mode !== "activePatient") return blocked("SIGN_IN_REQUIRED: Visitors may browse availability but cannot hold or request an appointment.");
          const slotId = String(toolCall.parameters.slotId ?? "");
          if (!slotId) return blocked("CONFIRMATION_REQUIRED: A selected slot is required before a patient appointment request can be submitted.");
          const appointment = await clinicApi.requestMyAppointment(slotId, String(toolCall.parameters.appointmentType ?? "General appointment"), actor);
          return { status: "success", summary: `Appointment request ${appointment.id} was received for staff review. It is not yet a confirmed appointment.`, detailed_data: appointment };
        }
        case "review_registration_draft_duplicates": {
          if (actor.mode !== "receptionist") return blocked("RECEPTIONIST_PERMISSION_REQUIRED: Only reception may review possible patient duplicates.");
          const draftId = String(toolCall.parameters.draftId ?? "");
          if (!draftId) return blocked("DRAFT_REQUIRED: Select a Harborview registration draft before duplicate review.");
          const matches = await clinicApi.getReceptionDuplicateMatches(draftId, actor);
          return { status: "success", summary: matches.length ? `Found ${matches.length} possible duplicate match${matches.length === 1 ? "" : "es"}; staff review is required.` : "No possible duplicate matches were found.", detailed_data: matches };
        }
        case "create_reception_intake_from_draft": {
          if (actor.mode !== "receptionist") return blocked("RECEPTIONIST_PERMISSION_REQUIRED: Only reception can create a patient and intake from a reviewed draft.");
          const draftId = String(toolCall.parameters.draftId ?? "");
          const specialty = String(toolCall.parameters.requestedSpecialty ?? "Family Medicine");
          if (!draftId) return blocked("DRAFT_REQUIRED: Select a reviewed draft before creating an intake.");
          const intake = await clinicApi.createReceptionIntake(draftId, specialty, actor, typeof toolCall.parameters.selectedExistingPatientId === "string" ? toolCall.parameters.selectedExistingPatientId : undefined);
          return { status: "success", summary: `Created patient ${intake.patient.id} and intake ${intake.intake.id}. A recognition appointment still requires separate staff confirmation.`, detailed_data: intake };
        }
        case "book_recognition_appointment": {
          if (actor.mode !== "receptionist") return blocked("RECEPTIONIST_PERMISSION_REQUIRED: Only reception can confirm a recognition appointment.");
          const patientId = String(toolCall.parameters.patientId ?? "");
          const intakeCaseId = String(toolCall.parameters.intakeCaseId ?? "");
          const slotId = String(toolCall.parameters.slotId ?? "");
          if (!patientId || !intakeCaseId || !slotId) return blocked("CONFIRMATION_REQUIRED: A reviewed patient, intake, and slot must be selected before reception can book.");
          const appointment = await clinicApi.bookRecognitionAppointment(patientId, intakeCaseId, slotId, actor);
          return { status: "success", summary: `Recognition appointment ${appointment.id} is confirmed by reception.`, detailed_data: appointment };
        }
        default:
          return blocked(`The requested action '${toolCall.toolName}' is not available in the ${actor.mode} Harborview proof lane.`);
      }
    } catch (error) {
      return toToolError(error);
    }
  };
}
