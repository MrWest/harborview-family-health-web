import type {
  Appointment,
  AppointmentDetail,
  AppointmentSlot,
  ClientManagedEvent,
  DashboardOverview,
  DemoActor,
  ExtractedDocument,
  IntakeCase,
  LaboratoryResultRelease,
  LaboratoryService,
  Patient,
  PatientDocumentRequest,
  Provider,
  ReceptionIntakeDetail,
  RegistrationDraft,
  WorkflowBlocked,
} from "./clinic-types";

const baseUrl = process.env.NEXT_PUBLIC_HARBORVIEW_API_URL;

export class ClinicApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body:
      | WorkflowBlocked
      | { message?: string; summary?: string; reason?: string }
      | null,
  ) {
    super(message);
  }
}

function actorHeaders(actor?: DemoActor, correlationId?: string): HeadersInit {
  return {
    ...(actor
      ? {
          "X-Harborview-Actor-Mode": actor.mode,
          "X-Harborview-Actor-Id": actor.id,
        }
      : {}),
    ...(correlationId ? { "X-Correlation-Id": correlationId } : {}),
  };
}

async function request<T>(
  path: string,
  init?: RequestInit,
  actor?: DemoActor,
): Promise<T> {
  const headers = new Headers(init?.headers);
  Object.entries(actorHeaders(actor, crypto.randomUUID())).forEach(
    ([key, value]) => headers.set(key, value),
  );
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  });
  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as
      | WorkflowBlocked
      | { message?: string; summary?: string; reason?: string }
      | null;
    const message =
      detail?.summary ??
      (detail && "message" in detail ? detail.message : undefined) ??
      `Request failed with ${response.status}`;
    throw new ClinicApiError(message, response.status, detail);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const clinicApi = {
  getProviders: (specialty: string) =>
    request<Provider[]>(
      `/api/providers?specialty=${encodeURIComponent(specialty)}`,
    ),
  getSlots: (providerId: string) =>
    request<AppointmentSlot[]>(
      `/api/appointment-slots?resourceType=Provider&resourceId=${encodeURIComponent(providerId)}`,
    ),
  getIntakeCases: () => request<IntakeCase[]>("/api/intake-cases"),
  getPatients: (query = "") =>
    request<Patient[]>(
      `/api/patients${query ? `?query=${encodeURIComponent(query)}` : ""}`,
    ),
  getLaboratoryServices: () =>
    request<LaboratoryService[]>("/api/laboratory/services"),
  getOverview: () => request<DashboardOverview>("/api/demo/overview"),
  holdAppointment: (slotId: string) =>
    request<Appointment>("/api/appointments/hold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: "pat-001",
        slotId,
        administrativeReason: "Patient-selected proof appointment",
        staffReviewRequired: true,
      }),
    }),
  createReviewTask: (intakeCaseId: string, reason: string) =>
    request("/api/staff-review-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intakeCaseId, reason }),
    }),
  uploadProofDocument: async (intakeCaseId: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request(`/api/intake-cases/${intakeCaseId}/documents`, {
      method: "POST",
      body,
    });
  },
  extractRegistrationDocument: async (
    file: File,
    actor: DemoActor,
    draftId?: string,
  ) => {
    const body = new FormData();
    body.append("file", file);
    if (draftId) body.append("draftId", draftId);
    return request<ExtractedDocument>(
      "/api/workflows/registration-documents/extract",
      { method: "POST", body },
      actor,
    );
  },
  createRegistrationDraft: (
    candidateFields: Record<string, string | null>,
    missingFields: string[],
    sourceDocumentId: string | undefined,
    actor: DemoActor,
  ) =>
    request<RegistrationDraft>(
      "/api/workflows/registration-drafts",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateFields,
          missingFields,
          sourceDocumentId,
        }),
      },
      actor,
    ),
  searchRecognitionSlots: (
    specialty: string,
    actor: DemoActor,
    timePreference?: "Morning" | "Afternoon",
  ) =>
    request<AppointmentSlot[]>(
      "/api/workflows/recognition-slots/search",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialty,
          fromDateUtc: new Date().toISOString(),
          timePreference,
        }),
      },
      actor,
    ),
  getReceptionDuplicateMatches: (draftId: string, actor: DemoActor) =>
    request<Patient[]>(
      `/api/workflows/reception/duplicate-matches/${encodeURIComponent(draftId)}`,
      undefined,
      actor,
    ),
  createReceptionIntake: (
    draftId: string,
    requestedSpecialty: string,
    actor: DemoActor,
    selectedExistingPatientId?: string,
  ) =>
    request<{ patient: Patient; intake: IntakeCase }>(
      `/api/workflows/reception/intakes/from-draft?draftId=${encodeURIComponent(draftId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId,
          selectedExistingPatientId,
          requestedSpecialty,
          staffConfirmation: true,
        }),
      },
      actor,
    ),
  bookRecognitionAppointment: (
    patientId: string,
    intakeCaseId: string,
    slotId: string,
    actor: DemoActor,
  ) =>
    request<Appointment>(
      "/api/workflows/reception/recognition-appointments",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          intakeCaseId,
          slotId,
          reasonCategory: "Recognition",
          staffConfirmation: true,
        }),
      },
      actor,
    ),
  getMyAppointments: (actor: DemoActor) =>
    request<Appointment[]>(
      "/api/workflows/patient/me/appointments",
      undefined,
      actor,
    ),
  getMyAppointmentDetail: (appointmentId: string, actor: DemoActor) =>
    request<AppointmentDetail>(
      `/api/workflows/patient/me/appointments/${encodeURIComponent(appointmentId)}`,
      undefined,
      actor,
    ),
  getMyLaboratoryResults: (actor: DemoActor) =>
    request<LaboratoryResultRelease[]>(
      "/api/workflows/patient/me/laboratory-results",
      undefined,
      actor,
    ),
  getMyLaboratoryResultDetail: (resultReleaseId: string, actor: DemoActor) =>
    request<LaboratoryResultRelease>(
      `/api/workflows/patient/me/laboratory-results/${encodeURIComponent(resultReleaseId)}`,
      undefined,
      actor,
    ),
  getMyDocumentRequests: (actor: DemoActor) =>
    request<PatientDocumentRequest[]>(
      "/api/workflows/patient/me/document-requests",
      undefined,
      actor,
    ),
  getMyDocumentRequestDetail: (documentRequestId: string, actor: DemoActor) =>
    request<PatientDocumentRequest>(
      `/api/workflows/patient/me/document-requests/${encodeURIComponent(documentRequestId)}`,
      undefined,
      actor,
    ),
  getReceptionDraftDetail: (draftId: string, actor: DemoActor) =>
    request<RegistrationDraft>(
      `/api/workflows/registration-drafts/${encodeURIComponent(draftId)}`,
      undefined,
      actor,
    ),
  getReceptionPatientDetail: (patientId: string, actor: DemoActor) =>
    request<Patient>(
      `/api/workflows/reception/patients/${encodeURIComponent(patientId)}`,
      undefined,
      actor,
    ),
  getReceptionIntakeDetail: (intakeCaseId: string, actor: DemoActor) =>
    request<ReceptionIntakeDetail>(
      `/api/workflows/reception/intakes/${encodeURIComponent(intakeCaseId)}`,
      undefined,
      actor,
    ),
  getReceptionAppointmentDetail: (appointmentId: string, actor: DemoActor) =>
    request<AppointmentDetail>(
      `/api/workflows/reception/appointments/${encodeURIComponent(appointmentId)}`,
      undefined,
      actor,
    ),
  requestMyAppointment: (
    slotId: string,
    appointmentType: string,
    actor: DemoActor,
  ) =>
    request<Appointment>(
      "/api/workflows/patient/me/appointment-requests",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId,
          appointmentType,
          confirmationAcknowledged: true,
        }),
      },
      actor,
    ),
  getConversationEvents: (conversationId: string, actor: DemoActor) =>
    request<ClientManagedEvent[]>(
      `/api/conversations/${encodeURIComponent(conversationId)}/events/v2?take=10`,
      undefined,
      actor,
    ),
  appendConversationEvent: (
    conversationId: string,
    event: {
      id: string;
      role: ClientManagedEvent["role"];
      content: string;
      isInternal: boolean;
      turnId?: string;
      eventType?: string;
      toolName?: string;
      toolStatus?: string;
      createdAt?: string;
    },
    actor: DemoActor,
  ) =>
    request<ClientManagedEvent>(
      `/api/conversations/${encodeURIComponent(conversationId)}/events/v2`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: event.role,
          content: event.content,
          isInternal: event.isInternal,
          turnId: event.turnId,
          eventType: event.eventType,
          toolName: event.toolName,
          toolStatus: event.toolStatus,
          idempotencyKey: event.id,
          createdAtUtc: event.createdAt,
        }),
      },
      actor,
    ),
  clearConversationEvents: (conversationId: string, actor: DemoActor) =>
    request<void>(
      `/api/conversations/${encodeURIComponent(conversationId)}/events`,
      { method: "DELETE" },
      actor,
    ),
};
