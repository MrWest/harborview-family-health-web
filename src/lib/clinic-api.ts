import type { Appointment, AppointmentSlot, DashboardOverview, IntakeCase, LaboratoryService, Patient, Provider } from "./clinic-types";

const baseUrl = process.env.NEXT_PUBLIC_HARBORVIEW_API_URL ?? "https://harborview-family-health-api-14089992360.us-central1.run.app";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { cache: "no-store", ...init });
  if (!response.ok) {
    const detail = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(detail?.message ?? `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const clinicApi = {
  getProviders: (specialty: string) => request<Provider[]>(`/api/providers?specialty=${encodeURIComponent(specialty)}`),
  getSlots: (providerId: string) => request<AppointmentSlot[]>(`/api/appointment-slots?resourceType=Provider&resourceId=${encodeURIComponent(providerId)}`),
  getIntakeCases: () => request<IntakeCase[]>("/api/intake-cases"),
  getPatients: (query = "") => request<Patient[]>(`/api/patients${query ? `?query=${encodeURIComponent(query)}` : ""}`),
  getLaboratoryServices: () => request<LaboratoryService[]>("/api/laboratory/services"),
  getOverview: () => request<DashboardOverview>("/api/demo/overview"),
  holdAppointment: (slotId: string) => request<Appointment>("/api/appointments/hold", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: "pat-001",
      slotId,
      administrativeReason: "Patient-selected proof appointment",
      staffReviewRequired: true,
    }),
  }),
  createReviewTask: (intakeCaseId: string, reason: string) => request("/api/staff-review-tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intakeCaseId, reason }),
  }),
  uploadProofDocument: async (intakeCaseId: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request(`/api/intake-cases/${intakeCaseId}/documents`, { method: "POST", body });
  },
};
