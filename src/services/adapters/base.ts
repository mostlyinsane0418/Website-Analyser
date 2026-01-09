// Fashion Resale Discovery Platform - Base Platform Adapter

import { Platform, Region, Listing, Seller, SearchQuery, AdapterConfig } from '@/types';

export abstract class BasePlatformAdapter {
  protected config: AdapterConfig;
  protected platform: Platform;
  protected supportedRegions: Region[];

  constructor(config: AdapterConfig, supportedRegions: Region[]) {
    this.config = config;
    this.platform = config.platform;
    this.supportedRegions = supportedRegions;
  }

  // Abstract methods to be implemented by each platform adapter
  abstract fetchListings(query: SearchQuery): Promise<Listing[]>;
  abstract fetchListing(id: string): Promise<Listing | null>;
  abstract fetchSeller(id: string): Promise<Seller | null>;
  abstract syncListings(since?: Date): Promise<Listing[]>;

  // Check if platform supports a region
  supportsRegion(region: Region): boolean {
    return this.supportedRegions.includes(region);
  }

  // Rate limiting helper
  protected async withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    // In production, implement proper rate limiting
    return fn();
  }

  // Retry logic helper
  protected async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.config.retryConfig.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries - 1) {
          const delay = this.config.retryConfig.backoffMs * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Transform platform-specific data to unified format
  protected abstract transformListing(rawData: unknown): Listing;
  protected abstract transformSeller(rawData: unknown): Seller;
}

// Adapter registry for managing multiple platform adapters
export class AdapterRegistry {
  private adapters: Map<Platform, BasePlatformAdapter> = new Map();

  register(adapter: BasePlatformAdapter): void {
    this.adapters.set(adapter['platform'], adapter);
  }

  get(platform: Platform): BasePlatformAdapter | undefined {
    return this.adapters.get(platform);
  }

  getAll(): BasePlatformAdapter[] {
    return Array.from(this.adapters.values());
  }

  getForRegion(region: Region): BasePlatformAdapter[] {
    return this.getAll().filter(adapter => adapter.supportsRegion(region));
  }

  async fetchFromAll(query: SearchQuery): Promise<Listing[]> {
    const adapters = query.filters.region
      ? this.getForRegion(query.filters.region)
      : this.getAll();

    const results = await Promise.allSettled(
      adapters.map(adapter => adapter.fetchListings(query))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<Listing[]> =>
        result.status === 'fulfilled'
      )
      .flatMap(result => result.value);
  }
}

// Global adapter registry instance
export const adapterRegistry = new AdapterRegistry();
