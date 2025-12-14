// Fashion Resale Discovery Platform - Mock Platform Adapter
// Generates realistic mock data for development and testing

import { v4 as uuidv4 } from 'uuid';
import {
  Platform,
  Region,
  Listing,
  Seller,
  SearchQuery,
  AdapterConfig,
  ItemCondition,
  Category,
  Size,
  Price,
  Shipping,
  ListingImage,
  AiTags,
  SellerType,
  ShippingBadge,
} from '@/types';
import { BasePlatformAdapter } from './base';
import { POPULAR_BRANDS, STYLE_AESTHETICS, PLATFORM_CONFIG } from '@/lib/constants';

// ============================================
// Mock Data Generators
// ============================================

const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number): number =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const ITEM_TYPES = [
  { type: 'tops', items: ['T-Shirt', 'Blouse', 'Sweater', 'Hoodie', 'Tank Top', 'Crop Top'] },
  { type: 'bottoms', items: ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Leggings'] },
  { type: 'dresses', items: ['Mini Dress', 'Midi Dress', 'Maxi Dress', 'Cocktail Dress'] },
  { type: 'outerwear', items: ['Jacket', 'Coat', 'Blazer', 'Cardigan', 'Vest'] },
  { type: 'shoes', items: ['Sneakers', 'Boots', 'Heels', 'Flats', 'Sandals', 'Loafers'] },
  { type: 'bags', items: ['Tote', 'Crossbody', 'Shoulder Bag', 'Clutch', 'Backpack'] },
];

const COLORS = [
  'Black', 'White', 'Navy', 'Beige', 'Grey', 'Brown', 'Red', 'Blue',
  'Green', 'Pink', 'Purple', 'Orange', 'Yellow', 'Cream', 'Burgundy',
];

const PATTERNS = ['solid', 'striped', 'plaid', 'floral', 'animal print', 'checkered', 'polka dot'];

const CONDITIONS: ItemCondition[] = ['new_with_tags', 'like_new', 'good', 'fair'];

const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=400&h=500&fit=crop',
];

const SELLER_NAMES = [
  'vintagequeen', 'thriftking', 'closetcleanout', 'stylefinder', 'retrorevival',
  'fashionfwd', 'luxelabel', 'prelovedfashion', 'sustainstyle', 'wardrobewonders',
  'chicfinds', 'trendsetterco', 'designerdreams', 'capsulecloset', 'eclecticstyle',
];

const CITIES: Record<string, { city: string; state?: string; zipCode: string }[]> = {
  US: [
    { city: 'New York', state: 'NY', zipCode: '10001' },
    { city: 'Los Angeles', state: 'CA', zipCode: '90001' },
    { city: 'Chicago', state: 'IL', zipCode: '60601' },
    { city: 'Austin', state: 'TX', zipCode: '78701' },
    { city: 'Seattle', state: 'WA', zipCode: '98101' },
    { city: 'Miami', state: 'FL', zipCode: '33101' },
    { city: 'San Francisco', state: 'CA', zipCode: '94102' },
    { city: 'Portland', state: 'OR', zipCode: '97201' },
  ],
  UK: [
    { city: 'London', zipCode: 'SW1A 1AA' },
    { city: 'Manchester', zipCode: 'M1 1AD' },
    { city: 'Birmingham', zipCode: 'B1 1AA' },
    { city: 'Bristol', zipCode: 'BS1 1AA' },
    { city: 'Edinburgh', zipCode: 'EH1 1AA' },
    { city: 'Glasgow', zipCode: 'G1 1AA' },
    { city: 'Brighton', zipCode: 'BN1 1AA' },
  ],
};

// ============================================
// Mock Listing Generator
// ============================================

function generateMockListing(platform: Platform, region: Region): Listing {
  const itemCategory = randomFromArray(ITEM_TYPES);
  const itemName = randomFromArray(itemCategory.items);
  const brand = randomFromArray([
    ...POPULAR_BRANDS.luxury.slice(0, 3),
    ...POPULAR_BRANDS.contemporary,
    ...POPULAR_BRANDS.vintage,
    ...POPULAR_BRANDS.highStreet,
  ]);
  const color = randomFromArray(COLORS);
  const condition = randomFromArray(CONDITIONS);
  const basePrice = randomBetween(20, 300);
  const currency = region === 'US' ? 'USD' : 'GBP';

  const category: Category = {
    primary: itemCategory.type === 'shoes' ? 'shoes' :
             itemCategory.type === 'bags' ? 'accessories' : 'clothing',
    secondary: itemCategory.type as Category['secondary'],
    tertiary: itemName.toLowerCase().replace(' ', '-'),
  };

  const size: Size = {
    original: randomFromArray(['XS', 'S', 'M', 'L', 'XL', '26', '28', '30', '32']),
    normalized: {
      US: 'M',
      UK: '12',
      EU: '40',
    },
    sizeSystem: 'US',
  };

  const price: Price = {
    amount: basePrice,
    currency: currency === 'USD' ? 'USD' : 'GBP',
    converted: {
      USD: currency === 'USD' ? basePrice : Math.round(basePrice * 1.27),
      GBP: currency === 'GBP' ? basePrice : Math.round(basePrice * 0.79),
    },
  };

  const shipping: Shipping = {
    cost: randomFromArray([0, 5.99, 7.99, 9.99, 12.99]),
    currency: currency === 'USD' ? 'USD' : 'GBP',
    freeShipping: Math.random() > 0.6,
    shipsTo: [region],
    estimatedDays: {
      domestic: { min: 3, max: 7 },
      international: { min: 10, max: 21 },
    },
  };

  const images: ListingImage[] = Array(randomBetween(2, 5))
    .fill(null)
    .map((_, i) => ({
      url: randomFromArray(MOCK_IMAGES),
      qualityScore: randomFloat(0.6, 1),
      isPrimary: i === 0,
    }));

  const aesthetics = STYLE_AESTHETICS.slice(0, 3).map(s => s.id);
  const aiTags: AiTags = {
    style: [randomFromArray(aesthetics), randomFromArray(aesthetics)],
    pattern: randomFromArray(PATTERNS),
    materialGuess: randomFromArray(['cotton', 'denim', 'leather', 'silk', 'wool', 'polyester']),
    aesthetic: [randomFromArray(aesthetics)],
  };

  const daysAgo = randomBetween(1, 60);
  const listedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: uuidv4(),
    sourcePlatform: platform,
    sourceId: `${platform}-${randomBetween(100000, 999999)}`,
    sourceUrl: `https://${platform}.com/listing/${randomBetween(100000, 999999)}`,
    region,
    title: `${brand} ${color} ${itemName}`,
    description: `Beautiful ${condition === 'new_with_tags' ? 'brand new' : 'pre-loved'} ${brand} ${itemName.toLowerCase()} in ${color.toLowerCase()}. Perfect for any occasion. Size ${size.original}.`,
    category,
    brand,
    size,
    color: [color],
    condition,
    images,
    price,
    shipping,
    offersAccepted: Math.random() > 0.5,
    aiTags,
    sellerId: uuidv4(),
    listedAt,
    lastSynced: new Date().toISOString(),
    status: 'active',
    likesCount: randomBetween(0, 150),
    viewsCount: randomBetween(10, 500),
  };
}

// ============================================
// Mock Seller Generator
// ============================================

function generateMockSeller(platform: Platform, region: Region): Seller {
  const username = randomFromArray(SELLER_NAMES) + randomBetween(1, 99);
  const location = randomFromArray(CITIES[region]);
  const salesCount = randomBetween(50, 2000);
  const rating = randomFloat(3.5, 5);

  const shippingBadges: ShippingBadge[] = [];
  const avgShipTime = randomFloat(0.5, 5);
  if (avgShipTime <= 1) shippingBadges.push('lightning_shipper');
  if (avgShipTime <= 2 && Math.random() > 0.3) shippingBadges.push('fast_reliable');
  if (Math.random() > 0.5) shippingBadges.push('tracking_always');

  return {
    id: uuidv4(),
    displayName: username,
    type: salesCount > 500 ? 'pro_reseller' : 'individual',
    location: {
      city: location.city,
      state: location.state,
      country: region === 'US' ? 'United States' : 'United Kingdom',
      zipCode: location.zipCode,
    },
    platforms: [{
      platform,
      username: `@${username}`,
      profileUrl: `https://${platform}.com/${username}`,
      rating,
      reviewCount: randomBetween(20, salesCount),
      salesCount,
      memberSince: new Date(Date.now() - randomBetween(365, 1825) * 24 * 60 * 60 * 1000).toISOString(),
      responseTimeHours: randomBetween(1, 24),
      lastSynced: new Date().toISOString(),
    }],
    trustScore: Math.min(100, Math.round(rating * 20 + (salesCount > 500 ? 10 : 0))),
    totalReviews: randomBetween(20, salesCount),
    averageRating: rating,
    shipping: {
      avgShipTimeDays: avgShipTime,
      shipTimeConsistency: randomFloat(0.5, 2),
      onTimeDeliveryRate: randomFloat(0.85, 0.99),
      trackingProvidedRate: randomFloat(0.9, 1),
      carriersUsed: region === 'US' ? ['USPS', 'UPS', 'FedEx'] : ['Royal Mail', 'DPD', 'Hermes'],
      offersFreeShipping: Math.random() > 0.4,
      offersExpedited: Math.random() > 0.5,
      shipsInternationally: Math.random() > 0.7,
    },
    shippingBadges,
    verified: salesCount > 200,
    verificationType: salesCount > 200 ? 'email' : undefined,
  };
}

// ============================================
// Mock Platform Adapter
// ============================================

export class MockPlatformAdapter extends BasePlatformAdapter {
  private mockListings: Listing[] = [];
  private mockSellers: Map<string, Seller> = new Map();
  private adapterRegion: Region;

  constructor(platform: Platform, region: Region) {
    const config: AdapterConfig = {
      platform,
      rateLimit: { requestsPerMinute: 100, requestsPerDay: 10000 },
      retryConfig: { maxRetries: 3, backoffMs: 1000 },
    };
    super(config, [region]);
    this.adapterRegion = region;
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Generate 100 mock listings per adapter
    for (let i = 0; i < 100; i++) {
      const listing = generateMockListing(this.platform, this.adapterRegion);
      const seller = generateMockSeller(this.platform, this.adapterRegion);
      listing.sellerId = seller.id;
      this.mockListings.push(listing);
      this.mockSellers.set(seller.id, seller);
    }
  }

  async fetchListings(query: SearchQuery): Promise<Listing[]> {
    await this.sleep(randomBetween(200, 500)); // Simulate network delay

    let results = [...this.mockListings];

    // Apply text search filter
    if (query.text) {
      const searchText = query.text.toLowerCase();
      results = results.filter(listing =>
        listing.title.toLowerCase().includes(searchText) ||
        listing.brand?.toLowerCase().includes(searchText) ||
        listing.description.toLowerCase().includes(searchText)
      );
    }

    // Apply filters
    if (query.filters.brand) {
      results = results.filter(l => l.brand?.toLowerCase() === query.filters.brand?.toLowerCase());
    }
    if (query.filters.minPrice !== undefined) {
      results = results.filter(l => l.price.amount >= query.filters.minPrice!);
    }
    if (query.filters.maxPrice !== undefined) {
      results = results.filter(l => l.price.amount <= query.filters.maxPrice!);
    }
    if (query.filters.condition && query.filters.condition.length > 0) {
      results = results.filter(l => query.filters.condition!.includes(l.condition));
    }
    if (query.filters.color && query.filters.color.length > 0) {
      results = results.filter(l =>
        l.color.some(c => query.filters.color!.includes(c.toLowerCase()))
      );
    }

    // Apply sorting
    switch (query.sortBy) {
      case 'price_low':
        results.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'price_high':
        results.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime());
        break;
      default:
        // relevance - keep original order for mock
        break;
    }

    // Apply pagination
    const start = (query.page - 1) * query.limit;
    const end = start + query.limit;
    return results.slice(start, end);
  }

  async fetchListing(id: string): Promise<Listing | null> {
    await this.sleep(randomBetween(100, 300));
    return this.mockListings.find(l => l.id === id) || null;
  }

  async fetchSeller(id: string): Promise<Seller | null> {
    await this.sleep(randomBetween(100, 300));
    return this.mockSellers.get(id) || null;
  }

  async syncListings(since?: Date): Promise<Listing[]> {
    // In a real implementation, this would fetch only new/updated listings
    const listings = since
      ? this.mockListings.filter(l => new Date(l.lastSynced) > since)
      : this.mockListings;
    return listings;
  }

  protected transformListing(rawData: unknown): Listing {
    // In a real implementation, this would transform platform-specific data
    return rawData as Listing;
  }

  protected transformSeller(rawData: unknown): Seller {
    return rawData as Seller;
  }
}

// ============================================
// Initialize Mock Adapters for All Platforms
// ============================================

export function createMockAdapters(): MockPlatformAdapter[] {
  const adapters: MockPlatformAdapter[] = [];

  // US Platforms
  adapters.push(new MockPlatformAdapter('depop', 'US'));
  adapters.push(new MockPlatformAdapter('poshmark', 'US'));
  adapters.push(new MockPlatformAdapter('ebay_us', 'US'));
  adapters.push(new MockPlatformAdapter('thredUp', 'US'));

  // UK Platforms
  adapters.push(new MockPlatformAdapter('depop', 'UK'));
  adapters.push(new MockPlatformAdapter('vinted', 'UK'));
  adapters.push(new MockPlatformAdapter('ebay_uk', 'UK'));
  adapters.push(new MockPlatformAdapter('vestiaire', 'UK'));

  return adapters;
}
