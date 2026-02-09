export default function TemplateChooser({ templates, onChoose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-[#383838] bg-[#1d1e23] p-5">
        <h2 className="text-xl font-semibold text-zinc-100">Choose a template</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Select one to start your semester calculator.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onChoose(template.id)}
              className="rounded-xl border border-[#3a3a3a] bg-[#24252b] p-4 text-left hover:bg-[#2b2c33]"
            >
              <div className="font-semibold text-zinc-100">{template.title}</div>
              <div className="mt-1 text-xs text-zinc-400">{template.subtitle}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
