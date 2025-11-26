import { NextRequest, NextResponse } from 'next/server';
import { saveVerdict } from '@/services/dbService';

export async function POST(request: NextRequest) {
  try {
    const { formData, result } = await request.json();

    if (!formData || !result) {
      return NextResponse.json(
        { error: 'Missing formData or result' },
        { status: 400 }
      );
    }

    const verdictId = await saveVerdict(formData, result);

    return NextResponse.json({
      success: true,
      verdictId
    });
  } catch (error) {
    console.error('API Error - Save verdict:', error);
    return NextResponse.json(
      { error: 'Failed to save verdict' },
      { status: 500 }
    );
  }
}