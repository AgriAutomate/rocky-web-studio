"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Download, Mail, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Force dynamic rendering - this page requires search params
export const dynamic = 'force-dynamic';

interface QuestionnaireResponse {
  id: string;
  business_name: string;
  first_name: string;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  email_sent_at: string | null;
  created_at: string;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const responseId = searchParams.get("id");
  
  const [response, setResponse] = useState<QuestionnaireResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfStatus, setPdfStatus] = useState<'generating' | 'ready' | 'failed'>('generating');

  useEffect(() => {
    if (!responseId) {
      setError("No response ID provided");
      setLoading(false);
      return;
    }

    async function fetchResponse() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error: fetchError } = await (supabase as any)
          .from("questionnaire_responses")
          .select("id, business_name, first_name, pdf_url, pdf_generated_at, email_sent_at, created_at")
          .eq("id", String(responseId))
          .single();

        if (fetchError) {
          console.error("Error fetching response:", fetchError);
          setError("Could not find your submission. Please contact support.");
          setLoading(false);
          return;
        }

        if (data) {
          const responseData = data as any;
          setResponse({
            id: responseData.id,
            business_name: responseData.business_name || "",
            first_name: responseData.first_name || "",
            pdf_url: responseData.pdf_url || null,
            pdf_generated_at: responseData.pdf_generated_at || null,
            email_sent_at: responseData.email_sent_at || null,
            created_at: responseData.created_at || new Date().toISOString(),
          });
          
          // Determine PDF status
          if (responseData.pdf_url && responseData.pdf_generated_at) {
            setPdfStatus('ready');
          } else if (responseData.email_sent_at) {
            // Email sent but no PDF URL - might be generating
            setPdfStatus('generating');
          } else {
            setPdfStatus('generating');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching response:", err);
        setError("An error occurred. Please try again later.");
        setLoading(false);
      }
    }

    fetchResponse();

    // Poll for PDF status every 5 seconds if still generating
    const pollInterval = setInterval(async () => {
      if (pdfStatus === 'generating' && responseId) {
        try {
          const supabase = getSupabaseBrowserClient();
          const { data } = await (supabase as any)
            .from("questionnaire_responses")
            .select("pdf_url, pdf_generated_at")
            .eq("id", responseId)
            .single();

          const pollData = data as any;
          if (pollData?.pdf_url && pollData?.pdf_generated_at) {
            setPdfStatus('ready');
            setResponse(prev => prev ? { ...prev, pdf_url: pollData.pdf_url, pdf_generated_at: pollData.pdf_generated_at } : null);
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error("Error polling PDF status:", err);
        }
      } else {
        clearInterval(pollInterval);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [responseId, pdfStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading your confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100">
        <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 md:gap-12 md:py-16 lg:px-12">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-4">Error</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/questionnaire">
              <Button>Return to Questionnaire</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const businessName = response?.business_name || "there";
  const firstName = response?.first_name || "";

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 md:gap-12 md:py-16 lg:px-12">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-semibold text-foreground mb-4">
            Your Questionnaire Has Been Received!
          </h1>
          
          <p className="text-lg text-muted-foreground mb-2">
            Thank you{firstName ? `, ${firstName}` : ""}!
          </p>
          
          <p className="text-muted-foreground mb-6">
            We've received your submission for <strong>{businessName}</strong> and are preparing your custom deep-dive report.
          </p>

          {responseId && (
            <div className="bg-slate-50 rounded-md p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                <strong>Response ID:</strong> {responseId}
              </p>
            </div>
          )}
        </div>

        {/* PDF Status */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Your Custom Report
          </h2>
          
          {pdfStatus === 'generating' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p>Your PDF report is being generated...</p>
              </div>
              <p className="text-sm text-muted-foreground">
                We'll email you the complete report shortly. This usually takes 1-2 minutes.
              </p>
            </div>
          )}

          {pdfStatus === 'ready' && response?.pdf_url && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-medium">Your PDF report is ready!</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Download your custom deep-dive report below, or check your email for the full report.
              </p>
              <a
                href={response.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Report
                </Button>
              </a>
            </div>
          )}

          {pdfStatus === 'failed' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                There was an issue generating your PDF. Don't worry - we've received your submission and will contact you directly.
              </p>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">What's Next?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Check Your Email</p>
                <p className="text-sm text-muted-foreground">
                  We'll send you the complete PDF report via email within the next few minutes. 
                  Please check your spam folder if you don't see it.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Schedule a Discovery Call</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Let's discuss how Rocky Web Studio can help {businessName} implement these solutions.
                </p>
                <a
                  href="https://calendly.com/martin-rws/15min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button className="bg-primary text-white hover:bg-primary/90">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Free Strategy Session - Discuss Your Report
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚡ Limited spots this week • No obligation • Get answers to your questions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Questions? We're here to help.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="mailto:martin@rockywebstudio.com.au" className="text-primary hover:underline">
              martin@rockywebstudio.com.au
            </a>
            <span className="text-muted-foreground">|</span>
            <a href="https://rockywebstudio.com.au" className="text-primary hover:underline">
              rockywebstudio.com.au
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
