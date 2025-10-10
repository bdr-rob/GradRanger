export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Last Updated: {new Date().toLocaleDateString()}
      </p>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
        <p>
          By accessing Grade Ranger, you agree to these Terms of Service.
        </p>

        <h2 className="text-2xl font-semibold">2. Service Description</h2>
        <p>
          Grade Ranger provides sports card research, market analysis, and
          AI-powered grading estimates. Our service is for informational
          purposes only and does not guarantee investment returns.
        </p>

        <h2 className="text-2xl font-semibold">3. User Responsibilities</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account
          and for all activities under your account.
        </p>

        <h2 className="text-2xl font-semibold">4. Disclaimer</h2>
        <p>
          Grade Ranger's AI grading predictions are estimates only. Actual grades
          from professional grading companies may vary. We are not responsible
          for investment decisions made based on our analysis.
        </p>
      </section>
    </div>
  );
}