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
    <section className="space-y-6 rounded-3xl border border-border bg-card p-8 shadow-sm md:p-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Process
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">{description}</p>
      </div>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-2xl border border-border bg-muted/60 p-5"
          >
            <span className="text-2xl font-semibold text-primary">
              {(index + 1).toString().padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

