import { ArrowRight } from "lucide-react";

function TemplateCard({ template, onStart, onDelete }) {
  function handleOpenTemplate() {
    onStart?.(template.id);
  }

  function handleContextMenu(event) {
    event.preventDefault();
    if (!onDelete) return;

    const shouldDelete = window.confirm(`Delete template "${template.name}"?`);
    if (!shouldDelete) return;
    onDelete(template.id);
  }

  return (
    <button
      type="button"
      onClick={handleOpenTemplate}
      onContextMenu={handleContextMenu}
      className="flex flex-col justify-between rounded-2xl bg-[#2a2b2f]/60 lg:p-5 p-4 hover:bg-[rgb(58,59,63)] w-full min-h-36 border border-[#4a4b4f] text-white transition-colors duration-200 relative group cursor-pointer"
    >
      <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 group-hover:-rotate-45 transition-all  duration-200 flex flex-col gap-3" />
      <div className="flex flex-wrap gap-2 text-sm text-gray-400 pr-8">
        <span>{template.year}</span>
        <span className="text-gray-600">•</span>
        <span>{template.semester}</span>
      </div>
      <h1 className="text-xl font-semibold leading-snug line-clamp-2 text-left">
        {template.name}
      </h1>
    </button>
  );
}

export default TemplateCard;
