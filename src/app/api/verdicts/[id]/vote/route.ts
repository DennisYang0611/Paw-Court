import { NextRequest, NextResponse } from 'next/server';
import { voteVerdict, checkUserVoted, withdrawVote } from '@/services/dbService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { voteType, deviceFingerprint, withdraw } = await request.json();
    const verdictId = params.id;

    if (!deviceFingerprint || !verdictId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 如果是撤回投票
    if (withdraw) {
      await withdrawVote(verdictId, deviceFingerprint);
      return NextResponse.json({
        success: true,
        message: '投票已撤回'
      });
    }

    // 正常投票
    if (!voteType || (voteType !== 'like' && voteType !== 'dislike')) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      );
    }

    await voteVerdict(verdictId, voteType, deviceFingerprint);

    return NextResponse.json({
      success: true,
      message: '投票成功'
    });
  } catch (error: any) {
    console.error('API Error - Vote verdict:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to vote' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceFingerprint = searchParams.get('deviceFingerprint');
    const verdictId = params.id;

    if (!deviceFingerprint || !verdictId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const voteType = await checkUserVoted(verdictId, deviceFingerprint);

    return NextResponse.json({
      voted: !!voteType,
      voteType
    });
  } catch (error) {
    console.error('API Error - Check vote:', error);
    return NextResponse.json(
      { error: 'Failed to check vote status' },
      { status: 500 }
    );
  }
}