# ThriftFinder - Fashion Resale Discovery Platform

A "Kayak for fashion resale" platform that helps users discover and compare secondhand clothing across multiple platforms like Depop, Poshmark, eBay, Vinted, and more.

## Features

### Core Features

- **For You Discovery Feed** - Personalized, scroll-friendly home feed with trending items, theme collections, and curated picks
- **Visual Search ("Shazam for Clothes")** - Upload a photo to find similar items across all platforms
- **Unified Search & Browse** - Search across aggregated listings with advanced filters
- **Price Comparison** - Compare prices across multiple sellers for the same/similar items
- **Trust & Reviews Aggregation** - Aggregated seller ratings, shipping performance, and trust scores
- **Saved Items & Collections** - Save items, create collections, and set price alerts
- **External Redirect & Handoff** - Smooth redirect to external platforms for purchase

### Target Markets

- **US**: Depop, Poshmark, eBay, ThredUp
- **UK**: Vinted, Depop, eBay UK, Vestiaire Collective

### Gen Z Focused

- TikTok-level personalization
- Instagram-quality visuals
- Minimal friction, 1-tap everything
- FOMO-driven features (trending, selling fast)
- Aesthetic consistency across the app

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: Native fetch with API routes

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── search/        # Search API
│   │   ├── listings/      # Listing details API
│   │   ├── compare/       # Price comparison API
│   │   ├── feed/          # Discovery feed API
│   │   ├── visual-search/ # Visual search API
│   │   ├── trending/      # Trending data API
│   │   └── sellers/       # Seller info API
│   ├── listing/           # Listing detail page
│   ├── search/            # Search results page
│   ├── visual-search/     # Visual search page
│   ├── saved/             # Saved items page
│   └── profile/           # User profile page
├── components/
│   ├── ui/                # Base UI components
│   ├── feed/              # Discovery feed components
│   ├── search/            # Search & visual search components
│   ├── listing/           # Listing detail components
│   ├── seller/            # Seller info components
│   ├── saved/             # Saved items components
│   └── layout/            # Navigation & layout
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & constants
├── services/              # Data services
│   └── adapters/          # Platform adapters
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build

```bash
npm run build
npm start
```

## Data Model

### Core Types

- **Listing**: Unified listing data from all platforms
- **Seller**: Aggregated seller information with trust scores
- **User**: User preferences, saved items, and collections
- **FeedBlock**: Discovery feed content blocks

### Platform Adapters

The platform adapter system normalizes data from different resale platforms:

- `BasePlatformAdapter`: Abstract base class for all adapters
- `MockPlatformAdapter`: Mock data for development
- Future: Real adapters for Depop, Poshmark, eBay, etc.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search` | GET/POST | Search listings |
| `/api/listings/[id]` | GET | Get listing details |
| `/api/compare/[id]` | GET | Price comparison |
| `/api/feed` | GET | Discovery feed |
| `/api/visual-search` | POST | Visual search |
| `/api/trending` | GET | Trending searches/brands |
| `/api/sellers/[id]` | GET | Seller information |

## Future Roadmap

### Phase 1 (MVP)
- [x] Visual search with AI item detection
- [x] Text search with filters
- [x] Aggregated listings from platforms
- [x] Price comparison view
- [x] Basic user accounts (save items)
- [x] Mobile-responsive web app

### Phase 2
- [ ] Real platform API integrations
- [ ] Native review system
- [ ] Push notifications
- [ ] Price history tracking

### Phase 3
- [ ] Native mobile apps (iOS, Android)
- [ ] Seller accounts & direct listings
- [ ] Social features
- [ ] AI style recommendations
- [ ] Browser extension

## License

MIT
