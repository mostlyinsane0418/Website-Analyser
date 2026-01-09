// Fashion Resale Discovery Platform - Core Types

// ============================================
// Enums and Constants
// ============================================

export type Platform =
  | 'depop'
  | 'poshmark'
  | 'ebay_us'
  | 'ebay_uk'
  | 'vinted'
  | 'thredUp'
  | 'vestiaire';

export type Region = 'US' | 'UK';
export type Currency = 'USD' | 'GBP' | 'EUR';

export type ItemCondition =
  | 'new_with_tags'
  | 'like_new'
  | 'good'
  | 'fair';

export type ListingStatus =
  | 'active'
  | 'sold'
  | 'removed'
  | 'on_hold';

export type SellerType = 'individual' | 'pro_reseller';

export type SizeSystem = 'US' | 'UK' | 'EU';

export type ShippingBadge =
  | 'lightning_shipper'    // Ships within 24 hrs
  | 'fast_reliable'        // Ships within 48 hrs + 95%+ on-time
  | 'tracking_always'      // 100% tracking rate
  | 'accurate_estimates';  // 90%+ deliveries match estimate

// ============================================
// Category Taxonomy
// ============================================

export type PrimaryCategory =
  | 'clothing'
  | 'shoes'
  | 'accessories';

export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'activewear';

export type ShoesCategory =
  | 'sneakers'
  | 'boots'
  | 'heels'
  | 'flats'
  | 'sandals'
  | 'loafers';

export type AccessoriesCategory =
  | 'bags'
  | 'jewelry'
  | 'watches'
  | 'belts'
  | 'hats'
  | 'scarves'
  | 'sunglasses';

export interface Category {
  primary: PrimaryCategory;
  secondary: ClothingCategory | ShoesCategory | AccessoriesCategory;
  tertiary?: string;
}

// ============================================
// Size Types
// ============================================

export interface SizeNormalized {
  US: string;
  UK: string;
  EU: string;
}

export interface Size {
  original: string;
  normalized: SizeNormalized;
  sizeSystem: SizeSystem;
}

// ============================================
// Pricing Types
// ============================================

export interface PriceConverted {
  USD: number;
  GBP: number;
}

export interface Price {
  amount: number;
  currency: Currency;
  converted: PriceConverted;
}

export interface Shipping {
  cost: number;
  currency: Currency;
  freeShipping: boolean;
  shipsTo: Region[];
  estimatedDays: {
    domestic: { min: number; max: number };
    international: { min: number; max: number };
  };
}

// ============================================
// Image Types
// ============================================

export interface ListingImage {
  url: string;
  qualityScore: number; // AI-generated 0-1
  isPrimary: boolean;
  enhancedUrl?: string; // AI-enhanced version
}

// ============================================
// AI Enrichment Types
// ============================================

export interface AiTags {
  style: string[];
  pattern: string;
  materialGuess?: string;
  aesthetic: string[];
}

// ============================================
// Listing Type
// ============================================

export interface Listing {
  id: string;
  sourcePlatform: Platform;
  sourceId: string;
  sourceUrl: string;
  region: Region;

  // Item Details
  title: string;
  description: string;
  category: Category;
  brand?: string;
  size: Size;
  color: string[];
  condition: ItemCondition;
  images: ListingImage[];

  // Pricing
  price: Price;
  shipping: Shipping;
  offersAccepted: boolean;

  // AI-Generated Enrichments
  aiTags: AiTags;
  visualEmbedding?: number[]; // Vector for similarity search

  // Seller Info (reference)
  sellerId: string;

  // Metadata
  listedAt: string; // ISO timestamp
  lastSynced: string; // ISO timestamp
  status: ListingStatus;

  // Engagement (if available)
  likesCount?: number;
  viewsCount?: number;
}

// ============================================
// Seller Types
// ============================================

export interface PlatformConnection {
  platform: Platform;
  username: string;
  profileUrl: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  memberSince: string; // ISO date
  responseTimeHours: number;
  lastSynced: string; // ISO timestamp
}

export interface SellerShipping {
  avgShipTimeDays: number;
  shipTimeConsistency: number; // Standard deviation
  onTimeDeliveryRate: number; // 0-1 percentage
  trackingProvidedRate: number; // 0-1 percentage
  carriersUsed: string[];
  offersFreeShipping: boolean;
  offersExpedited: boolean;
  shipsInternationally: boolean;
}

export interface SellerLocation {
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
}

export interface Seller {
  id: string;
  displayName: string;
  type: SellerType;
  location: SellerLocation;

  // Platform Connections
  platforms: PlatformConnection[];

  // Aggregated Trust Score
  trustScore: number; // 0-100
  totalReviews: number;
  averageRating: number; // 0-5

  // Shipping Performance
  shipping: SellerShipping;

  // Shipping Badges (calculated)
  shippingBadges: ShippingBadge[];

  // Verification
  verified: boolean;
  verificationType?: 'email' | 'phone' | 'id';
}

// ============================================
// User Types
// ============================================

export interface UserSizes {
  tops?: string;
  bottoms?: string;
  shoes?: string;
}

export interface Collection {
  id: string;
  name: string;
  items: string[]; // listing IDs
  createdAt: string;
  updatedAt: string;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: string;
  filters?: SearchFilters;
}

export interface LookbookItem {
  id: string;
  imageUrl: string;
  identifiedItems: IdentifiedItem[];
  timestamp: string;
}

export interface PriceAlert {
  listingId: string;
  targetPrice: number;
  currency: Currency;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  priceDrops: boolean;
  newArrivals: boolean;
}

export interface User {
  id: string;
  email: string;

  // Profile
  displayName?: string;
  avatarUrl?: string;

  // Preferences
  sizes: UserSizes;
  favoriteBrands: string[];
  stylePreferences: string[];
  region: Region;
  currency: Currency;

  // Activity
  savedItems: string[]; // listing IDs
  collections: Collection[];
  searchHistory: SearchHistoryItem[];
  lookbook: LookbookItem[];

  // Notifications
  priceAlerts: PriceAlert[];
  notificationPreferences: NotificationPreferences;
}

// ============================================
// Search & Filter Types
// ============================================

export interface SearchFilters {
  category?: Category;
  brand?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ItemCondition[];
  color?: string[];
  platform?: Platform[];
  sellerType?: SellerType[];
  minSellerRating?: number;
  freeShipping?: boolean;
  region?: Region;
}

export interface SearchQuery {
  text?: string;
  imageUrl?: string;
  filters: SearchFilters;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'newest' | 'rating';
  page: number;
  limit: number;
}

export interface SearchResults {
  items: Listing[];
  totalCount: number;
  page: number;
  totalPages: number;
  facets: SearchFacets;
}

export interface SearchFacets {
  brands: { name: string; count: number }[];
  categories: { name: string; count: number }[];
  sizes: { name: string; count: number }[];
  colors: { name: string; count: number }[];
  platforms: { name: Platform; count: number }[];
  priceRanges: { min: number; max: number; count: number }[];
}

// ============================================
// Visual Search Types
// ============================================

export interface IdentifiedItem {
  id: string;
  type: string; // e.g., "jacket", "jeans", "sneakers"
  confidence: number; // 0-1
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  attributes: {
    color?: string[];
    pattern?: string;
    style?: string[];
    brand?: string;
  };
}

export interface VisualSearchResult {
  originalImage: string;
  identifiedItems: IdentifiedItem[];
  matchingListings: Map<string, Listing[]>; // itemId -> listings
}

// ============================================
// Feed Types
// ============================================

export type FeedBlockType =
  | 'trending'
  | 'complete_the_look'
  | 'price_based'
  | 'theme_collection'
  | 'just_dropped'
  | 'because_you_saved'
  | 'style_quiz_results'
  | 'selling_fast'
  | 'recently_viewed'
  | 'local_finds';

export interface FeedBlock {
  id: string;
  type: FeedBlockType;
  title: string;
  subtitle?: string;
  items: Listing[];
  metadata?: {
    theme?: string;
    relatedItemId?: string;
    priceMax?: number;
    savesCount?: number;
  };
}

export interface DiscoveryFeed {
  blocks: FeedBlock[];
  lastUpdated: string;
}

// ============================================
// Comparison Types
// ============================================

export interface ComparisonItem {
  listing: Listing;
  seller: Seller;
  totalPrice: number; // price + shipping
  estimatedDelivery: {
    min: Date;
    max: Date;
  };
  badges: ('best_value' | 'lowest_price' | 'fastest_delivery' | 'top_rated')[];
}

export interface PriceComparison {
  itemTitle: string;
  itemDescription: string;
  referenceImage: string;
  listings: ComparisonItem[];
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}

// ============================================
// Platform Adapter Types
// ============================================

export interface PlatformAdapter {
  platform: Platform;
  region: Region[];

  // Methods
  fetchListings(query: SearchQuery): Promise<Listing[]>;
  fetchListing(id: string): Promise<Listing | null>;
  fetchSeller(id: string): Promise<Seller | null>;
  syncListings(since?: Date): Promise<Listing[]>;
}

export interface AdapterConfig {
  platform: Platform;
  apiKey?: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  retryConfig: {
    maxRetries: number;
    backoffMs: number;
  };
}
