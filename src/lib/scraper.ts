import * as cheerio from 'cheerio';
import { FAQ, ReviewData, ScrapedData } from '@/types';

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  // Normalize URL
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  const response = await fetch(normalizedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; GeoCheckBot/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch website: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract basic meta
  const title = $('title').text().trim() || $('h1').first().text().trim();
  const description = $('meta[name="description"]').attr('content') ||
                     $('meta[property="og:description"]').attr('content') || '';

  // Extract FAQs
  const faqs = extractFaqs($);

  // Check for reviews
  const reviews = detectReviews($);

  // Check for schema markup
  const { hasSchemaFaq, hasSchemaReview } = extractSchemaMarkup($);

  // Build business context
  const businessContext = buildBusinessContext($, title, description);

  return {
    title,
    description,
    faqs,
    reviews,
    hasSchemaFaq,
    hasSchemaReview,
    businessContext,
  };
}

function extractFaqs($: cheerio.CheerioAPI): FAQ[] {
  const faqs: FAQ[] = [];
  const seen = new Set<string>();

  // Method 1: FAQ Schema in JSON-LD
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || '');
      const items = json['@type'] === 'FAQPage' ? json.mainEntity :
                   json['@graph']?.find((g: { '@type': string }) => g['@type'] === 'FAQPage')?.mainEntity;
      if (items) {
        items.forEach((item: { name?: string; acceptedAnswer?: { text?: string } }) => {
          if (item.name && item.acceptedAnswer?.text) {
            const q = item.name.trim();
            if (!seen.has(q.toLowerCase())) {
              seen.add(q.toLowerCase());
              faqs.push({ question: q, answer: item.acceptedAnswer.text.trim() });
            }
          }
        });
      }
    } catch {}
  });

  // Method 2: Common FAQ patterns in HTML
  const faqSelectors = [
    '.faq', '.faqs', '#faq', '#faqs',
    '[class*="faq"]', '[id*="faq"]',
    '.accordion', '.collapse-content',
    'details', '.question-answer'
  ];

  faqSelectors.forEach(selector => {
    $(selector).each((_, container) => {
      // Look for Q&A patterns
      $(container).find('dt, .question, [class*="question"], h3, h4, summary').each((_, qEl) => {
        const question = $(qEl).text().trim().replace(/^Q[:.]?\s*/i, '');
        if (question && question.length > 10 && question.length < 200) {
          // Find the answer - look for next sibling or paired element
          let answer = '';
          const $qEl = $(qEl);

          // Try different answer locations
          const answerEl = $qEl.next('dd, .answer, [class*="answer"], p, div').first();
          if (answerEl.length) {
            answer = answerEl.text().trim();
          } else if ($qEl.parent().find('.answer, [class*="answer"], p').length) {
            answer = $qEl.parent().find('.answer, [class*="answer"], p').first().text().trim();
          }

          if (answer && !seen.has(question.toLowerCase())) {
            seen.add(question.toLowerCase());
            faqs.push({ question, answer: answer.slice(0, 500) });
          }
        }
      });
    });
  });

  // Method 3: Look for question-like headings anywhere
  $('h2, h3, h4').each((_, el) => {
    const text = $(el).text().trim();
    if (text.includes('?') && text.length > 15 && text.length < 150) {
      const nextP = $(el).next('p, div').first().text().trim();
      if (nextP && nextP.length > 20 && !seen.has(text.toLowerCase())) {
        seen.add(text.toLowerCase());
        faqs.push({ question: text, answer: nextP.slice(0, 500) });
      }
    }
  });

  return faqs.slice(0, 20); // Limit to 20 FAQs
}

function detectReviews($: cheerio.CheerioAPI): ReviewData {
  const details: string[] = [];

  // Check for star ratings
  const starPatterns = [
    '[class*="star"]', '[class*="rating"]',
    '.review', '.testimonial',
    '[class*="review"]', '[class*="testimonial"]',
    'svg[class*="star"]', '.stars'
  ];

  let hasStarRatings = false;
  starPatterns.forEach(pattern => {
    if ($(pattern).length > 0) {
      hasStarRatings = true;
    }
  });
  if (hasStarRatings) details.push('Star ratings detected');

  // Check for testimonial sections
  const testimonialPatterns = [
    '[class*="testimonial"]', '[id*="testimonial"]',
    '[class*="review"]', '[id*="review"]',
    '[class*="customer-say"]', '[class*="what-customers"]',
    '.quote', 'blockquote'
  ];

  let hasTestimonials = false;
  testimonialPatterns.forEach(pattern => {
    if ($(pattern).length > 0) {
      hasTestimonials = true;
    }
  });
  if (hasTestimonials) details.push('Testimonial section found');

  // Check for trust signals
  const trustPatterns = [
    '[class*="trust"]', '[class*="trusted"]',
    '[class*="client"]', '[class*="customer-logo"]',
    '[class*="partner"]', '[class*="as-seen"]',
    'img[alt*="trust"]', 'img[alt*="client"]'
  ];

  let hasTrustSignals = false;
  trustPatterns.forEach(pattern => {
    if ($(pattern).length > 0) {
      hasTrustSignals = true;
    }
  });
  if (hasTrustSignals) details.push('Trust signals/client logos found');

  // Check for third-party review widgets
  const widgetPatterns = [
    '[class*="trustpilot"]', '[id*="trustpilot"]',
    '[class*="g2-"]', '[class*="capterra"]',
    '[class*="google-review"]', 'iframe[src*="review"]'
  ];

  widgetPatterns.forEach(pattern => {
    if ($(pattern).length > 0) {
      details.push('Third-party review widget detected');
    }
  });

  // Check for review schema
  let hasSchemaMarkup = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || '');
      if (json['@type'] === 'Review' || json['@type'] === 'AggregateRating' ||
          json.aggregateRating || json.review) {
        hasSchemaMarkup = true;
        details.push('Review/Rating schema markup present');
      }
    } catch {}
  });

  const found = hasStarRatings || hasTestimonials || hasTrustSignals || hasSchemaMarkup;

  return {
    found,
    hasStarRatings,
    hasSchemaMarkup,
    hasTestimonials,
    hasTrustSignals,
    details: [...new Set(details)],
  };
}

function extractSchemaMarkup($: cheerio.CheerioAPI): { hasSchemaFaq: boolean; hasSchemaReview: boolean } {
  let hasSchemaFaq = false;
  let hasSchemaReview = false;

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || '');
      const checkType = (obj: { '@type'?: string }) => {
        if (obj['@type'] === 'FAQPage') hasSchemaFaq = true;
        if (obj['@type'] === 'Review' || obj['@type'] === 'AggregateRating') hasSchemaReview = true;
      };

      checkType(json);
      if (json['@graph']) {
        json['@graph'].forEach(checkType);
      }
    } catch {}
  });

  return { hasSchemaFaq, hasSchemaReview };
}

function buildBusinessContext($: cheerio.CheerioAPI, title: string, description: string): string {
  const parts: string[] = [];

  if (title) parts.push(`Title: ${title}`);
  if (description) parts.push(`Description: ${description}`);

  // Get hero/main heading text
  const heroText = $('h1, .hero, [class*="hero"] h1, [class*="hero"] h2').first().text().trim();
  if (heroText && heroText !== title) {
    parts.push(`Main heading: ${heroText}`);
  }

  // Get key features or benefits
  const features: string[] = [];
  $('[class*="feature"], [class*="benefit"], .value-prop').find('h3, h4, strong').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 5 && text.length < 100) {
      features.push(text);
    }
  });
  if (features.length) {
    parts.push(`Key features: ${features.slice(0, 5).join(', ')}`);
  }

  return parts.join('\n').slice(0, 1500);
}
