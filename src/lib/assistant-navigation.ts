// Design: Assistant navigation is intentionally a closed, actor-scoped route policy. The model supplies a named intent and record ID, never an arbitrary URL.
import type { DemoActor } from "./clinic-types";

export type NavigationDestination =
  | "visitor_registration"
  | "visitor_registration_review"
  | "patient_overview"
  | "patient_appointments"
  | "patient_results"
  | "patient_documents"
  | "reception_dashboard"
  | "reception_intake"
  | "reception_new_intake"
  | "reception_patients"
  | "reception_schedule"
  | "reception_laboratory";

export type NavigationRecordType =
  | "patient_appointment"
  | "laboratory_result_release"
  | "patient_document_request"
  | "registration_draft"
  | "patient_profile"
  | "intake_case"
  | "reception_appointment";

type ActorMode = DemoActor["mode"];
type ViewRoute = { actor: ActorMode; label: string; pathname: string };
type RecordRoute = { actor: ActorMode; label: string; pathname: (recordId: string) => string };

export const ASSISTANT_VIEW_ROUTES: Record<NavigationDestination, ViewRoute> = {
  visitor_registration: { actor: "visitor", label: "registration", pathname: "/register" },
  visitor_registration_review: { actor: "visitor", label: "registration review", pathname: "/register/review" },
  patient_overview: { actor: "activePatient", label: "patient overview", pathname: "/patient" },
  patient_appointments: { actor: "activePatient", label: "appointments", pathname: "/patient/appointments" },
  patient_results: { actor: "activePatient", label: "laboratory result status", pathname: "/patient/results" },
  patient_documents: { actor: "activePatient", label: "document requests", pathname: "/patient/intake" },
  reception_dashboard: { actor: "receptionist", label: "reception dashboard", pathname: "/reception" },
  reception_intake: { actor: "receptionist", label: "intake workspace", pathname: "/reception/intake" },
  reception_new_intake: { actor: "receptionist", label: "new intake", pathname: "/reception/new-intake" },
  reception_patients: { actor: "receptionist", label: "patient directory", pathname: "/reception/patients" },
  reception_schedule: { actor: "receptionist", label: "schedule", pathname: "/reception/schedule" },
  reception_laboratory: { actor: "receptionist", label: "laboratory workspace", pathname: "/reception/laboratory" },
};

const encodedRecord = (recordId: string) => encodeURIComponent(recordId);

export const ASSISTANT_RECORD_ROUTES: Record<NavigationRecordType, RecordRoute> = {
  patient_appointment: { actor: "activePatient", label: "appointment detail", pathname: (id) => `/patient/appointments/${encodedRecord(id)}` },
  laboratory_result_release: { actor: "activePatient", label: "laboratory release detail", pathname: (id) => `/patient/results/${encodedRecord(id)}` },
  patient_document_request: { actor: "activePatient", label: "document request detail", pathname: (id) => `/patient/documents/${encodedRecord(id)}` },
  registration_draft: { actor: "receptionist", label: "registration draft detail", pathname: (id) => `/reception/drafts/${encodedRecord(id)}` },
  patient_profile: { actor: "receptionist", label: "patient administrative profile", pathname: (id) => `/reception/patients/${encodedRecord(id)}` },
  intake_case: { actor: "receptionist", label: "recognition intake detail", pathname: (id) => `/reception/intakes/${encodedRecord(id)}` },
  reception_appointment: { actor: "receptionist", label: "reception appointment detail", pathname: (id) => `/reception/appointments/${encodedRecord(id)}` },
};

export function isNavigationDestination(value: string): value is NavigationDestination {
  return value in ASSISTANT_VIEW_ROUTES;
}

export function isNavigationRecordType(value: string): value is NavigationRecordType {
  return value in ASSISTANT_RECORD_ROUTES;
}

export function isSafeHarborviewRecordId(value: string) {
  return /^[A-Za-z0-9_-]{1,200}$/.test(value);
}
