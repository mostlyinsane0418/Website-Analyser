import { GoogleGenerativeAI } from '@google/generative-ai';
import { FAQ, FollowUpQuestion, Suggestion } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateFollowUpQuestions(businessContext: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are simulating what follow-up questions a user would ask an AI assistant (like Google's AI Overview or ChatGPT) after learning about this business/website.

Business Context:
${businessContext}

Generate exactly 8 realistic follow-up questions that potential customers would ask. Focus on:
- Pricing and plans
- How to get started / signup process
- Customer reviews and testimonials
- Comparison with alternatives
- Features and capabilities
- Support and contact
- Free trial availability
- Integration or compatibility

Return ONLY the questions, one per line, no numbering or bullets.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return text
    .split('\n')
    .map(q => q.trim())
    .filter(q => q.length > 10 && q.includes('?'))
    .slice(0, 8);
}

export async function analyzeFollowUpCoverage(
  questions: string[],
  faqs: FAQ[]
): Promise<FollowUpQuestion[]> {
  if (faqs.length === 0) {
    return questions.map(q => ({
      question: q,
      covered: 'no' as const,
      suggestedAnswer: undefined,
    }));
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const faqText = faqs.map((f, i) => `FAQ ${i + 1}: Q: ${f.question}\nA: ${f.answer}`).join('\n\n');

  const prompt = `Analyze if these follow-up questions are covered by the existing FAQs.

EXISTING FAQs:
${faqText}

FOLLOW-UP QUESTIONS TO CHECK:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

For each question, respond with EXACTLY this format (one per line):
QUESTION_NUMBER|COVERAGE|MATCHED_FAQ_NUMBER_OR_NONE

Where COVERAGE is: YES (fully answered), PARTIAL (somewhat addressed), or NO (not covered)
And MATCHED_FAQ_NUMBER is the FAQ number that covers it, or NONE if not covered.

Example response:
1|YES|2
2|PARTIAL|1
3|NO|NONE`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const lines = text.split('\n').filter(l => l.includes('|'));

  return questions.map((question, idx) => {
    const line = lines.find(l => l.startsWith(`${idx + 1}|`));
    if (!line) {
      return { question, covered: 'no' as const };
    }

    const [, coverage, matchedFaq] = line.split('|');
    const coveredStatus = coverage?.toUpperCase().includes('YES') ? 'yes' :
                         coverage?.toUpperCase().includes('PARTIAL') ? 'partial' : 'no';

    const matchedFaqNum = parseInt(matchedFaq || '');
    const matchedFaqText = !isNaN(matchedFaqNum) && faqs[matchedFaqNum - 1]
      ? faqs[matchedFaqNum - 1].question
      : undefined;

    return {
      question,
      covered: coveredStatus,
      matchedFaq: matchedFaqText,
    };
  });
}

export async function generateSuggestions(
  followUpQuestions: FollowUpQuestion[],
  businessContext: string,
  hasReviews: boolean,
  hasSchemaFaq: boolean,
  hasSchemaReview: boolean
): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];

  // Missing FAQ suggestions
  const missingQuestions = followUpQuestions.filter(q => q.covered === 'no');

  if (missingQuestions.length > 0) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate concise FAQ answers for a website with this context:
${businessContext}

Questions needing answers:
${missingQuestions.slice(0, 4).map((q, i) => `${i + 1}. ${q.question}`).join('\n')}

For each question, provide a clear, helpful answer (2-3 sentences max).
Format:
Q1: [answer]
Q2: [answer]
etc.`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      missingQuestions.slice(0, 4).forEach((q, idx) => {
        const match = text.match(new RegExp(`Q${idx + 1}:?\\s*([^Q]+?)(?=Q\\d|$)`, 'is'));
        const answer = match?.[1]?.trim() || 'Consider adding a clear, concise answer to this common question.';

        suggestions.push({
          type: 'add_faq',
          priority: idx < 2 ? 'high' : 'medium',
          title: `Add FAQ: "${q.question}"`,
          description: 'This is a common follow-up question from potential customers that your current FAQ doesn\'t address.',
          implementation: answer,
        });
      });
    } catch {
      // Fallback without AI-generated answers
      missingQuestions.slice(0, 4).forEach((q, idx) => {
        suggestions.push({
          type: 'add_faq',
          priority: idx < 2 ? 'high' : 'medium',
          title: `Add FAQ: "${q.question}"`,
          description: 'This is a common follow-up question from potential customers.',
        });
      });
    }
  }

  // Review suggestions
  if (!hasReviews) {
    suggestions.push({
      type: 'improve_reviews',
      priority: 'high',
      title: 'Add customer reviews to your landing page',
      description: 'Customer reviews are critical for GEO. LLMs prioritize websites with visible social proof when recommending solutions.',
      implementation: 'Add a testimonials section with real customer quotes, star ratings, and ideally photos or company logos.',
    });
  }

  // Schema suggestions
  if (!hasSchemaFaq) {
    suggestions.push({
      type: 'add_schema',
      priority: 'medium',
      title: 'Add FAQ Schema markup',
      description: 'FAQ Schema helps LLMs understand and extract your FAQ content more accurately.',
      implementation: 'Add JSON-LD FAQPage schema to your page. This can be done via your CMS or manually in the HTML head.',
    });
  }

  if (!hasSchemaReview && hasReviews) {
    suggestions.push({
      type: 'add_schema',
      priority: 'medium',
      title: 'Add Review Schema markup',
      description: 'Your reviews are not marked up with Schema.org, making them less discoverable by AI systems.',
      implementation: 'Add AggregateRating and Review schema to your testimonials section.',
    });
  }

  return suggestions;
}
