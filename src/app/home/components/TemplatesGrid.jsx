import TemplateCard from "./TemplateCard";

function TemplatesGrid({
  templates,
  onStart,
  onDelete,
  onEdit,
  onExport,
  className = "",
}) {
  return (
    <div className={className}>
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onStart={onStart}
          onDelete={onDelete}
          onEdit={onEdit}
          onExport={onExport}
        />
      ))}
    </div>
  );
}

export default TemplatesGrid;
