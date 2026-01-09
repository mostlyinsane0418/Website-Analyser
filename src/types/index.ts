export interface AnalysisRequest {
  url: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ReviewData {
  found: boolean;
  hasStarRatings: boolean;
  hasSchemaMarkup: boolean;
  hasTestimonials: boolean;
  hasTrustSignals: boolean;
  details: string[];
}

export interface FollowUpQuestion {
  question: string;
  covered: 'yes' | 'partial' | 'no';
  matchedFaq?: string;
  suggestedAnswer?: string;
}

export interface ScoreBreakdown {
  followUpCoverage: {
    score: number;
    maxScore: number;
    details: FollowUpQuestion[];
  };
  reviewsVisibility: {
    score: number;
    maxScore: number;
    details: ReviewData;
  };
  structuredData: {
    score: number;
    maxScore: number;
    hasFaqSchema: boolean;
    hasReviewSchema: boolean;
  };
  contentClarity: {
    score: number;
    maxScore: number;
    avgAnswerLength: number;
    hasDirectAnswers: boolean;
  };
}

export interface AnalysisResult {
  url: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: ScoreBreakdown;
  existingFaqs: FAQ[];
  suggestions: Suggestion[];
  analyzedAt: string;
}

export interface Suggestion {
  type: 'add_faq' | 'improve_reviews' | 'add_schema' | 'improve_clarity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation?: string;
}

export interface ScrapedData {
  title: string;
  description: string;
  faqs: FAQ[];
  reviews: ReviewData;
  hasSchemaFaq: boolean;
  hasSchemaReview: boolean;
  businessContext: string;
}
