// Design: This presentation adapter connects the published SDK to Harborview-owned callbacks while keeping tool policy and transcript persistence in dedicated feature modules
import { Bot } from "lucide-react";
import { DirectivSysChatbox, DirectivSysProvider, type CurrentContext, type OnIntentDetected } from "@directivsys/react-sdk";
import type { ClientManagedAssistantProps } from "@/features/directiv/types";

type HarborviewChatboxProps = ClientManagedAssistantProps & {
  apiKey: string;
  onIntentDetected: OnIntentDetected;
  history: {
    load: () => Promise<Array<{ id: string; role: "user" | "assistant"; content: string; createdAt: string; visibility: "visible" | "internal" }>>;
    append: (events: Array<{ id: string; role: "user" | "assistant"; content: string; createdAt: string; visibility: "visible" | "internal" }>) => Promise<void>;
    clear: () => Promise<void>;
  };
  currentContext: CurrentContext;
};

export function HarborviewChatbox({ apiKey, actor, conversationId, onIntentDetected, history, currentContext }: HarborviewChatboxProps) {
  return <DirectivSysProvider apiKey={apiKey} config={{ timeout: 30000, baseURL: "https://staging-api.directivsys.com" }}><DirectivSysChatbox
    onIntentDetected={onIntentDetected}
    currentContext={currentContext}
    conversation={{ mode: "clientManaged", conversationId, contextWindow: 10, history, clearEphemeralStateOnEnd: true }}
    renderMode="standard" defaultOpen={false} boxLocation="bottom-right" titleText="Harborview assistant" titleIcon={<Bot size={17}/>} headerBgColor="#102b3d" titleTextColor="#ffffff"
    placeholder={`Ask about ${actor.mode === "activePatient" ? "patient services" : "administrative next steps"}…`} width="390px" height="540px"
  /></DirectivSysProvider>;
}
