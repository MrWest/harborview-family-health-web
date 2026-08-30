"use client";

// Design: This is deliberately a thin composition boundary. Conversation persistence, tool policy, and SDK presentation are all separated into focused Harborview modules.
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createHarborviewAgentActions } from "@/features/directiv/agent-actions";
import { createHarborviewAssistantContext } from "@/features/directiv/assistant-context";
import { createHarborviewConversationHistory } from "@/features/directiv/conversation-history";
import type { ClientManagedAssistantProps } from "@/features/directiv/types";
import { AssistantUnavailableNotice } from "./AssistantUnavailableNotice";
import { HarborviewChatbox } from "./HarborviewChatbox";

export function ClientManagedAssistant({
  actor,
  conversationId,
  pageName,
}: ClientManagedAssistantProps) {
  const apiKey = process.env.NEXT_PUBLIC_DIRECTIVSYS_API_KEY;
  const router = useRouter();
  const pathname = usePathname();
  const history = useMemo(
    () => createHarborviewConversationHistory(conversationId, actor),
    [actor, conversationId],
  );
  const onIntentDetected = useMemo(
    () =>
      createHarborviewAgentActions({ actor, pathname, navigate: router.push }),
    [actor, pathname, router.push],
  );
  const currentContext = useMemo(
    () => createHarborviewAssistantContext(actor, pageName, pathname),
    [actor, pageName, pathname],
  );

  if (!apiKey) return <AssistantUnavailableNotice />;
  return (
    <HarborviewChatbox
      apiKey={apiKey}
      actor={actor}
      conversationId={conversationId}
      pageName={pageName}
      onIntentDetected={onIntentDetected}
      history={history}
      currentContext={currentContext}
    />
  );
}
