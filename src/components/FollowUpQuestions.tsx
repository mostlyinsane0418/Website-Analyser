'use client';

import { FollowUpQuestion } from '@/types';

interface FollowUpQuestionsProps {
  questions: FollowUpQuestion[];
}

export function FollowUpQuestions({ questions }: FollowUpQuestionsProps) {
  const getStatusIcon = (covered: 'yes' | 'partial' | 'no') => {
    switch (covered) {
      case 'yes':
        return (
          <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'partial':
        return (
          <div className="w-5 h-5 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
            </svg>
          </div>
        );
      case 'no':
        return (
          <div className="w-5 h-5 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  const getStatusLabel = (covered: 'yes' | 'partial' | 'no') => {
    switch (covered) {
      case 'yes': return 'Covered';
      case 'partial': return 'Partial';
      case 'no': return 'Missing';
    }
  };

  const coveredCount = questions.filter(q => q.covered === 'yes').length;
  const partialCount = questions.filter(q => q.covered === 'partial').length;
  const missingCount = questions.filter(q => q.covered === 'no').length;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Follow-up Question Coverage</h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            <span className="text-muted">{coveredCount} covered</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning"></span>
            <span className="text-muted">{partialCount} partial</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-error"></span>
            <span className="text-muted">{missingCount} missing</span>
          </span>
        </div>
      </div>

      <p className="text-sm text-muted mb-4">
        These are common follow-up questions LLMs generate for users searching for your type of business.
      </p>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border"
          >
            {getStatusIcon(q.covered)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{q.question}</p>
              {q.matchedFaq && (
                <p className="text-xs text-muted mt-1 truncate">
                  Matched: {q.matchedFaq}
                </p>
              )}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
              q.covered === 'yes' ? 'bg-success/10 text-success' :
              q.covered === 'partial' ? 'bg-warning/10 text-warning' :
              'bg-error/10 text-error'
            }`}>
              {getStatusLabel(q.covered)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
