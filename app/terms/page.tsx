export default function TermsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Terms of Service</h1>

      <p className="text-gray-600">
        These Terms of Service outline the rules and conditions for using this platform. By accessing or using the service, you agree to follow these terms.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Acceptable Use</h2>
        <p className="text-gray-600">
          You agree not to misuse the platform, attempt unauthorized access, or engage in activities that disrupt performance or security.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Service Availability</h2>
        <p className="text-gray-600">
          While we strive for uninterrupted service, downtime may occur due to maintenance, updates, or unforeseen issues.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Limitation of Liability</h2>
        <p className="text-gray-600">
          The platform is provided “as is.” We are not responsible for losses resulting from outages, data issues, or misuse of the service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Changes to Terms</h2>
        <p className="text-gray-600">
          These terms may be updated periodically. Continued use of the platform indicates acceptance of any changes.
        </p>
      </section>

      <p className="text-gray-600">
        A full legal version of the Terms of Service will be added soon.
      </p>
    </div>
  );
}