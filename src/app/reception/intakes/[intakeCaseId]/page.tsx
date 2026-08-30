// Design: Reception intake detail makes administrative progression inspectable without changing the guided new-intake workflow.
import { ReceptionIntakeDetail } from "@/features/reception/ReceptionRecordDetails";

export default async function ReceptionIntakeDetailPage({
  params,
}: {
  params: Promise<{ intakeCaseId: string }>;
}) {
  const { intakeCaseId } = await params;
  return <ReceptionIntakeDetail intakeCaseId={intakeCaseId} />;
}
