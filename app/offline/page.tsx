"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold">You&apos;re Offline</h1>
        <p className="text-muted-foreground">
          It looks like you&apos;re not connected to the internet. Some features
          may be unavailable until you reconnect.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
