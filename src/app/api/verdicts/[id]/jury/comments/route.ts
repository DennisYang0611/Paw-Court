import { NextRequest, NextResponse } from 'next/server';
import { submitJuryComment, getJuryComments } from '@/services/dbService';

// 获取陪审团评论列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verdictId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await getJuryComments(verdictId, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get jury comments:', error);
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 }
    );
  }
}

// 提交陪审团评论
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verdictId = params.id;
    const body = await request.json();
    const { comment, deviceFingerprint, supportSide } = body;

    // 验证必需参数
    if (!comment || !deviceFingerprint || !supportSide) {
      return NextResponse.json(
        { error: '缺少必需参数' },
        { status: 400 }
      );
    }

    // 验证评论长度
    if (comment.trim().length < 5) {
      return NextResponse.json(
        { error: '评论内容至少需要5个字符' },
        { status: 400 }
      );
    }

    if (comment.length > 500) {
      return NextResponse.json(
        { error: '评论内容不能超过500个字符' },
        { status: 400 }
      );
    }

    // 验证supportSide值
    if (!['person1', 'person2', 'neutral'].includes(supportSide)) {
      return NextResponse.json(
        { error: '无效的支持方' },
        { status: 400 }
      );
    }

    const result = await submitJuryComment(
      verdictId,
      deviceFingerprint,
      comment.trim(),
      supportSide
    );

    return NextResponse.json({
      success: true,
      comment: result,
      message: '评论提交成功'
    });
  } catch (error: any) {
    console.error('Failed to submit jury comment:', error);
    return NextResponse.json(
      { error: '评论提交失败' },
      { status: 500 }
    );
  }
}