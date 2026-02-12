import { useEffect, useMemo, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { useNavigate, useOutletContext } from "react-router";
import TemplateDetailsDialog from "@/components/ui/template-details-dialog";
import DesktopTemplatesView from "./components/DesktopTemplatesView";
import MobileTemplatesView from "./components/MobileTemplatesView";
import TemplatesOverflowDialog from "./components/TemplatesOverflowDialog";

const MOBILE_TEMPLATE_LIMIT = 4;

function createEditDraft(template) {
  return {
    id: template.id,
    name: template.name,
    year: template.year,
    semester: template.semester,
  };
}

function Home() {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [editingTemplateDraft, setEditingTemplateDraft] = useState(null);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { templates = [], actions } = useOutletContext();
  const desktopTemplateLimit = isLargeScreen ? 4 : 3;

  const desktopTemplates = useMemo(
    () => templates.slice(0, desktopTemplateLimit),
    [desktopTemplateLimit, templates],
  );
  const mobileTemplates = useMemo(() => {
    if (isMobileExpanded) return templates;
    return templates.slice(0, MOBILE_TEMPLATE_LIMIT);
  }, [isMobileExpanded, templates]);
  const hasDesktopOverflow = templates.length > desktopTemplateLimit;
  const hasMobileOverflow =
    !isMobileExpanded && templates.length > MOBILE_TEMPLATE_LIMIT;

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleStartFromTemplate(templateId) {
    setIsTemplatesDialogOpen(false);
    const historyItem = actions.createHistoryFromTemplate(templateId);
    if (!historyItem) return;
    navigate(`/calc/${historyItem.id}`);
  }

  function handleDeleteTemplate(templateId) {
    actions.deleteTemplate(templateId);
  }

  function handleOpenTemplateEdit(template) {
    if (!template) return;
    setIsTemplatesDialogOpen(false);
    setEditingTemplateDraft(createEditDraft(template));
  }

  function handleEditDraftChange(key, value) {
    setEditingTemplateDraft((currentDraft) => {
      if (!currentDraft) return currentDraft;
      return {
        ...currentDraft,
        [key]: value,
      };
    });
  }

  function handleSubmitTemplateEdit() {
    if (!editingTemplateDraft) return;

    actions.updateTemplate?.(editingTemplateDraft.id, {
      name: editingTemplateDraft.name,
      year: editingTemplateDraft.year,
      semester: editingTemplateDraft.semester,
    });
    setEditingTemplateDraft(null);
  }

  return (
    <>
      {!isMobile ? (
        <DesktopTemplatesView
          templates={desktopTemplates}
          hasOverflow={hasDesktopOverflow}
          onShowMore={() => setIsTemplatesDialogOpen(true)}
          onStart={handleStartFromTemplate}
          onDelete={handleDeleteTemplate}
          onEdit={handleOpenTemplateEdit}
        />
      ) : (
        <MobileTemplatesView
          templates={mobileTemplates}
          expanded={isMobileExpanded}
          hasOverflow={hasMobileOverflow}
          onShowMore={() => setIsMobileExpanded(true)}
          onStart={handleStartFromTemplate}
          onDelete={handleDeleteTemplate}
          onEdit={handleOpenTemplateEdit}
        />
      )}

      <TemplatesOverflowDialog
        open={isTemplatesDialogOpen}
        templates={templates}
        onClose={() => setIsTemplatesDialogOpen(false)}
        onStart={handleStartFromTemplate}
        onDelete={handleDeleteTemplate}
        onEdit={handleOpenTemplateEdit}
      />

      {editingTemplateDraft ? (
        <TemplateDetailsDialog
          title="Edit Template"
          description="Update template details."
          submitLabel="Save Changes"
          draft={editingTemplateDraft}
          onChange={handleEditDraftChange}
          onCancel={() => setEditingTemplateDraft(null)}
          onSubmit={handleSubmitTemplateEdit}
        />
      ) : null}
    </>
  );
}

export default Home;
