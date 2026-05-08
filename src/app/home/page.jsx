import { useEffect, useMemo, useRef, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar-context";
import { useLocation, useNavigate, useOutletContext } from "react-router";
import TemplateDetailsDialog from "@/components/ui/template-details-dialog";
import TemplateExportDialog from "@/components/ui/template-export-dialog";
import DesktopTemplatesView from "./components/DesktopTemplatesView";
import MobileTemplatesView from "./components/MobileTemplatesView";
import TemplatesOverflowDialog from "./components/TemplatesOverflowDialog";
import SeoHead from "@/components/seo/SeoHead";
import {
  decodeTemplateSharePayload,
  TEMPLATE_SHARE_PARAM,
} from "@/app/calculator/template-share";
import { X } from "lucide-react";

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
  const [exportingTemplate, setExportingTemplate] = useState(null);
  const [importError, setImportError] = useState("");
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const importedSearchRef = useRef("");
  const { isMobile } = useSidebar();
  const location = useLocation();
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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const rawTemplatePayload = searchParams.get(TEMPLATE_SHARE_PARAM);
    if (!rawTemplatePayload) {
      importedSearchRef.current = "";
      return;
    }
    if (importedSearchRef.current === rawTemplatePayload) return;
    importedSearchRef.current = rawTemplatePayload;

    const importedPayload = decodeTemplateSharePayload(rawTemplatePayload);
    if (!importedPayload) {
      queueMicrotask(() => {
        setImportError(
          "Template import failed. The link is invalid or unsupported.",
        );
        navigate("/", { replace: true });
      });
      return;
    }

    const historyItem =
      actions.createHistoryFromImportedTemplate?.(importedPayload);
    if (!historyItem) {
      queueMicrotask(() => {
        setImportError(
          "Template import failed. The link is invalid or unsupported.",
        );
        navigate("/", { replace: true });
      });
      return;
    }

    queueMicrotask(() => {
      setImportError("");
      navigate(`/calc/${historyItem.id}`, { replace: true });
    });
  }, [actions, location.search, navigate]);

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

  function handleExportTemplate(template) {
    if (!template) return;
    setIsTemplatesDialogOpen(false);
    setExportingTemplate(template);
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
      <SeoHead
        title="CookedCalc | Semester Average Calculator for Students"
        description="A semester-grade workspace that lets you manage multiple scenarios, save and reuse templates, and keep everything stored locally."
        keywords="semester calculator, grade history, templates, weighted average, cookedcalc home"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "CookedCalc",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Any",
            url: "https://cookedcalc.djalilmsk.dev/",
            description:
              "A semester-grade workspace that lets you manage multiple scenarios, save and reuse templates, and keep everything stored locally.",
            image: "https://cookedcalc.djalilmsk.dev/preview.jpg",
            author: {
              "@type": "Person",
              name: "Abd eldjallil Meskali (djalilmsk)",
              url: "https://djalilmsk.dev",
            },
            publisher: {
              "@type": "Person",
              name: "Abd eldjallil Meskali (djalilmsk)",
              url: "https://djalilmsk.dev",
            },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            audience: {
              "@type": "Audience",
              audienceType: "Students and universities",
            },
          },
        ]}
      />

      {importError ? (
        <div className="fixed top-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-destructive/40 bg-card px-3 py-2 text-sm text-foreground shadow-lg">
          <p className="flex-1">{importError}</p>
          <button
            type="button"
            onClick={() => setImportError("")}
            className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Dismiss import error"
            title="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {!isMobile ? (
        <DesktopTemplatesView
          templates={desktopTemplates}
          hasOverflow={hasDesktopOverflow}
          onShowMore={() => setIsTemplatesDialogOpen(true)}
          onStart={handleStartFromTemplate}
          onDelete={handleDeleteTemplate}
          onEdit={handleOpenTemplateEdit}
          onExport={handleExportTemplate}
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
          onExport={handleExportTemplate}
        />
      )}

      <TemplatesOverflowDialog
        open={isTemplatesDialogOpen}
        templates={templates}
        onClose={() => setIsTemplatesDialogOpen(false)}
        onStart={handleStartFromTemplate}
        onDelete={handleDeleteTemplate}
        onEdit={handleOpenTemplateEdit}
        onExport={handleExportTemplate}
      />

      <TemplateExportDialog
        payload={exportingTemplate}
        onClose={() => setExportingTemplate(null)}
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
