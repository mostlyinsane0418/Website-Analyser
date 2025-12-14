// Fashion Resale Discovery Platform - Data Service
// Unified interface for fetching data from all platform adapters

import {
  Listing,
  Seller,
  SearchQuery,
  SearchResults,
  SearchFacets,
  PriceComparison,
  ComparisonItem,
  DiscoveryFeed,
  FeedBlock,
  Region,
  Platform,
  VisualSearchResult,
  IdentifiedItem,
} from '@/types';
import { createMockAdapters, MockPlatformAdapter } from './adapters/mock';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// Data Service Class
// ============================================

class DataService {
  private adapters: MockPlatformAdapter[];
  private listingsCache: Map<string, Listing> = new Map();
  private sellersCache: Map<string, Seller> = new Map();

  constructor() {
    this.adapters = createMockAdapters();
  }

  // ============================================
  // Search & Browse
  // ============================================

  async search(query: SearchQuery): Promise<SearchResults> {
    // Get adapters for the requested region, or all if not specified
    const regionAdapters = query.filters.region
      ? this.adapters.filter(a => a.supportsRegion(query.filters.region!))
      : this.adapters;

    // Filter by platform if specified
    const platformAdapters = query.filters.platform
      ? regionAdapters.filter(a => query.filters.platform!.includes(a['platform']))
      : regionAdapters;

    // Fetch from all selected adapters in parallel
    const results = await Promise.allSettled(
      platformAdapters.map(adapter => adapter.fetchListings(query))
    );

    // Combine successful results
    let allListings = results
      .filter((r): r is PromiseFulfilledResult<Listing[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Cache listings
    allListings.forEach(listing => this.listingsCache.set(listing.id, listing));

    // Apply cross-platform deduplication (by title + brand + price similarity)
    allListings = this.deduplicateListings(allListings);

    // Calculate facets
    const facets = this.calculateFacets(allListings);

    // Apply final sorting across all platforms
    allListings = this.sortListings(allListings, query.sortBy);

    // Pagination
    const totalCount = allListings.length;
    const totalPages = Math.ceil(totalCount / query.limit);
    const start = (query.page - 1) * query.limit;
    const paginatedListings = allListings.slice(start, start + query.limit);

    return {
      items: paginatedListings,
      totalCount,
      page: query.page,
      totalPages,
      facets,
    };
  }

  private deduplicateListings(listings: Listing[]): Listing[] {
    // Simple deduplication by title similarity
    const seen = new Set<string>();
    return listings.filter(listing => {
      const key = `${listing.brand}-${listing.title.toLowerCase().slice(0, 30)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private sortListings(
    listings: Listing[],
    sortBy: SearchQuery['sortBy']
  ): Listing[] {
    const sorted = [...listings];
    switch (sortBy) {
      case 'price_low':
        sorted.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'price_high':
        sorted.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case 'newest':
        sorted.sort((a, b) =>
          new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime()
        );
        break;
      case 'rating':
        // Would need seller data for this
        break;
      default:
        // relevance - keep original order
        break;
    }
    return sorted;
  }

  private calculateFacets(listings: Listing[]): SearchFacets {
    const brands: Record<string, number> = {};
    const categories: Record<string, number> = {};
    const sizes: Record<string, number> = {};
    const colors: Record<string, number> = {};
    const platforms: Record<Platform, number> = {} as Record<Platform, number>;

    listings.forEach(listing => {
      // Brands
      if (listing.brand) {
        brands[listing.brand] = (brands[listing.brand] || 0) + 1;
      }
      // Categories
      categories[listing.category.secondary] =
        (categories[listing.category.secondary] || 0) + 1;
      // Sizes
      sizes[listing.size.original] = (sizes[listing.size.original] || 0) + 1;
      // Colors
      listing.color.forEach(c => {
        colors[c] = (colors[c] || 0) + 1;
      });
      // Platforms
      platforms[listing.sourcePlatform] =
        (platforms[listing.sourcePlatform] || 0) + 1;
    });

    // Convert to array format and sort by count
    const toSortedArray = (obj: Record<string, number>) =>
      Object.entries(obj)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    // Calculate price ranges
    const prices = listings.map(l => l.price.amount);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRanges = [
      { min: 0, max: 25, count: listings.filter(l => l.price.amount <= 25).length },
      { min: 25, max: 50, count: listings.filter(l => l.price.amount > 25 && l.price.amount <= 50).length },
      { min: 50, max: 100, count: listings.filter(l => l.price.amount > 50 && l.price.amount <= 100).length },
      { min: 100, max: 200, count: listings.filter(l => l.price.amount > 100 && l.price.amount <= 200).length },
      { min: 200, max: maxPrice, count: listings.filter(l => l.price.amount > 200).length },
    ].filter(r => r.count > 0);

    return {
      brands: toSortedArray(brands),
      categories: toSortedArray(categories),
      sizes: toSortedArray(sizes),
      colors: toSortedArray(colors),
      platforms: Object.entries(platforms).map(([name, count]) => ({
        name: name as Platform,
        count,
      })),
      priceRanges,
    };
  }

  // ============================================
  // Get Single Listing
  // ============================================

  async getListing(id: string): Promise<Listing | null> {
    // Check cache first
    if (this.listingsCache.has(id)) {
      return this.listingsCache.get(id)!;
    }

    // Try each adapter
    for (const adapter of this.adapters) {
      const listing = await adapter.fetchListing(id);
      if (listing) {
        this.listingsCache.set(id, listing);
        return listing;
      }
    }

    return null;
  }

  async getListings(ids: string[]): Promise<Listing[]> {
    const results = await Promise.all(ids.map(id => this.getListing(id)));
    return results.filter((l): l is Listing => l !== null);
  }

  // ============================================
  // Get Seller
  // ============================================

  async getSeller(id: string): Promise<Seller | null> {
    // Check cache first
    if (this.sellersCache.has(id)) {
      return this.sellersCache.get(id)!;
    }

    // Try each adapter
    for (const adapter of this.adapters) {
      const seller = await adapter.fetchSeller(id);
      if (seller) {
        this.sellersCache.set(id, seller);
        return seller;
      }
    }

    return null;
  }

  // ============================================
  // Price Comparison
  // ============================================

  async getPriceComparison(listingId: string): Promise<PriceComparison | null> {
    const listing = await this.getListing(listingId);
    if (!listing) return null;

    // Find similar listings across all platforms
    const query: SearchQuery = {
      text: `${listing.brand} ${listing.category.secondary}`,
      filters: {
        category: listing.category,
        size: listing.size.original,
      },
      sortBy: 'price_low',
      page: 1,
      limit: 20,
    };

    const results = await this.search(query);

    // Get seller data for each listing
    const comparisonItems: ComparisonItem[] = await Promise.all(
      results.items.map(async (l) => {
        const seller = await this.getSeller(l.sellerId);
        const totalPrice = l.price.amount + (l.shipping.freeShipping ? 0 : l.shipping.cost);

        const badges: ComparisonItem['badges'] = [];

        return {
          listing: l,
          seller: seller!,
          totalPrice,
          estimatedDelivery: {
            min: new Date(Date.now() + l.shipping.estimatedDays.domestic.min * 24 * 60 * 60 * 1000),
            max: new Date(Date.now() + l.shipping.estimatedDays.domestic.max * 24 * 60 * 60 * 1000),
          },
          badges,
        };
      })
    );

    // Assign badges
    if (comparisonItems.length > 0) {
      // Lowest price
      const lowestPriceItem = comparisonItems.reduce((min, item) =>
        item.totalPrice < min.totalPrice ? item : min
      );
      lowestPriceItem.badges.push('lowest_price');

      // Top rated
      const topRatedItem = comparisonItems.reduce((max, item) =>
        (item.seller?.averageRating || 0) > (max.seller?.averageRating || 0) ? item : max
      );
      if (topRatedItem.seller?.averageRating >= 4.5) {
        topRatedItem.badges.push('top_rated');
      }

      // Fastest delivery
      const fastestItem = comparisonItems.reduce((min, item) =>
        item.estimatedDelivery.min < min.estimatedDelivery.min ? item : min
      );
      fastestItem.badges.push('fastest_delivery');

      // Best value (balance of price, rating, shipping)
      const scoredItems = comparisonItems.map(item => ({
        item,
        score: (100 - item.totalPrice / 3) + ((item.seller?.averageRating || 3) * 10),
      }));
      const bestValueItem = scoredItems.reduce((max, s) =>
        s.score > max.score ? s : max
      ).item;
      if (!bestValueItem.badges.includes('lowest_price')) {
        bestValueItem.badges.push('best_value');
      }
    }

    const prices = comparisonItems.map(i => i.totalPrice);

    return {
      itemTitle: listing.title,
      itemDescription: listing.description,
      referenceImage: listing.images[0]?.url || '',
      listings: comparisonItems,
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
    };
  }

  // ============================================
  // Discovery Feed
  // ============================================

  async getDiscoveryFeed(region: Region, userId?: string): Promise<DiscoveryFeed> {
    const blocks: FeedBlock[] = [];

    // 1. Trending Now
    const trendingQuery: SearchQuery = {
      filters: { region },
      sortBy: 'newest',
      page: 1,
      limit: 8,
    };
    const trendingResults = await this.search(trendingQuery);
    blocks.push({
      id: uuidv4(),
      type: 'trending',
      title: 'Trending Now',
      subtitle: 'Based on what Gen Z is searching this week',
      items: trendingResults.items,
    });

    // 2. Under $50 Finds
    const budgetQuery: SearchQuery = {
      filters: { region, maxPrice: 50 },
      sortBy: 'newest',
      page: 1,
      limit: 8,
    };
    const budgetResults = await this.search(budgetQuery);
    blocks.push({
      id: uuidv4(),
      type: 'price_based',
      title: 'Under $50 Finds',
      subtitle: 'Curated deals in your style',
      items: budgetResults.items,
      metadata: { priceMax: 50 },
    });

    // 3. Just Dropped
    const newQuery: SearchQuery = {
      filters: { region },
      sortBy: 'newest',
      page: 1,
      limit: 8,
    };
    const newResults = await this.search(newQuery);
    blocks.push({
      id: uuidv4(),
      type: 'just_dropped',
      title: 'Just Dropped',
      subtitle: 'New listings in the last 24 hours',
      items: newResults.items,
    });

    // 4. Selling Fast (high engagement)
    const popularQuery: SearchQuery = {
      filters: { region },
      sortBy: 'relevance',
      page: 1,
      limit: 8,
    };
    const popularResults = await this.search(popularQuery);
    // Sort by likes for mock purposes
    const sellingFast = [...popularResults.items]
      .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      .slice(0, 8);
    blocks.push({
      id: uuidv4(),
      type: 'selling_fast',
      title: 'Selling Fast',
      subtitle: 'Items with lots of saves this week',
      items: sellingFast,
    });

    // 5. Theme Collection - Y2K
    const y2kQuery: SearchQuery = {
      text: 'vintage 90s',
      filters: { region },
      sortBy: 'newest',
      page: 1,
      limit: 8,
    };
    const y2kResults = await this.search(y2kQuery);
    blocks.push({
      id: uuidv4(),
      type: 'theme_collection',
      title: 'Y2K Revival',
      subtitle: 'Low-rise · Butterfly clips · Baby tees',
      items: y2kResults.items,
      metadata: { theme: 'y2k' },
    });

    // 6. Theme Collection - Quiet Luxury
    const quietLuxuryQuery: SearchQuery = {
      text: 'minimal neutral',
      filters: { region },
      sortBy: 'price_high',
      page: 1,
      limit: 8,
    };
    const quietLuxuryResults = await this.search(quietLuxuryQuery);
    blocks.push({
      id: uuidv4(),
      type: 'theme_collection',
      title: 'Quiet Luxury',
      subtitle: 'The Row dupes · Cashmere · Neutral tones',
      items: quietLuxuryResults.items,
      metadata: { theme: 'quiet-luxury' },
    });

    return {
      blocks,
      lastUpdated: new Date().toISOString(),
    };
  }

  // ============================================
  // Visual Search (Mock)
  // ============================================

  async visualSearch(imageUrl: string): Promise<VisualSearchResult> {
    // In production, this would call a vision AI API
    // For now, return mock identified items

    const mockIdentifiedItems: IdentifiedItem[] = [
      {
        id: uuidv4(),
        type: 'jacket',
        confidence: 0.92,
        boundingBox: { x: 100, y: 50, width: 200, height: 300 },
        attributes: {
          color: ['black'],
          pattern: 'solid',
          style: ['vintage', 'leather'],
        },
      },
      {
        id: uuidv4(),
        type: 'jeans',
        confidence: 0.88,
        boundingBox: { x: 120, y: 350, width: 180, height: 250 },
        attributes: {
          color: ['blue'],
          pattern: 'solid',
          style: ['vintage', 'straight-leg'],
          brand: "Levi's",
        },
      },
    ];

    // Search for each identified item
    const matchingListings = new Map<string, Listing[]>();

    for (const item of mockIdentifiedItems) {
      const query: SearchQuery = {
        text: `${item.attributes.brand || ''} ${item.type} ${item.attributes.color?.join(' ') || ''}`.trim(),
        filters: {},
        sortBy: 'relevance',
        page: 1,
        limit: 10,
      };

      const results = await this.search(query);
      matchingListings.set(item.id, results.items);
    }

    return {
      originalImage: imageUrl,
      identifiedItems: mockIdentifiedItems,
      matchingListings,
    };
  }

  // ============================================
  // Trending & Popular
  // ============================================

  async getTrendingSearches(region: Region): Promise<{ query: string; count: number }[]> {
    // In production, this would be based on actual search analytics
    return [
      { query: 'Miu Miu ballet flats', count: 12500 },
      { query: "Vintage Levi's 501", count: 10200 },
      { query: 'Baggy jeans', count: 9800 },
      { query: 'Y2K butterfly top', count: 8400 },
      { query: 'The Row bag', count: 7200 },
      { query: 'Vintage band tee', count: 6900 },
      { query: 'Platform sneakers', count: 6500 },
      { query: 'Oversized blazer', count: 6100 },
    ];
  }

  async getPopularBrands(region: Region): Promise<{ brand: string; count: number }[]> {
    // In production, this would be based on actual listing data
    return [
      { brand: "Levi's", count: 45000 },
      { brand: 'Nike', count: 38000 },
      { brand: 'Zara', count: 32000 },
      { brand: 'Reformation', count: 18000 },
      { brand: 'Acne Studios', count: 12000 },
      { brand: 'The Row', count: 8000 },
    ];
  }
}

// Export singleton instance
export const dataService = new DataService();
