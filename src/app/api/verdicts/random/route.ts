import { NextRequest, NextResponse } from 'next/server';
import { getRandomVerdictForUser } from '@/services/dbService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceFingerprint = searchParams.get('deviceFingerprint');

    if (!deviceFingerprint) {
      return NextResponse.json(
        { error: 'Device fingerprint is required' },
        { status: 400 }
      );
    }

    const result = await getRandomVerdictForUser(deviceFingerprint);

    if (!result) {
      return NextResponse.json(
        { error: 'No available cases for voting' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error - Get random verdict:', error);
    return NextResponse.json(
      { error: 'Failed to get random verdict' },
      { status: 500 }
    );
  }
}