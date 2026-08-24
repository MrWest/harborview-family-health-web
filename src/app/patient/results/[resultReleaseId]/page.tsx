// Design: This route shows released-status detail and a portal link only, never laboratory interpretation.
import { PatientLaboratoryReleaseDetail } from "@/features/patient/PatientRecordDetails";

export default async function PatientLaboratoryReleaseDetailPage({ params }: { params: Promise<{ resultReleaseId: string }> }) {
  const { resultReleaseId } = await params;
  return <PatientLaboratoryReleaseDetail resultReleaseId={resultReleaseId}/>;
}
