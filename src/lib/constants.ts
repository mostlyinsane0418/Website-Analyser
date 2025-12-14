// Fashion Resale Discovery Platform - Constants

import { Platform, Region, Currency, ItemCondition } from '@/types';

// ============================================
// Platform Configuration
// ============================================

export const PLATFORM_CONFIG: Record<Platform, {
  name: string;
  displayName: string;
  regions: Region[];
  color: string;
  logoUrl: string;
  affiliateEnabled: boolean;
}> = {
  depop: {
    name: 'depop',
    displayName: 'Depop',
    regions: ['US', 'UK'],
    color: '#FF2300',
    logoUrl: '/platforms/depop.svg',
    affiliateEnabled: true,
  },
  poshmark: {
    name: 'poshmark',
    displayName: 'Poshmark',
    regions: ['US'],
    color: '#7E0A2F',
    logoUrl: '/platforms/poshmark.svg',
    affiliateEnabled: true,
  },
  ebay_us: {
    name: 'ebay_us',
    displayName: 'eBay',
    regions: ['US'],
    color: '#E53238',
    logoUrl: '/platforms/ebay.svg',
    affiliateEnabled: true,
  },
  ebay_uk: {
    name: 'ebay_uk',
    displayName: 'eBay UK',
    regions: ['UK'],
    color: '#E53238',
    logoUrl: '/platforms/ebay.svg',
    affiliateEnabled: true,
  },
  vinted: {
    name: 'vinted',
    displayName: 'Vinted',
    regions: ['UK'],
    color: '#09B1BA',
    logoUrl: '/platforms/vinted.svg',
    affiliateEnabled: false,
  },
  thredUp: {
    name: 'thredUp',
    displayName: 'ThredUp',
    regions: ['US'],
    color: '#00A67E',
    logoUrl: '/platforms/thredup.svg',
    affiliateEnabled: true,
  },
  vestiaire: {
    name: 'vestiaire',
    displayName: 'Vestiaire Collective',
    regions: ['UK'],
    color: '#000000',
    logoUrl: '/platforms/vestiaire.svg',
    affiliateEnabled: true,
  },
};

// ============================================
// Currency Configuration
// ============================================

export const CURRENCY_CONFIG: Record<Currency, {
  symbol: string;
  code: string;
  locale: string;
}> = {
  USD: { symbol: '$', code: 'USD', locale: 'en-US' },
  GBP: { symbol: '£', code: 'GBP', locale: 'en-GB' },
  EUR: { symbol: '€', code: 'EUR', locale: 'de-DE' },
};

export const REGION_CURRENCY: Record<Region, Currency> = {
  US: 'USD',
  UK: 'GBP',
};

// ============================================
// Condition Display
// ============================================

export const CONDITION_DISPLAY: Record<ItemCondition, {
  label: string;
  shortLabel: string;
  description: string;
}> = {
  new_with_tags: {
    label: 'New with Tags',
    shortLabel: 'NWT',
    description: 'Brand new, never worn, with original tags attached',
  },
  like_new: {
    label: 'Like New',
    shortLabel: 'Like New',
    description: 'Worn once or twice, no visible signs of wear',
  },
  good: {
    label: 'Good',
    shortLabel: 'Good',
    description: 'Gently used with minor signs of wear',
  },
  fair: {
    label: 'Fair',
    shortLabel: 'Fair',
    description: 'Shows noticeable wear but still in usable condition',
  },
};

// ============================================
// Size Charts
// ============================================

export const SIZE_CONVERSION = {
  womensTops: [
    { label: 'XS', US: '0-2', UK: '4-6', EU: '32-34' },
    { label: 'S', US: '4-6', UK: '8-10', EU: '36-38' },
    { label: 'M', US: '8-10', UK: '12-14', EU: '40-42' },
    { label: 'L', US: '12-14', UK: '16-18', EU: '44-46' },
    { label: 'XL', US: '16-18', UK: '20-22', EU: '48-50' },
  ],
  womensBottoms: [
    { label: '24', US: '24', UK: '6', EU: '32' },
    { label: '25', US: '25', UK: '7', EU: '33' },
    { label: '26', US: '26', UK: '8', EU: '34' },
    { label: '27', US: '27', UK: '9', EU: '35' },
    { label: '28', US: '28', UK: '10', EU: '36' },
    { label: '29', US: '29', UK: '11', EU: '37' },
    { label: '30', US: '30', UK: '12', EU: '38' },
    { label: '31', US: '31', UK: '13', EU: '39' },
    { label: '32', US: '32', UK: '14', EU: '40' },
  ],
  womensShoes: [
    { label: '5', US: '5', UK: '3', EU: '35' },
    { label: '6', US: '6', UK: '4', EU: '36' },
    { label: '7', US: '7', UK: '5', EU: '37' },
    { label: '8', US: '8', UK: '6', EU: '38' },
    { label: '9', US: '9', UK: '7', EU: '39' },
    { label: '10', US: '10', UK: '8', EU: '40' },
  ],
  mensTops: [
    { label: 'XS', US: 'XS', UK: 'XS', EU: '44' },
    { label: 'S', US: 'S', UK: 'S', EU: '46' },
    { label: 'M', US: 'M', UK: 'M', EU: '48' },
    { label: 'L', US: 'L', UK: 'L', EU: '50' },
    { label: 'XL', US: 'XL', UK: 'XL', EU: '52' },
    { label: 'XXL', US: 'XXL', UK: 'XXL', EU: '54' },
  ],
  mensShoes: [
    { label: '7', US: '7', UK: '6', EU: '40' },
    { label: '8', US: '8', UK: '7', EU: '41' },
    { label: '9', US: '9', UK: '8', EU: '42' },
    { label: '10', US: '10', UK: '9', EU: '43' },
    { label: '11', US: '11', UK: '10', EU: '44' },
    { label: '12', US: '12', UK: '11', EU: '45' },
  ],
};

// ============================================
// Category Taxonomy
// ============================================

export const CATEGORIES = {
  clothing: {
    label: 'Clothing',
    subcategories: {
      tops: {
        label: 'Tops',
        items: ['t-shirts', 'blouses', 'sweaters', 'hoodies', 'tank-tops', 'crop-tops'],
      },
      bottoms: {
        label: 'Bottoms',
        items: ['jeans', 'trousers', 'shorts', 'skirts', 'leggings'],
      },
      dresses: {
        label: 'Dresses',
        items: ['mini', 'midi', 'maxi', 'formal', 'casual'],
      },
      outerwear: {
        label: 'Outerwear',
        items: ['jackets', 'coats', 'blazers', 'vests', 'parkas'],
      },
      activewear: {
        label: 'Activewear',
        items: ['sports-bras', 'leggings', 'shorts', 'tops', 'sets'],
      },
    },
  },
  shoes: {
    label: 'Shoes',
    subcategories: {
      sneakers: { label: 'Sneakers', items: ['low-top', 'high-top', 'running', 'skate'] },
      boots: { label: 'Boots', items: ['ankle', 'knee-high', 'combat', 'chelsea'] },
      heels: { label: 'Heels', items: ['pumps', 'stilettos', 'block', 'wedges'] },
      flats: { label: 'Flats', items: ['ballet', 'loafers', 'mules', 'oxfords'] },
      sandals: { label: 'Sandals', items: ['slides', 'strappy', 'platform', 'flip-flops'] },
    },
  },
  accessories: {
    label: 'Accessories',
    subcategories: {
      bags: { label: 'Bags', items: ['totes', 'crossbody', 'shoulder', 'clutches', 'backpacks'] },
      jewelry: { label: 'Jewelry', items: ['necklaces', 'earrings', 'bracelets', 'rings'] },
      watches: { label: 'Watches', items: ['analog', 'digital', 'smart', 'luxury'] },
      belts: { label: 'Belts', items: ['leather', 'chain', 'fabric', 'statement'] },
      hats: { label: 'Hats', items: ['caps', 'beanies', 'fedoras', 'bucket'] },
      scarves: { label: 'Scarves', items: ['silk', 'wool', 'cotton', 'bandanas'] },
      sunglasses: { label: 'Sunglasses', items: ['aviator', 'cat-eye', 'round', 'square'] },
    },
  },
};

// ============================================
// Popular Brands
// ============================================

export const POPULAR_BRANDS = {
  luxury: [
    'Gucci', 'Louis Vuitton', 'Chanel', 'Prada', 'Dior', 'Balenciaga',
    'Burberry', 'Hermès', 'Valentino', 'Versace', 'Fendi', 'Givenchy',
  ],
  designer: [
    'Acne Studios', 'Alexander McQueen', 'Bottega Veneta', 'Celine',
    'Marc Jacobs', 'Stella McCartney', 'The Row', 'Totême', 'Jacquemus',
  ],
  contemporary: [
    'Reformation', 'Sézane', 'Ganni', 'Isabel Marant', 'Anine Bing',
    'Staud', 'Nanushka', 'By Far', 'Cult Gaia', 'Rotate',
  ],
  streetwear: [
    'Supreme', 'Off-White', 'Stüssy', 'Palace', 'BAPE', 'Fear of God',
    'Kith', 'Carhartt WIP', 'Stone Island', 'CDG',
  ],
  vintage: [
    "Levi's", 'Wrangler', 'Lee', 'Champion', 'Starter',
    'Ralph Lauren', 'Tommy Hilfiger', 'Nautica', 'FILA',
  ],
  athletic: [
    'Nike', 'Adidas', 'Puma', 'New Balance', 'Reebok',
    'Asics', 'Converse', 'Vans', 'Jordan', 'Yeezy',
  ],
  highStreet: [
    'Zara', 'H&M', 'Mango', 'COS', '& Other Stories',
    'Arket', 'Massimo Dutti', 'Uniqlo', 'ASOS',
  ],
};

// ============================================
// Style Aesthetics (for Gen Z)
// ============================================

export const STYLE_AESTHETICS = [
  { id: 'y2k', label: 'Y2K', description: 'Early 2000s nostalgia' },
  { id: 'quiet-luxury', label: 'Quiet Luxury', description: 'Understated elegance' },
  { id: 'cottagecore', label: 'Cottagecore', description: 'Romantic, rural vibes' },
  { id: 'grunge', label: 'Grunge', description: '90s alternative edge' },
  { id: 'minimalist', label: 'Minimalist', description: 'Clean, simple, timeless' },
  { id: 'streetwear', label: 'Streetwear', description: 'Urban casual culture' },
  { id: 'dark-academia', label: 'Dark Academia', description: 'Scholarly, moody' },
  { id: 'coastal-grandmother', label: 'Coastal Grandmother', description: 'Relaxed, elegant coastal' },
  { id: 'dopamine-dressing', label: 'Dopamine Dressing', description: 'Bold, colorful joy' },
  { id: 'old-money', label: 'Old Money', description: 'Classic, preppy wealth' },
  { id: 'coquette', label: 'Coquette', description: 'Feminine, flirty, bows' },
  { id: 'clean-girl', label: 'Clean Girl', description: 'Effortless natural beauty' },
  { id: 'indie-sleaze', label: 'Indie Sleaze', description: '2010s party aesthetic' },
  { id: 'bohemian', label: 'Bohemian', description: 'Free-spirited, artistic' },
  { id: 'normcore', label: 'Normcore', description: 'Anti-fashion basics' },
];

// ============================================
// Trending Searches (Mock Data)
// ============================================

export const TRENDING_SEARCHES = [
  { query: 'Miu Miu ballet flats', count: 12500 },
  { query: 'Vintage Levi\'s 501', count: 10200 },
  { query: 'Baggy jeans', count: 9800 },
  { query: 'Y2K butterfly top', count: 8400 },
  { query: 'The Row bag', count: 7200 },
  { query: 'Vintage band tee', count: 6900 },
  { query: 'Platform sneakers', count: 6500 },
  { query: 'Oversized blazer', count: 6100 },
  { query: 'Leather jacket vintage', count: 5800 },
  { query: 'CDG converse', count: 5500 },
];

// ============================================
// API Configuration
// ============================================

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// ============================================
// Image Configuration
// ============================================

export const IMAGE_CONFIG = {
  placeholder: '/images/placeholder.png',
  qualityThreshold: 0.6,
  maxUploadSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['image/jpeg', 'image/png', 'image/heic', 'image/webp'],
  aspectRatios: {
    square: 1,
    portrait: 4 / 5,
    landscape: 16 / 9,
  },
};
