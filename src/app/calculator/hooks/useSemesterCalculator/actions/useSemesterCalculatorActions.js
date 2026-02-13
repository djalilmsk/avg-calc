import { useMemo } from "react";
import { useHistoryActions } from "./useHistoryActions";
import { useRowActions } from "./useRowActions";
import { useTemplateActions } from "./useTemplateActions";

export function useSemesterCalculatorActions(dependencies) {
  const rowActions = useRowActions(dependencies);
  const historyActions = useHistoryActions(dependencies);
  const templateActions = useTemplateActions(dependencies);

  return useMemo(
    () => ({
      ...rowActions,
      ...historyActions,
      ...templateActions
    }),
    [historyActions, rowActions, templateActions]
  );
}
