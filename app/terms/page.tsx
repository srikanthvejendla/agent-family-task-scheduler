export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptance of Terms</h2>
          <p>
            By using Family Task Scheduler, you agree to these terms of service. This is a
            self-hosted application and you are responsible for its operation and maintenance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">User Responsibilities</h2>
          <p>
            Parents/guardians are responsible for managing household members, ensuring appropriate
            use of the application, and maintaining the security of their accounts.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptable Use</h2>
          <p>
            This application is intended for family task management. Users agree not to misuse
            the service or attempt to access data belonging to other households.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
          <p>
            This software is provided as-is without warranties. The developers are not liable
            for any data loss or damages arising from use of this application.
          </p>
        </section>
      </div>
    </div>
  );
}
