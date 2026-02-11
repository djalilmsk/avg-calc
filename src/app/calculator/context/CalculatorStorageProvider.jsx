import { useCallback, useMemo } from "react";
import { STORAGE_KEY } from "../constants";
import { safeParse } from "../utils";
import { CalculatorStorageContext } from "./storageContextValue";

const HISTORY_TIMELINE_KEY_PREFIX = `${STORAGE_KEY}:timeline:`;

function readFirstAvailableStore() {
  if (typeof window === "undefined") return null;

  const localRaw = window.localStorage.getItem(STORAGE_KEY);
  if (localRaw) {
    const localParsed = safeParse(localRaw);
    if (localParsed) return localParsed;
  }

  const sessionRaw = window.sessionStorage.getItem(STORAGE_KEY);
  const sessionParsed = safeParse(sessionRaw);
  if (!sessionParsed) return null;

  // Migrate old session-only data to localStorage.
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionParsed));
  return sessionParsed;
}

export function CalculatorStorageProvider({ children }) {
  const loadStore = useCallback(() => readFirstAvailableStore(), []);

  const saveStore = useCallback((payload) => {
    if (typeof window === "undefined") return false;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  }, []);

  const clearStore = useCallback(() => {
    if (typeof window === "undefined") return false;
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  }, []);

  const loadHistoryTimeline = useCallback((historyId) => {
    if (typeof window === "undefined") return null;
    const normalizedHistoryId = String(historyId ?? "").trim();
    if (!normalizedHistoryId) return null;
    const historyKey = `${HISTORY_TIMELINE_KEY_PREFIX}${normalizedHistoryId}`;
    return safeParse(window.sessionStorage.getItem(historyKey));
  }, []);

  const saveHistoryTimeline = useCallback((historyId, payload) => {
    if (typeof window === "undefined") return false;
    const normalizedHistoryId = String(historyId ?? "").trim();
    if (!normalizedHistoryId) return false;
    const historyKey = `${HISTORY_TIMELINE_KEY_PREFIX}${normalizedHistoryId}`;
    window.sessionStorage.setItem(historyKey, JSON.stringify(payload));
    return true;
  }, []);

  const clearHistoryTimeline = useCallback((historyId) => {
    if (typeof window === "undefined") return false;
    const normalizedHistoryId = String(historyId ?? "").trim();
    if (!normalizedHistoryId) return false;
    const historyKey = `${HISTORY_TIMELINE_KEY_PREFIX}${normalizedHistoryId}`;
    window.sessionStorage.removeItem(historyKey);
    return true;
  }, []);

  const api = useMemo(
    () => ({
      loadStore,
      saveStore,
      clearStore,
      loadHistoryTimeline,
      saveHistoryTimeline,
      clearHistoryTimeline,
      loadTemplateHistory: loadHistoryTimeline,
      saveTemplateHistory: saveHistoryTimeline,
      clearTemplateHistory: clearHistoryTimeline
    }),
    [
      clearStore,
      clearHistoryTimeline,
      loadStore,
      loadHistoryTimeline,
      saveStore,
      saveHistoryTimeline
    ]
  );

  return (
    <CalculatorStorageContext.Provider value={api}>
      {children}
    </CalculatorStorageContext.Provider>
  );
}
