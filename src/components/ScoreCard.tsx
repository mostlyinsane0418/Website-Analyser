'use client';

import { AnalysisResult } from '@/types';

interface ScoreCardProps {
  result: AnalysisResult;
}

export function ScoreCard({ result }: ScoreCardProps) {
  const { percentage, grade, breakdown } = result;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-success';
      case 'B': return 'text-green-400';
      case 'C': return 'text-warning';
      case 'D': return 'text-orange-500';
      case 'F': return 'text-error';
      default: return 'text-muted';
    }
  };

  const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 70) return 'bg-success';
    if (pct >= 50) return 'bg-warning';
    return 'bg-error';
  };

  const categories = [
    {
      name: 'Follow-up Questions',
      score: breakdown.followUpCoverage.score,
      max: breakdown.followUpCoverage.maxScore,
      description: 'Coverage of common follow-up questions',
    },
    {
      name: 'Customer Reviews',
      score: breakdown.reviewsVisibility.score,
      max: breakdown.reviewsVisibility.maxScore,
      description: 'Visibility of customer testimonials',
    },
    {
      name: 'Structured Data',
      score: breakdown.structuredData.score,
      max: breakdown.structuredData.maxScore,
      description: 'Schema.org markup for FAQs & reviews',
    },
    {
      name: 'Content Clarity',
      score: breakdown.contentClarity.score,
      max: breakdown.contentClarity.maxScore,
      description: 'How LLM-friendly your answers are',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">GEO Score</h2>
          <p className="text-sm text-muted truncate max-w-xs">{result.url}</p>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${getGradeColor(grade)}`}>{grade}</span>
            <span className="text-2xl font-semibold text-foreground">{percentage}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-foreground">{cat.name}</span>
              <span className="text-sm text-muted">{cat.score}/{cat.max}</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getScoreColor(cat.score, cat.max)}`}
                style={{ width: `${(cat.score / cat.max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted mt-1">{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
