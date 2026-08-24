// Design: Harborview owns all visible and hidden transcript events. This adapter gives the SDK bounded replay without granting Directiv persistence ownership.
import { clinicApi } from "@/lib/clinic-api";
import type { DemoActor } from "@/lib/clinic-types";

export function createHarborviewConversationHistory(conversationId: string, actor: DemoActor) {
  return {
    load: async () => {
      const events = await clinicApi.getConversationEvents(conversationId, actor);
      return events.map((event) => ({
        id: event.id,
        role: event.role === "user" ? "user" as const : "assistant" as const,
        content: event.content,
        createdAt: event.createdAtUtc,
        visibility: event.isInternal ? "internal" as const : "visible" as const,
      }));
    },
    append: async (events: Array<{ id: string; role: "user" | "assistant"; content: string; createdAt: string; visibility: "visible" | "internal" }>) => {
      await Promise.all(events.map((event) => clinicApi.appendConversationEvent(conversationId, {
        id: event.id,
        role: event.role,
        content: event.content,
        isInternal: event.visibility === "internal",
        eventType: event.visibility === "internal" ? "ToolResult" : "Message",
        createdAt: event.createdAt,
      }, actor)));
    },
    clear: async () => clinicApi.clearConversationEvents(conversationId, actor),
  };
}
