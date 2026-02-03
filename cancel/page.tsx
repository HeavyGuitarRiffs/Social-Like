export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Checkout Canceled</h1>
        <p className="text-white/70">No worries — you can try again anytime.</p>
        <a href="/pricing" className="btn btn-primary mt-6">
          Back to Pricing
        </a>
      </div>
    </div>
  );
}