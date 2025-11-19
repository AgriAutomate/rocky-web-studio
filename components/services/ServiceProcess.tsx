interface ProcessStep {
  title: string;
  description: string;
}

interface ServiceProcessProps {
  steps: ProcessStep[];
  title?: string;
  description?: string;
}

export function ServiceProcess({
  steps,
  title = "How it works",
  description = "Practical, transparent collaboration from kickoff to launch.",
}: ServiceProcessProps) {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
          Process
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-base text-slate-600 md:text-lg">{description}</p>
      </div>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5"
          >
            <span className="text-2xl font-semibold text-teal-600">
              {(index + 1).toString().padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

