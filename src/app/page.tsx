'use client';

import { useState } from 'react';
import { UrlInput, ScoreCard, FollowUpQuestions, ReviewsCheck, Suggestions, LoadingState } from '@/components';
import { AnalysisResult } from '@/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-foreground">GEO Check</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-card/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Is your website <span className="text-accent">AI-ready</span>?
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
            Analyze your website&apos;s compatibility with AI-powered search engines.
            Check if your FAQs answer the questions LLMs ask about your business.
          </p>

          <div className="max-w-xl mx-auto">
            <UrlInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm max-w-xl mx-auto">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && <LoadingState />}

        {result && !isLoading && (
          <div className="space-y-6">
            {/* Score Overview */}
            <ScoreCard result={result} />

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FollowUpQuestions questions={result.breakdown.followUpCoverage.details} />
              <ReviewsCheck
                reviews={result.breakdown.reviewsVisibility.details}
                hasSchemaReview={result.breakdown.structuredData.hasReviewSchema}
              />
            </div>

            {/* Suggestions */}
            <Suggestions suggestions={result.suggestions} />

            {/* Existing FAQs */}
            {result.existingFaqs.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Detected FAQs ({result.existingFaqs.length})
                </h2>
                <div className="space-y-3">
                  {result.existingFaqs.slice(0, 5).map((faq, idx) => (
                    <div key={idx} className="p-3 bg-background border border-border rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">{faq.question}</p>
                      <p className="text-xs text-muted line-clamp-2">{faq.answer}</p>
                    </div>
                  ))}
                  {result.existingFaqs.length > 5 && (
                    <p className="text-sm text-muted text-center py-2">
                      +{result.existingFaqs.length - 5} more FAQs detected
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !result && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Enter a URL to get started</h2>
            <p className="text-muted max-w-md mx-auto">
              We&apos;ll analyze your website&apos;s FAQ coverage, review visibility, and structured data
              to give you a GEO compatibility score.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { icon: '?', title: 'FAQ Analysis', desc: 'Check if your FAQs match LLM follow-up questions' },
                { icon: '*', title: 'Review Check', desc: 'Verify customer reviews are visible' },
                { icon: '#', title: 'Schema Audit', desc: 'Validate structured data markup' },
              ].map((feature, idx) => (
                <div key={idx} className="p-4 bg-card border border-border rounded-xl text-left">
                  <span className="text-2xl font-mono text-accent">{feature.icon}</span>
                  <h3 className="text-sm font-medium text-foreground mt-2">{feature.title}</h3>
                  <p className="text-xs text-muted mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-muted text-center">
            GEO Check - Optimize your website for AI-powered search engines
          </p>
        </div>
      </footer>
    </div>
  );
}
