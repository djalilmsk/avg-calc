import TemplateCard from "./TemplateCard";

function TemplatesGrid({
  templates,
  onStart,
  onDelete,
  onEdit,
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
        />
      ))}
    </div>
  );
}

export default TemplatesGrid;
