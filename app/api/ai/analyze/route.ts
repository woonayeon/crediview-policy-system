import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 전체 분석 함수
async function structurePolicyWithAI(content: string, title: string) {
  try {
    const prompt = `
다음 정책 내용을 분석하여 구조화된 JSON 형태로 반환해주세요.

정책 제목: ${title}
정책 내용: ${content}

다음 형식으로 응답해주세요:
{
  "category": "정책 카테고리 (보안정책, 인사정책, 재무정책 등)",
  "policyType": "정책 유형 (규정, 지침, 가이드라인 등)",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "tags": ["관련", "태그", "목록"],
  "businessArea": "적용 업무 영역",
  "compliance": {
    "isRequired": true/false,
    "checkpoints": ["확인사항 1", "확인사항 2"]
  },
  "summary": "2-3문장으로 된 정책 요약",
  "riskLevel": "high/medium/low",
  "targetAudience": ["적용 대상"],
  "effectiveScope": "적용 범위"
}

한국어로 응답하고, JSON 형식만 반환해주세요.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "당신은 기업 정책 분석 전문가입니다. 정책 문서를 분석하여 구조화된 데이터를 제공합니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
    });

    const aiResult = JSON.parse(response.choices[0].message.content || '{}');
    return aiResult;
  } catch (error) {
    console.error('AI 구조화 오류:', error);
    return {
      category: "미분류",
      policyType: "일반",
      keyPoints: [],
      tags: [],
      businessArea: "전체",
      compliance: { isRequired: false, checkpoints: [] },
      summary: "AI 분석 중 오류가 발생했습니다.",
      riskLevel: "medium",
      targetAudience: ["전체 직원"],
      effectiveScope: "전사"
    };
  }
}

// 빠른 분석 함수
async function quickAnalyze(content: string, title: string) {
  try {
    const prompt = `
다음 정책을 빠르게 분석하여 카테고리와 태그만 반환해주세요.

제목: ${title}
내용: ${content.substring(0, 500)}...

JSON 형식으로 응답:
{
  "category": "정책 카테고리",
  "tags": ["태그1", "태그2", "태그3"]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('빠른 분석 오류:', error);
    return {
      category: "미분류",
      tags: []
    };
  }
}

// 요약 함수
async function summarizePolicy(content: string, title: string) {
  try {
    const prompt = `
다음 정책을 2-3문장으로 요약해주세요.

제목: ${title}
내용: ${content}

간결하고 핵심적인 내용만 포함하여 요약해주세요.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    return {
      summary: response.choices[0].message.content || '요약 생성 실패'
    };
  } catch (error) {
    console.error('요약 오류:', error);
    return {
      summary: "요약 생성 중 오류가 발생했습니다."
    };
  }
}

// POST - AI 분석 요청
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, analysisType = 'full' } = body;

    if (!content) {
      return NextResponse.json(
        { error: '분석할 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    let aiResult;
    const startTime = Date.now();

    switch (analysisType) {
      case 'quick':
        // 빠른 분석 (카테고리, 태그만)
        aiResult = await quickAnalyze(content, title);
        break;
      case 'full':
        // 전체 분석
        aiResult = await structurePolicyWithAI(content, title);
        break;
      case 'summary':
        // 요약만
        aiResult = await summarizePolicy(content, title);
        break;
      default:
        aiResult = await structurePolicyWithAI(content, title);
    }

    const processingTime = Date.now() - startTime;

    // AI 사용량 로깅
    await supabase.from('ai_usage_logs').insert({
      analysis_type: analysisType,
      content_length: content.length,
      processing_time: processingTime,
      success: true,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      result: aiResult,
      analysisType,
      processingTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI 분석 오류:', error);
    
    // 실패 로깅
    await supabase.from('ai_usage_logs').insert({
      analysis_type: body?.analysisType || 'unknown',
      content_length: body?.content?.length || 0,
      processing_time: 0,
      success: false,
      error_message: error.message,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      error: 'AI 분석 중 오류가 발생했습니다.',
      details: error.message 
    }, { status: 500 });
  }
}

// GET - AI 사용량 통계 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d

    let dateFrom = new Date();
    switch (period) {
      case '7d':
        dateFrom.setDate(dateFrom.getDate() - 7);
        break;
      case '30d':
        dateFrom.setDate(dateFrom.getDate() - 30);
        break;
      case '90d':
        dateFrom.setDate(dateFrom.getDate() - 90);
        break;
    }

    // AI 사용량 통계 조회
    const { data: usageLogs, error } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .gte('created_at', dateFrom.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 통계 계산
    const totalRequests = usageLogs?.length || 0;
    const successfulRequests = usageLogs?.filter(log => log.success).length || 0;
    const failedRequests = totalRequests - successfulRequests;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests * 100).toFixed(1) : 0;
    
    const avgProcessingTime = usageLogs?.length > 0 
      ? (usageLogs.reduce((sum, log) => sum + (log.processing_time || 0), 0) / usageLogs.length).toFixed(0)
      : 0;

    // 분석 타입별 통계
    const analysisTypeStats = usageLogs?.reduce((acc, log) => {
      const type = log.analysis_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // 일별 사용량
    const dailyUsage = usageLogs?.reduce((acc, log) => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      period,
      statistics: {
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate: `${successRate}%`,
        avgProcessingTime: `${avgProcessingTime}ms`
      },
      analysisTypeStats,
      dailyUsage,
      recentLogs: usageLogs?.slice(0, 10) || []
    });

  } catch (error) {
    console.error('AI 통계 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
