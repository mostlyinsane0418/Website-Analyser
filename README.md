# GEO Check - Generative Engine Optimization Analyzer

A B2B SaaS tool to analyze your website's compatibility with AI-powered search engines. Check if your FAQs match the follow-up questions LLMs ask about your business.

## Features

- **Follow-up Question Analysis** - Generates common follow-up questions LLMs would ask about your business and checks if your FAQs cover them
- **Customer Reviews Check** - Verifies if customer reviews/testimonials are visible on your landing page
- **Schema.org Audit** - Validates FAQ and Review structured data markup
- **Content Clarity Score** - Analyzes if your FAQ answers are LLM-friendly
- **Actionable Suggestions** - Provides specific recommendations with implementation guidance

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **LLM**: Google Gemini 1.5 Flash (free tier)
- **Scraping**: Cheerio
- **Deployment**: Vercel

## Getting Started

### Prerequisites

1. Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey)

### Local Development

```bash
# Clone the repository
git clone <repo-url>
cd Website-Analyser

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add `GEMINI_API_KEY` in Vercel Environment Variables
4. Deploy

## GEO Scoring Algorithm

| Factor | Weight | Description |
|--------|--------|-------------|
| Follow-up Question Coverage | 40% | % of LLM follow-up questions answered by FAQs |
| Customer Reviews Visibility | 25% | Reviews, star ratings, testimonials visible |
| Structured Data | 15% | Schema.org FAQ + Review markup |
| Content Clarity | 20% | LLM-friendly answer format |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

## License

MIT
