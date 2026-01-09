import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite } from '@/lib/scraper';
import { generateFollowUpQuestions, analyzeFollowUpCoverage, generateSuggestions } from '@/lib/gemini';
import { calculateScore } from '@/lib/analyzer';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Step 1: Scrape the website
    const scrapedData = await scrapeWebsite(normalizedUrl);

    // Step 2: Generate follow-up questions based on business context
    const followUpQuestions = await generateFollowUpQuestions(scrapedData.businessContext);

    // Step 3: Analyze coverage of follow-up questions
    const analyzedQuestions = await analyzeFollowUpCoverage(followUpQuestions, scrapedData.faqs);

    // Step 4: Generate suggestions
    const suggestions = await generateSuggestions(
      analyzedQuestions,
      scrapedData.businessContext,
      scrapedData.reviews.found,
      scrapedData.hasSchemaFaq,
      scrapedData.hasSchemaReview
    );

    // Step 5: Calculate final score
    const result = calculateScore(scrapedData, analyzedQuestions, suggestions);
    result.url = normalizedUrl;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);

    const message = error instanceof Error ? error.message : 'An unexpected error occurred';

    if (message.includes('fetch') || message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Failed to fetch website. Please check the URL and try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
