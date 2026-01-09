'use client';

export function LoadingState() {
  const steps = [
    'Fetching website content...',
    'Extracting FAQs and reviews...',
    'Generating follow-up questions...',
    'Analyzing coverage...',
    'Calculating GEO score...',
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-border rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-accent rounded-full animate-spin"></div>
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-2">Analyzing website</h2>
        <p className="text-sm text-muted mb-6">This typically takes 10-20 seconds</p>

        <div className="w-full max-w-xs space-y-2">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 text-left animate-pulse-subtle"
              style={{ animationDelay: `${idx * 0.2}s` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
              <span className="text-sm text-muted">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
