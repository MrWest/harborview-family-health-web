// Design: This route gives an existing patient one administrative document-request detail without returning them to intake.
import { PatientDocumentRequestDetail } from "@/features/patient/PatientRecordDetails";

export default async function PatientDocumentRequestDetailPage({ params }: { params: Promise<{ documentRequestId: string }> }) {
  const { documentRequestId } = await params;
  return <PatientDocumentRequestDetail documentRequestId={documentRequestId}/>;
}
