import { createDefaultState } from "../../state";

function normalizeTimelineState(historyState) {
  if (!historyState || !Array.isArray(historyState.rows)) return null;
  return createDefaultState(historyState.rows);
}

export function normalizeTimelinePayload(payload) {
  const past = Array.isArray(payload?.past)
    ? payload.past.map((state) => normalizeTimelineState(state)).filter(Boolean)
    : [];
  const future = Array.isArray(payload?.future)
    ? payload.future
        .map((state) => normalizeTimelineState(state))
        .filter(Boolean)
    : [];

  return { past, future };
}
