"use client";

// Design: The direct assistant stays a browser-only interaction surface so the patient/reception shells preserve their server-rendered, document-like stability.
import { useEffect, useState } from "react";
import type { DemoActor } from "@/lib/clinic-types";

type AssistantComponent = (props: {
  actor: DemoActor;
  conversationId: string;
  pageName: string;
}) => React.ReactNode;

export function ClientManagedAssistantLoader({
  actor,
  conversationId,
  pageName,
}: {
  actor: DemoActor;
  conversationId: string;
  pageName: string;
}) {
  const [Assistant, setAssistant] = useState<AssistantComponent | null>(null);
  useEffect(() => {
    let active = true;
    void import("./ClientManagedAssistant").then((module) => {
      if (active) setAssistant(() => module.ClientManagedAssistant);
    });
    return () => {
      active = false;
    };
  }, []);
  return Assistant ? (
    <Assistant
      actor={actor}
      conversationId={conversationId}
      pageName={pageName}
    />
  ) : null;
}
