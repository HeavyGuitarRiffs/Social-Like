export default function PrivacyPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>

      <p className="text-gray-600">
        Your privacy matters. This page outlines how data is collected, used, and protected within the platform.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Data Collection</h2>
        <p className="text-gray-600">
          We only collect information necessary to provide core functionality, improve performance, and enhance your experience.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Data Usage</h2>
        <p className="text-gray-600">
          Collected data is used strictly for platform features such as authentication, analytics, and personalization.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Your Control</h2>
        <p className="text-gray-600">
          You can request data removal or export at any time. We believe in transparency and user control.
        </p>
      </section>

      <p className="text-gray-600">
        A full, detailed privacy policy will be added soon.
      </p>
    </div>
  );
}