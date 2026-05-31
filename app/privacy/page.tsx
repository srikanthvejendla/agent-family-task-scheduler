export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Collection</h2>
          <p>
            Family Task Scheduler is a self-hosted application. All data is stored on your
            own server and never shared with third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Children&apos;s Privacy (COPPA)</h2>
          <p>
            This application is designed for family use with parent-managed accounts. Parents
            are responsible for managing their children&apos;s accounts and the information
            collected is limited to display names and task completion data within the household.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies</h2>
          <p>
            We use essential cookies to maintain your session and preferences (such as theme
            selection). These are necessary for the application to function.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Export</h2>
          <p>
            Household owners can export all household data at any time through the application.
          </p>
        </section>
      </div>
    </div>
  );
}
