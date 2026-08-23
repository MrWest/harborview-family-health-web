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
