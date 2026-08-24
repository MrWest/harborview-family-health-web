// Design: This route presents an authorized appointment detail with a direct return to the patient’s administrative appointment list.
import { PatientAppointmentDetail } from "@/features/patient/PatientRecordDetails";

export default async function PatientAppointmentDetailPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params;
  return <PatientAppointmentDetail appointmentId={appointmentId}/>;
}
