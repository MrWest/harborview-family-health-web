// Design: Reception appointment detail supports administrative review and schedule navigation without exposing clinical content.
import { ReceptionAppointmentDetail } from "@/features/reception/ReceptionRecordDetails";

export default async function ReceptionAppointmentDetailPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  return <ReceptionAppointmentDetail appointmentId={appointmentId} />;
}
