import { NextRequest, NextResponse } from 'next/server';
import { analyzeCoupleFight } from '@/services/aiService';

// 存储IP访问记录的Map
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

// 限流配置
const RATE_LIMIT = {
  maxRequests: 3, // 每个时间窗口最多3次请求
  windowMs: 1 * 60 * 1000, // 1分钟时间窗口
};

function getRealIP(request: NextRequest): string {
  // 尝试从各种header中获取真实IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // 如果都没有，使用request.ip或默认值
  return request.ip || '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > RATE_LIMIT.windowMs) {
    // 新IP或时间窗口已过，重置计数
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return {
      allowed: true,
      remaining: RATE_LIMIT.maxRequests - 1,
      resetTime: now + RATE_LIMIT.windowMs
    };
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    // 超过限制
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.lastReset + RATE_LIMIT.windowMs
    };
  }

  // 增加计数
  record.count += 1;
  rateLimitMap.set(ip, record);

  return {
    allowed: true,
    remaining: RATE_LIMIT.maxRequests - record.count,
    resetTime: record.lastReset + RATE_LIMIT.windowMs
  };
}

export async function POST(request: NextRequest) {
  try {
    const ip = getRealIP(request);
    const { allowed, remaining, resetTime } = checkRateLimit(ip);

    if (!allowed) {
      const resetDate = new Date(resetTime);
      return NextResponse.json(
        {
          error: '请求过于频繁，请稍后再试',
          details: `您已达到访问限制，请在 ${resetDate.toLocaleTimeString('zh-CN')} 后重试`,
          resetTime: resetTime
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toString(),
          }
        }
      );
    }

    const { formData } = await request.json();

    if (!formData) {
      return NextResponse.json(
        { error: '缺少表单数据' },
        { status: 400 }
      );
    }

    // 验证表单数据完整性
    if (!formData.person1 || !formData.person2 ||
        !formData.person1.name || !formData.person1.story || !formData.person1.complaint ||
        !formData.person2.name || !formData.person2.story || !formData.person2.complaint) {
      return NextResponse.json(
        { error: '表单数据不完整' },
        { status: 400 }
      );
    }

    // 调用AI分析
    const aiResult = await analyzeCoupleFight(formData);

    // 返回结果，包含限流信息
    return NextResponse.json(
      {
        success: true,
        result: aiResult
      },
      {
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetTime.toString(),
        }
      }
    );

  } catch (error) {
    console.error('AI分析失败:', error);
    return NextResponse.json(
      {
        error: 'AI分析服务暂时不可用',
        details: '请稍后重试或联系管理员'
      },
      { status: 500 }
    );
  }
}

// 清理过期的限流记录（可选，防止内存泄漏）
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((record, ip) => {
    if (now - record.lastReset > RATE_LIMIT.windowMs) {
      rateLimitMap.delete(ip);
    }
  });
}, 2 * 60 * 1000); // 每2分钟清理一次