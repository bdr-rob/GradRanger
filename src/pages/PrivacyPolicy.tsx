export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Last Updated: {new Date().toLocaleDateString()}
      </p>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
        <p>
          Grade Ranger collects information you provide when creating an account,
          including email address and profile information. We also collect data
          about your card research activities and saved searches.
        </p>

        <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
        <p>
          We use your information to provide card research services, market analysis,
          and personalized recommendations. We integrate with eBay's API to fetch
          real-time market data for sports cards.
        </p>

        <h2 className="text-2xl font-semibold">3. Third-Party Services</h2>
        <p>
          Grade Ranger uses eBay's API to provide market data. When you search for
          cards, we send queries to eBay on your behalf. Please review eBay's
          privacy policy at https://www.ebay.com/help/policies/member-behaviour-policies/user-privacy-notice-privacy-policy
        </p>

        <h2 className="text-2xl font-semibold">4. Data Security</h2>
        <p>
          We use industry-standard security measures to protect your data, including
          encryption and secure authentication via Supabase.
        </p>

        <h2 className="text-2xl font-semibold">5. Contact Us</h2>
        <p>
          For privacy concerns, contact us at: privacy@graderanger.com
        </p>
      </section>
    </div>
  );
}