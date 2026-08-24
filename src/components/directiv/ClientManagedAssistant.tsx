"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bot, ShieldCheck } from "lucide-react";
import {
  DirectivSysChatbox,
  DirectivSysProvider,
  type OnIntentDetected,
  type ToolCall,
  type ToolResult,
} from "@directivsys/react-sdk";
import { ClinicApiError, clinicApi } from "@/lib/clinic-api";
import type { DemoActor } from "@/lib/clinic-types";
import {
  ASSISTANT_RECORD_ROUTES,
  ASSISTANT_VIEW_ROUTES,
  isNavigationDestination,
  isNavigationRecordType,
  isSafeHarborviewRecordId,
} from "@/lib/assistant-navigation";

type AssistantProps = {
  actor: DemoActor;
  conversationId: string;
  pageName: string;
};

function blocked(summary: string): ToolResult {
  return { status: "error", summary, detailed_data: { status: "blocked" } };
}

function toToolError(error: unknown): ToolResult {
  if (error instanceof ClinicApiError) {
    const reason =
      error.body && "reason" in error.body ? error.body.reason : undefined;
    return {
      status: "error",
      summary: reason ? `${reason}: ${error.message}` : error.message,
      detailed_data: error.body ?? {},
    };
  }
  return {
    status: "error",
    summary:
      "The Harborview service could not complete that action. No registration or booking was recorded.",
    detailed_data: {},
  };
}

function slotItems(
  slots: Array<{
    id: string;
    resourceId: string;
    startsAtUtc: string;
    endsAtUtc: string;
  }>,
) {
  return slots.map((slot) => ({
    id: slot.id,
    name: new Intl.DateTimeFormat("en-CA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(slot.startsAtUtc)),
    type: `Provider ${slot.resourceId}`,
    price: 0,
    description: `Available through ${new Date(slot.endsAtUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
  }));
}

export function ClientManagedAssistant({
  actor,
  conversationId,
  pageName,
}: AssistantProps) {
  const apiKey = process.env.NEXT_PUBLIC_DIRECTIVSYS_API_KEY;
  const router = useRouter();
  const pathname = usePathname();
  const history = useMemo(
    () => ({
      load: async () => {
        const events = await clinicApi.getConversationEvents(
          conversationId,
          actor,
        );
        return events.map((event) => ({
          id: event.id,
          role:
            event.role === "user" ? ("user" as const) : ("assistant" as const),
          content: event.content,
          createdAt: event.createdAtUtc,
          visibility: event.isInternal
            ? ("internal" as const)
            : ("visible" as const),
        }));
      },
      append: async (
        events: Array<{
          id: string;
          role: "user" | "assistant";
          content: string;
          createdAt: string;
          visibility: "visible" | "internal";
        }>,
      ) => {
        await Promise.all(
          events.map((event) =>
            clinicApi.appendConversationEvent(
              conversationId,
              {
                id: event.id,
                role: event.role,
                content: event.content,
                isInternal: event.visibility === "internal",
                eventType:
                  event.visibility === "internal" ? "ToolResult" : "Message",
                createdAt: event.createdAt,
              },
              actor,
            ),
          ),
        );
      },
      clear: async () =>
        clinicApi.clearConversationEvents(conversationId, actor),
    }),
    [actor, conversationId],
  );

  const onIntentDetected = useMemo<OnIntentDetected>(
    () =>
      async (toolCall: ToolCall): Promise<ToolResult> => {
        try {
          switch (toolCall.toolName) {
            case "set_local_registration_field": {
              if (actor.mode !== "visitor")
                return blocked(
                  "This local registration-draft action is available only in the prospective visitor lane.",
                );
              const field =
                typeof toolCall.parameters.field === "string"
                  ? toolCall.parameters.field
                  : "";
              const value =
                typeof toolCall.parameters.value === "string"
                  ? toolCall.parameters.value
                  : "";
              if (!field || !value)
                return blocked(
                  "A field name and a user-confirmed value are required before updating a local draft.",
                );
              const storageKey = "harborview:visitor-registration-draft";
              const saved = JSON.parse(
                window.localStorage.getItem(storageKey) ?? '{"fields":{}}',
              ) as { fields?: Record<string, string> };
              const next = {
                ...saved,
                fields: { ...(saved.fields ?? {}), [field]: value },
              };
              window.localStorage.setItem(storageKey, JSON.stringify(next));
              window.dispatchEvent(
                new CustomEvent("harborview:visitor-draft-updated", {
                  detail: next,
                }),
              );
              return {
                status: "success",
                summary: `Updated the local visitor draft field '${field}'. No patient, registration, or appointment was created.`,
                detailed_data: { field, persisted: false },
              };
            }
            case "search_recognition_availability": {
              const specialty =
                typeof toolCall.parameters.specialty === "string"
                  ? toolCall.parameters.specialty
                  : "Family Medicine";
              const preference =
                toolCall.parameters.timePreference === "Morning" ||
                toolCall.parameters.timePreference === "Afternoon"
                  ? toolCall.parameters.timePreference
                  : undefined;
              const slots = await clinicApi.searchRecognitionSlots(
                specialty,
                actor,
                preference,
              );
              return {
                status: "success",
                summary: slots.length
                  ? `Found ${slots.length} available administrative time${slots.length === 1 ? "" : "s"} for ${specialty}.`
                  : `No availability was found for ${specialty}.`,
                items: slotItems(slots),
                detailed_data: slots,
              };
            }
            case "get_my_appointments": {
              if (actor.mode !== "activePatient")
                return blocked(
                  "SIGN_IN_REQUIRED: Only an authenticated patient may access their own appointments.",
                );
              const appointments = await clinicApi.getMyAppointments(actor);
              return {
                status: "success",
                summary: `Returned ${appointments.length} appointment record${appointments.length === 1 ? "" : "s"} owned by this signed-in patient.`,
                detailed_data: appointments,
              };
            }
            case "get_my_laboratory_result_status": {
              if (actor.mode !== "activePatient")
                return blocked(
                  "SIGN_IN_REQUIRED: Laboratory result status is only available to the authenticated patient who owns the release.",
                );
              const results = await clinicApi.getMyLaboratoryResults(actor);
              return {
                status: "success",
                summary:
                  "Returned release status and portal links only. No laboratory result interpretation is provided.",
                detailed_data: results,
              };
            }
            case "get_my_document_requests": {
              if (actor.mode !== "activePatient")
                return blocked(
                  "SIGN_IN_REQUIRED: Only an authenticated patient may access their own document requests.",
                );
              const requests = await clinicApi.getMyDocumentRequests(actor);
              return {
                status: "success",
                summary: `Returned ${requests.length} document request${requests.length === 1 ? "" : "s"} for this patient.`,
                detailed_data: requests,
              };
            }
            case "request_my_appointment": {
              if (actor.mode !== "activePatient")
                return blocked(
                  "SIGN_IN_REQUIRED: Visitors may browse availability but cannot hold or request an appointment.",
                );
              const slotId = String(toolCall.parameters.slotId ?? "");
              if (!slotId)
                return blocked(
                  "CONFIRMATION_REQUIRED: A selected slot is required before a patient appointment request can be submitted.",
                );
              const appointment = await clinicApi.requestMyAppointment(
                slotId,
                String(
                  toolCall.parameters.appointmentType ?? "General appointment",
                ),
                actor,
              );
              return {
                status: "success",
                summary: `Appointment request ${appointment.id} was received for staff review. It is not yet a confirmed appointment.`,
                detailed_data: appointment,
              };
            }
            case "review_registration_draft_duplicates": {
              if (actor.mode !== "receptionist")
                return blocked(
                  "RECEPTIONIST_PERMISSION_REQUIRED: Only reception may review possible patient duplicates.",
                );
              const draftId = String(toolCall.parameters.draftId ?? "");
              if (!draftId)
                return blocked(
                  "DRAFT_REQUIRED: Select a Harborview registration draft before duplicate review.",
                );
              const matches = await clinicApi.getReceptionDuplicateMatches(
                draftId,
                actor,
              );
              return {
                status: "success",
                summary: matches.length
                  ? `Found ${matches.length} possible duplicate match${matches.length === 1 ? "" : "es"}; staff review is required.`
                  : "No possible duplicate matches were found.",
                detailed_data: matches,
              };
            }
            case "create_reception_intake_from_draft": {
              if (actor.mode !== "receptionist")
                return blocked(
                  "RECEPTIONIST_PERMISSION_REQUIRED: Only reception can create a patient and intake from a reviewed draft.",
                );
              const draftId = String(toolCall.parameters.draftId ?? "");
              const specialty = String(
                toolCall.parameters.requestedSpecialty ?? "Family Medicine",
              );
              if (!draftId)
                return blocked(
                  "DRAFT_REQUIRED: Select a reviewed draft before creating an intake.",
                );
              const intake = await clinicApi.createReceptionIntake(
                draftId,
                specialty,
                actor,
                typeof toolCall.parameters.selectedExistingPatientId ===
                  "string"
                  ? toolCall.parameters.selectedExistingPatientId
                  : undefined,
              );
              return {
                status: "success",
                summary: `Created patient ${intake.patient.id} and intake ${intake.intake.id}. A recognition appointment still requires separate staff confirmation.`,
                detailed_data: intake,
              };
            }
            case "book_recognition_appointment": {
              if (actor.mode !== "receptionist")
                return blocked(
                  "RECEPTIONIST_PERMISSION_REQUIRED: Only reception can confirm a recognition appointment.",
                );
              const patientId = String(toolCall.parameters.patientId ?? "");
              const intakeCaseId = String(
                toolCall.parameters.intakeCaseId ?? "",
              );
              const slotId = String(toolCall.parameters.slotId ?? "");
              if (!patientId || !intakeCaseId || !slotId)
                return blocked(
                  "CONFIRMATION_REQUIRED: A reviewed patient, intake, and slot must be selected before reception can book.",
                );
              const appointment = await clinicApi.bookRecognitionAppointment(
                patientId,
                intakeCaseId,
                slotId,
                actor,
              );
              return {
                status: "success",
                summary: `Recognition appointment ${appointment.id} is confirmed by reception.`,
                detailed_data: appointment,
              };
            }

            case "navigate_to_view": {
              const destination =
                typeof toolCall.parameters.destination === "string"
                  ? toolCall.parameters.destination
                  : "";
              if (!isNavigationDestination(destination))
                return blocked(
                  "NAVIGATION_DESTINATION_INVALID: Harborview could not match that request to an approved internal view.",
                );
              const route = ASSISTANT_VIEW_ROUTES[destination];
              if (route.actor !== actor.mode)
                return blocked(
                  "NAVIGATION_ACCESS_DENIED: That view is not available in the current Harborview actor lane.",
                );
              if (pathname === route.pathname)
                return {
                  status: "success",
                  summary: `The ${route.label} view is already open.`,
                  detailed_data: {
                    destination,
                    pathname: route.pathname,
                    navigationStatus: "already_open",
                  },
                };
              router.push(route.pathname);
              return {
                status: "success",
                summary: `Navigation to the ${route.label} view has been initiated.`,
                detailed_data: {
                  destination,
                  pathname: route.pathname,
                  navigationStatus: "initiated",
                },
              };
            }
            case "navigate_to_record": {
              const recordType =
                typeof toolCall.parameters.recordType === "string"
                  ? toolCall.parameters.recordType
                  : "";
              const recordId =
                typeof toolCall.parameters.recordId === "string"
                  ? toolCall.parameters.recordId.trim()
                  : "";
              if (!isNavigationRecordType(recordType))
                return blocked(
                  "RECORD_NAVIGATION_TYPE_INVALID: Harborview could not match that request to an approved record detail view.",
                );
              if (!isSafeHarborviewRecordId(recordId))
                return blocked(
                  "RECORD_NAVIGATION_ID_INVALID: A valid Harborview record identifier is required before navigation can begin.",
                );
              const route = ASSISTANT_RECORD_ROUTES[recordType];
              if (route.actor !== actor.mode)
                return blocked(
                  "NAVIGATION_ACCESS_DENIED: That record type is not available in the current Harborview actor lane.",
                );
              const targetPath = route.pathname(recordId);
              router.push(targetPath);
              return {
                status: "success",
                summary: `Navigation to the requested ${route.label} has been initiated.`,
                detailed_data: {
                  recordType,
                  recordId,
                  pathname: targetPath,
                  navigationStatus: "initiated",
                },
              };
            }
            default:
              return blocked(
                `The requested action '${toolCall.toolName}' is not available in the ${actor.mode} Harborview proof lane.`,
              );
          }
        } catch (error) {
          return toToolError(error);
        }
      },
    [actor, pathname, router],
  );

  if (!apiKey) {
    return (
      <aside className="fixed bottom-5 right-5 z-50 hidden max-w-xs border border-[#102b3d]/12 bg-[#f7f7f2] p-4 shadow-xl md:block">
        <div className="flex gap-3">
          <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#277579]" />
          <p className="text-xs leading-5 text-[#102b3d]/70">
            <strong className="text-[#102b3d]">
              Directiv client-managed proof ready.
            </strong>{" "}
            The live assistant appears after{" "}
            <code>NEXT_PUBLIC_DIRECTIVSYS_API_KEY</code> is configured.
            Harborview remains the transcript and document owner.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <DirectivSysProvider apiKey={apiKey} config={{ timeout: 30000 }}>
      <DirectivSysChatbox
        onIntentDetected={onIntentDetected}
        currentContext={{
          userId: actor.id,
          userName: actor.mode,
          userPreferences: `Actor lane: ${actor.mode}. Visitor: local draft and availability only; no persistent registration, holds, or booking. Active patient: own appointments, released-result status/link only, document requests, and appointment requests; never repeat intake. Receptionist: reviewed-draft duplicate review, patient/intake creation, availability search, and staff-confirmed recognition booking.`,
          interfaceState: {
            currentPageName: pageName,
            currentPageDescription: `Current internal route: ${pathname}. Administrative coordination only. Harborview owns documents and transcript; document uploads never go to Directiv. No clinical interpretation, triage, diagnosis, urgency, or treatment advice.`,
          },
        }}
        conversation={{
          mode: "clientManaged",
          conversationId,
          contextWindow: 10,
          history,
          clearEphemeralStateOnEnd: true,
        }}
        renderMode="standard"
        defaultOpen={false}
        boxLocation="bottom-right"
        titleText="Harborview assistant"
        titleIcon={<Bot size={17} />}
        headerBgColor="#102b3d"
        titleTextColor="#ffffff"
        placeholder="Ask about administrative next steps…"
        width="390px"
        height="540px"
      />
    </DirectivSysProvider>
  );
}
