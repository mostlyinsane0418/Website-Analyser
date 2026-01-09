// Fashion Resale Discovery Platform - Search API

import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';
import { SearchQuery, SearchFilters, Platform, ItemCondition, Region } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const text = searchParams.get('q') || searchParams.get('text') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const sortBy = (searchParams.get('sort') || 'relevance') as SearchQuery['sortBy'];

    // Parse filters
    const filters: SearchFilters = {};

    const brand = searchParams.get('brand');
    if (brand) filters.brand = brand;

    const minPrice = searchParams.get('minPrice');
    if (minPrice) filters.minPrice = parseFloat(minPrice);

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    const condition = searchParams.get('condition');
    if (condition) filters.condition = condition.split(',') as ItemCondition[];

    const color = searchParams.get('color');
    if (color) filters.color = color.split(',');

    const platform = searchParams.get('platform');
    if (platform) filters.platform = platform.split(',') as Platform[];

    const region = searchParams.get('region') as Region | null;
    if (region) filters.region = region;

    const size = searchParams.get('size');
    if (size) filters.size = size;

    const freeShipping = searchParams.get('freeShipping');
    if (freeShipping === 'true') filters.freeShipping = true;

    const minSellerRating = searchParams.get('minRating');
    if (minSellerRating) filters.minSellerRating = parseFloat(minSellerRating);

    // Build search query
    const query: SearchQuery = {
      text,
      filters,
      sortBy,
      page,
      limit,
    };

    // Execute search
    const results = await dataService.search(query);

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        timestamp: new Date().toISOString(),
        query: { text, filters, sortBy, page, limit },
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Failed to perform search',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query: SearchQuery = {
      text: body.text,
      filters: body.filters || {},
      sortBy: body.sortBy || 'relevance',
      page: body.page || 1,
      limit: Math.min(body.limit || 20, 100),
    };

    const results = await dataService.search(query);

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Failed to perform search',
        },
      },
      { status: 500 }
    );
  }
}
