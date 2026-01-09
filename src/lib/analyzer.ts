import { AnalysisResult, ScrapedData, FollowUpQuestion, Suggestion, ScoreBreakdown } from '@/types';

const WEIGHTS = {
  followUpCoverage: 40,
  reviewsVisibility: 25,
  structuredData: 15,
  contentClarity: 20,
};

export function calculateScore(
  scrapedData: ScrapedData,
  followUpQuestions: FollowUpQuestion[],
  suggestions: Suggestion[]
): AnalysisResult {
  const breakdown: ScoreBreakdown = {
    followUpCoverage: calculateFollowUpScore(followUpQuestions),
    reviewsVisibility: calculateReviewScore(scrapedData),
    structuredData: calculateSchemaScore(scrapedData),
    contentClarity: calculateClarityScore(scrapedData),
  };

  const totalScore =
    breakdown.followUpCoverage.score +
    breakdown.reviewsVisibility.score +
    breakdown.structuredData.score +
    breakdown.contentClarity.score;

  const maxScore = 100;
  const percentage = Math.round((totalScore / maxScore) * 100);
  const grade = getGrade(percentage);

  return {
    url: '',
    totalScore,
    maxScore,
    percentage,
    grade,
    breakdown,
    existingFaqs: scrapedData.faqs,
    suggestions,
    analyzedAt: new Date().toISOString(),
  };
}

function calculateFollowUpScore(questions: FollowUpQuestion[]): {
  score: number;
  maxScore: number;
  details: FollowUpQuestion[];
} {
  const maxScore = WEIGHTS.followUpCoverage;

  if (questions.length === 0) {
    return { score: 0, maxScore, details: [] };
  }

  const covered = questions.filter(q => q.covered === 'yes').length;
  const partial = questions.filter(q => q.covered === 'partial').length;

  // Full coverage = 5 points, partial = 2.5 points
  const rawScore = (covered * 5) + (partial * 2.5);
  const maxPossible = questions.length * 5;
  const score = Math.round((rawScore / maxPossible) * maxScore);

  return {
    score: Math.min(score, maxScore),
    maxScore,
    details: questions,
  };
}

function calculateReviewScore(data: ScrapedData): {
  score: number;
  maxScore: number;
  details: typeof data.reviews;
} {
  const maxScore = WEIGHTS.reviewsVisibility;
  let score = 0;

  if (data.reviews.found) score += 8;
  if (data.reviews.hasStarRatings) score += 6;
  if (data.reviews.hasSchemaMarkup) score += 5;
  if (data.reviews.hasTestimonials) score += 3;
  if (data.reviews.hasTrustSignals) score += 3;

  return {
    score: Math.min(score, maxScore),
    maxScore,
    details: data.reviews,
  };
}

function calculateSchemaScore(data: ScrapedData): {
  score: number;
  maxScore: number;
  hasFaqSchema: boolean;
  hasReviewSchema: boolean;
} {
  const maxScore = WEIGHTS.structuredData;
  let score = 0;

  if (data.hasSchemaFaq) score += 8;
  if (data.hasSchemaReview) score += 7;

  return {
    score: Math.min(score, maxScore),
    maxScore,
    hasFaqSchema: data.hasSchemaFaq,
    hasReviewSchema: data.hasSchemaReview,
  };
}

function calculateClarityScore(data: ScrapedData): {
  score: number;
  maxScore: number;
  avgAnswerLength: number;
  hasDirectAnswers: boolean;
} {
  const maxScore = WEIGHTS.contentClarity;
  let score = 0;

  const faqs = data.faqs;

  if (faqs.length === 0) {
    return {
      score: 0,
      maxScore,
      avgAnswerLength: 0,
      hasDirectAnswers: false,
    };
  }

  // Calculate average answer length
  const avgLength = faqs.reduce((sum, f) => sum + f.answer.length, 0) / faqs.length;

  // Optimal length is 100-300 characters (concise but informative)
  const lengthScore = avgLength < 50 ? 5 :
                      avgLength < 100 ? 8 :
                      avgLength <= 300 ? 10 :
                      avgLength <= 500 ? 7 : 4;

  score += lengthScore;

  // Check for direct answer patterns (starts with "Yes", "No", concrete info)
  const directPatterns = /^(Yes|No|We|Our|The|You can|It is|There are|\d)/i;
  const directAnswers = faqs.filter(f => directPatterns.test(f.answer.trim())).length;
  const directRatio = directAnswers / faqs.length;

  score += directRatio >= 0.7 ? 10 : directRatio >= 0.4 ? 6 : 3;

  return {
    score: Math.min(score, maxScore),
    maxScore,
    avgAnswerLength: Math.round(avgLength),
    hasDirectAnswers: directRatio >= 0.5,
  };
}

function getGrade(percentage: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (percentage >= 85) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 55) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}
