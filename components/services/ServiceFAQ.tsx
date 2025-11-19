interface FAQItem {
  question: string;
  answer: string;
}

interface ServiceFAQProps {
  faqs: FAQItem[];
  title?: string;
  description?: string;
}

export function ServiceFAQ({
  faqs,
  title = "Common questions",
  description = "Direct answers so you know what to expect working together.",
}: ServiceFAQProps) {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
          FAQ
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-base text-slate-600 md:text-lg">{description}</p>
      </div>
      <div className="space-y-4 divide-y divide-slate-100">
        {faqs.map((faq) => (
          <div key={faq.question} className="pt-4 first:pt-0">
            <p className="text-lg font-semibold text-slate-900">
              {faq.question}
            </p>
            <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

