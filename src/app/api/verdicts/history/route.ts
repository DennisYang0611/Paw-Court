import { NextRequest, NextResponse } from 'next/server';
import { getHistoryVerdicts } from '@/services/dbService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await getHistoryVerdicts(page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error - Get history verdicts:', error);
    return NextResponse.json(
      { error: 'Failed to get history verdicts' },
      { status: 500 }
    );
  }
}