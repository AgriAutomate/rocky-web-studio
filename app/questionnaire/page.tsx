import { QuestionnaireForm } from "@/components/QuestionnaireForm";
import { Footer } from "@/components/footer";

export default function QuestionnairePage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:gap-12 md:py-16 lg:px-12">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Discovery Questionnaire
          </h1>
          <p className="text-muted-foreground">
            Help us understand your business needs so we can create a tailored proposal for you.
          </p>
        </div>
        <QuestionnaireForm />
      </main>
      <Footer />
    </div>
  );
}
