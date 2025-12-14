// Fashion Resale Discovery Platform - Seller API

import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Seller ID is required',
          },
        },
        { status: 400 }
      );
    }

    const seller = await dataService.getSeller(id);

    if (!seller) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Seller not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: seller,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Seller API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SELLER_ERROR',
          message: 'Failed to fetch seller',
        },
      },
      { status: 500 }
    );
  }
}
