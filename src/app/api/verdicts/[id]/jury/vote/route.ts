import { NextRequest, NextResponse } from 'next/server';
import { submitJuryVote, checkJuryVoted } from '@/services/dbService';

// 获取陪审团投票状态
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verdictId = params.id;
    const { searchParams } = new URL(request.url);
    const deviceFingerprint = searchParams.get('deviceFingerprint');

    if (!deviceFingerprint) {
      return NextResponse.json(
        { error: '缺少设备指纹参数' },
        { status: 400 }
      );
    }

    const votedSide = await checkJuryVoted(verdictId, deviceFingerprint);

    return NextResponse.json({
      voted: !!votedSide,
      supportSide: votedSide
    });
  } catch (error) {
    console.error('Failed to check jury vote status:', error);
    return NextResponse.json(
      { error: '获取投票状态失败' },
      { status: 500 }
    );
  }
}

// 提交陪审团投票
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verdictId = params.id;
    const body = await request.json();
    const { supportSide, deviceFingerprint, reasoning } = body;

    // 验证必需参数
    if (!supportSide || !deviceFingerprint) {
      return NextResponse.json(
        { error: '缺少必需参数' },
        { status: 400 }
      );
    }

    // 验证supportSide值
    if (!['person1', 'person2'].includes(supportSide)) {
      return NextResponse.json(
        { error: '无效的支持方' },
        { status: 400 }
      );
    }

    await submitJuryVote(verdictId, deviceFingerprint, supportSide, reasoning);

    return NextResponse.json({
      success: true,
      message: '陪审团投票提交成功'
    });
  } catch (error: any) {
    console.error('Failed to submit jury vote:', error);

    if (error.message?.includes('已经投过票')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: '投票提交失败' },
      { status: 500 }
    );
  }
}