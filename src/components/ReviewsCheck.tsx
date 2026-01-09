'use client';

import { ReviewData } from '@/types';

interface ReviewsCheckProps {
  reviews: ReviewData;
  hasSchemaReview: boolean;
}

export function ReviewsCheck({ reviews, hasSchemaReview }: ReviewsCheckProps) {
  const checks = [
    {
      label: 'Reviews/Testimonials visible',
      passed: reviews.found,
      description: 'Customer reviews are visible on the landing page',
    },
    {
      label: 'Star ratings displayed',
      passed: reviews.hasStarRatings,
      description: 'Numeric or star ratings shown',
    },
    {
      label: 'Review Schema markup',
      passed: hasSchemaReview,
      description: 'Schema.org Review/AggregateRating markup present',
    },
    {
      label: 'Trust signals present',
      passed: reviews.hasTrustSignals,
      description: 'Client logos, "trusted by" sections, etc.',
    },
  ];

  const passedCount = checks.filter(c => c.passed).length;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Customer Reviews Check</h2>
        <span className="text-sm text-muted">{passedCount}/{checks.length} passed</span>
      </div>

      <p className="text-sm text-muted mb-4">
        LLMs prioritize websites with visible social proof when making recommendations.
      </p>

      <div className="space-y-3">
        {checks.map((check, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border"
          >
            {check.passed ? (
              <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-foreground font-medium">{check.label}</p>
              <p className="text-xs text-muted mt-0.5">{check.description}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
              check.passed ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            }`}>
              {check.passed ? 'Found' : 'Missing'}
            </span>
          </div>
        ))}
      </div>

      {reviews.details.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted mb-2">Detection details:</p>
          <div className="flex flex-wrap gap-2">
            {reviews.details.map((detail, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">
                {detail}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
