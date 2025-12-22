import { NextRequest, NextResponse } from 'next/server';
import { getJuryStats } from '@/services/dbService';

// 获取陪审团投票统计
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verdictId = params.id;
    const stats = await getJuryStats(verdictId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get jury stats:', error);
    return NextResponse.json(
      { error: '获取陪审团统计失败' },
      { status: 500 }
    );
  }
}