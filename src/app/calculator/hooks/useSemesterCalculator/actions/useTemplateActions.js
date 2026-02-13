import { useCallback, useMemo } from "react";
import { MAX_TEMPLATE_STORAGE } from "../../../constants";
import { createRowFromPayload } from "../rowModel";
import {
  findHistoryById,
  getNextUniqueTemplate
} from "../historyTemplateModel";

export function useTemplateActions({
  setTemplates,
  templatesRef,
  historiesRef
}) {
  const createTemplateFromHistory = useCallback(
    (historyId, templateDetails = {}) => {
      if (templatesRef.current.length >= MAX_TEMPLATE_STORAGE) return null;

      const history = findHistoryById(historyId, historiesRef.current);
      if (!history) return null;

      const templateName =
        String(templateDetails?.name ?? history.name).trim() || history.name;
      const templateYear =
        String(templateDetails?.year ?? "Custom").trim() || "Custom";
      const templateSemester =
        String(templateDetails?.semester ?? "--").trim() || "--";
      const templateId = getNextUniqueTemplate(templateName, templatesRef.current);
      const template = {
        id: templateId,
        name: templateName,
        year: templateYear,
        semester: templateSemester,
        rows: history.rows.map((row) =>
          createRowFromPayload(row, { clearScores: true })
        )
      };

      setTemplates((currentTemplates) => [...currentTemplates, template]);
      return template;
    },
    [historiesRef, setTemplates, templatesRef]
  );

  const deleteTemplate = useCallback((templateId) => {
    const normalizedTemplateId = String(templateId ?? "").trim();
    if (!normalizedTemplateId) return false;

    let removed = false;
    setTemplates((currentTemplates) => {
      const nextTemplates = currentTemplates.filter((template) => {
        const shouldKeep = template.id !== normalizedTemplateId;
        if (!shouldKeep) removed = true;
        return shouldKeep;
      });
      return nextTemplates;
    });
    return removed;
  }, [setTemplates]);

  const updateTemplate = useCallback((templateId, updates = {}) => {
    const normalizedTemplateId = String(templateId ?? "").trim();
    if (!normalizedTemplateId) return false;

    let didUpdate = false;
    setTemplates((currentTemplates) =>
      currentTemplates.map((template) => {
        if (template.id !== normalizedTemplateId) return template;

        const nextNameRaw =
          updates?.name === undefined ? template.name : String(updates.name).trim();
        const nextYearRaw =
          updates?.year === undefined ? template.year : String(updates.year).trim();
        const nextSemesterRaw =
          updates?.semester === undefined
            ? template.semester
            : String(updates.semester).trim();

        const nextName = nextNameRaw || template.name;
        const nextYear = nextYearRaw || template.year;
        const nextSemester = nextSemesterRaw || template.semester;

        if (
          nextName === template.name &&
          nextYear === template.year &&
          nextSemester === template.semester
        ) {
          return template;
        }

        didUpdate = true;
        return {
          ...template,
          name: nextName,
          year: nextYear,
          semester: nextSemester
        };
      })
    );

    return didUpdate;
  }, [setTemplates]);

  return useMemo(
    () => ({
      createTemplateFromHistory,
      deleteTemplate,
      updateTemplate
    }),
    [createTemplateFromHistory, deleteTemplate, updateTemplate]
  );
}
