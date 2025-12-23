import { QuestionnaireForm } from "@/components/QuestionnaireForm";
import { Footer } from "@/components/footer";
import { CheckCircle2 } from "lucide-react";

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
          
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>500+ Businesses Helped</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Australian Veteran Owned</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Free Custom Report</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Takes 3-5 Minutes</span>
            </div>
          </div>
          
          {/* Value Proposition */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">What You'll Get:</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>✓ Custom analysis of your digital challenges</li>
              <li>✓ Sector-specific solutions for Central Queensland</li>
              <li>✓ ROI projections and investment ranges</li>
              <li>✓ Clear next steps to move forward</li>
            </ul>
          </div>
        </div>
        <QuestionnaireForm />
      </main>
      <Footer />
    </div>
  );
}
