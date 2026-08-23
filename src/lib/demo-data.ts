import type { AppointmentSlot, IntakeCase, Patient, Provider, Specialty } from "./clinic-types";

export const specialties: Specialty[] = [
  { id: "family-medicine", name: "Family Medicine", description: "New and returning family care appointments" },
  { id: "pediatrics", name: "Pediatrics", description: "Administrative appointment support for children" },
  { id: "womens-health", name: "Women’s Health", description: "Referral and appointment-readiness coordination" },
  { id: "dermatology", name: "Dermatology", description: "Specialist referral coordination" },
];

export const fallbackProviders: Provider[] = [
  { id: "prov-bennett", displayName: "Dr. Maya Bennett", providerType: "Physician", specialty: { id: 1, name: "Family Medicine" } },
  { id: "prov-alvarez", displayName: "Dr. Sofia Alvarez", providerType: "Physician", specialty: { id: 2, name: "Pediatrics" } },
  { id: "prov-patel", displayName: "Dr. Naomi Patel", providerType: "Physician", specialty: { id: 3, name: "Women’s Health" } },
  { id: "prov-park", displayName: "Dr. Hannah Park", providerType: "Physician", specialty: { id: 4, name: "Dermatology" } },
];

export const fallbackSlots: AppointmentSlot[] = [
  { id: "demo-slot-1", resourceType: "Provider", resourceId: "prov-bennett", startsAtUtc: "2026-08-25T13:00:00Z", endsAtUtc: "2026-08-25T13:30:00Z" },
  { id: "demo-slot-2", resourceType: "Provider", resourceId: "prov-bennett", startsAtUtc: "2026-08-26T15:30:00Z", endsAtUtc: "2026-08-26T16:00:00Z" },
  { id: "demo-slot-3", resourceType: "Provider", resourceId: "prov-bennett", startsAtUtc: "2026-08-27T14:00:00Z", endsAtUtc: "2026-08-27T14:30:00Z" },
];

export const fallbackIntakeCases: IntakeCase[] = [
  { id: "intake-001", requestedSpecialty: "Dermatology", status: "NeedsStaffReview", missingItemsJson: '["Referring provider signature"]', patient: { id: "pat-001", displayName: "Avery Collins" } },
  { id: "intake-004", requestedSpecialty: "Family Medicine", status: "NeedsStaffReview", missingItemsJson: '["Coverage member identifier"]', patient: { id: "pat-004", displayName: "Casey Patel" } },
  { id: "intake-007", requestedSpecialty: "Pediatrics", status: "InProgress", missingItemsJson: "[]", patient: { id: "pat-007", displayName: "Morgan Ellis" } },
];

export const fallbackPatients: Patient[] = [
  { id: "pat-001", displayName: "Avery Collins", dateOfBirth: "1980-01-01", preferredContactMethod: "Email", email: "avery.collins@example.test" },
  { id: "pat-004", displayName: "Casey Patel", dateOfBirth: "1974-08-14", preferredContactMethod: "Phone", phone: "555-010-0004" },
  { id: "pat-007", displayName: "Morgan Ellis", dateOfBirth: "2014-03-22", preferredContactMethod: "Email", email: "morgan.ellis@example.test" },
];
