export type View = "patient" | "staff";

export type Specialty = {
  id: string;
  name: string;
  description: string;
};

export type Provider = {
  id: string;
  displayName: string;
  providerType: string;
  specialty?: { id: number; name: string };
};

export type AppointmentSlot = {
  id: string;
  resourceType: "Provider" | "Laboratory";
  resourceId: string;
  startsAtUtc: string;
  endsAtUtc: string;
  status?: string;
};

export type Appointment = {
  id: string;
  status: string;
  slotId: string;
  staffReviewRequired: boolean;
};

export type IntakeCase = {
  id: string;
  requestedSpecialty: string;
  status: string;
  missingItemsJson: string;
  patient?: { id: string; displayName: string };
};

export type DashboardOverview = {
  patients: number;
  intakeCases: number;
  openStaffReviewTasks: number;
  availableSlots: number;
};

export type Patient = {
  id: string;
  displayName: string;
  dateOfBirth: string;
  preferredContactMethod: string;
  email?: string;
  phone?: string;
  portalSubjectId?: string;
  registrationStatus?: string;
  preferredLanguage?: string;
};

export type DemoActor = {
  mode: "visitor" | "activePatient" | "receptionist";
  id: string;
};

export type RegistrationDraft = {
  id: string;
  status: string;
  sourceDocumentId?: string;
  candidateFieldsJson: string;
  missingFieldsJson: string;
  createdAtUtc: string;
  expiresAtUtc: string;
};

export type ExtractedDocument = {
  status: "success" | "error";
  documentId: string;
  extractionStatus: string;
  sourceLanguage: string;
  candidateFields: Record<string, string | null>;
  missingFields: string[];
  classification: "extracted/unverified";
  safetyNotice: string;
};

export type LaboratoryResultRelease = {
  id: string;
  resultReference: string;
  serviceName: string;
  collectedAtUtc: string;
  releaseStatus: "Pending" | "Released";
  availableAtUtc?: string;
  portalDocumentUrl?: string;
};

export type PatientDocumentRequest = {
  id: string;
  category: string;
  patientVisibleLabel: string;
  status: string;
  dueAtUtc?: string;
};

export type ClientManagedEvent = {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "tool";
  content: string;
  isInternal: boolean;
  turnId?: string;
  eventType?: string;
  toolName?: string;
  toolStatus?: string;
  createdAtUtc: string;
};

export type WorkflowBlocked = {
  status: "blocked";
  reason: string;
  summary: string;
};

export type LaboratoryService = {
  id: string;
  name: string;
  slotMinutes: number;
  requirementsJson: string;
};

export type Notice = {
  tone: "success" | "error" | "info";
  message: string;
};
