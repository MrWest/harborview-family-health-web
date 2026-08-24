// Design: Reception patient detail is an administrative profile protected by the receptionist actor lane.
import { ReceptionPatientDetail } from "@/features/reception/ReceptionRecordDetails";

export default async function ReceptionPatientDetailPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  return <ReceptionPatientDetail patientId={patientId}/>;
}
