// Design: Reception sees provenance-labelled candidate fields, not clinical conclusions, when opening an intake draft.
import { ReceptionDraftDetail } from "@/features/reception/ReceptionRecordDetails";

export default async function ReceptionDraftDetailPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  return <ReceptionDraftDetail draftId={draftId} />;
}
