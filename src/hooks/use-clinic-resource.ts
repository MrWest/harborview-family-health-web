"use client";

import { useCallback, useEffect, useState } from "react";

type ResourceState<T> = {
  data: T;
  isLoading: boolean;
  error: string | null;
};

export function useClinicResource<T>(resourceKey: string, load: () => Promise<T>, fallback: T) {
  const [state, setState] = useState<ResourceState<T>>({ data: fallback, isLoading: true, error: null });
  const [refreshCount, setRefreshCount] = useState(0);

  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  useEffect(() => {
    let active = true;
    void load()
      .then((data) => { if (active) setState({ data, isLoading: false, error: null }); })
      .catch((error) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : "The clinic service is unavailable right now.";
        setState({ data: fallback, isLoading: false, error: message });
      });
    return () => { active = false; };
  // The caller supplies a stable resource key that deliberately controls reloads.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceKey, refreshCount]);

  return { ...state, refresh };
}
