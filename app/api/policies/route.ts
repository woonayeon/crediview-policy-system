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

// AI 정책 구조화 함수
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

// GET - 정책 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');

    let query = supabase
      .from('policies')
      .select(`
        *,
        users!policies_created_by_fkey(name, email, department)
      `)
      .order('created_at', { ascending: false });

    // 필터 적용
    if (category) {
      query = query.eq('category', category);
    }
    if (department) {
      query = query.eq('department', department);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    // 페이지네이션
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: policies, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      policies,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('정책 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// POST - 새 정책 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      category,
      department,
      priority,
      effectiveDate,
      expiryDate,
      tags,
      targetAudience,
      approvers,
      createdBy
    } = body;

    // 필수 필드 검증
    if (!title || !content || !category || !department || !createdBy) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // AI 구조화 처리
    const aiStructured = await structurePolicyWithAI(content, title);

    // 정책 데이터베이스 저장
    const { data: policy, error } = await supabase
      .from('policies')
      .insert({
        title,
        content,
        category,
        department,
        priority: priority || 'medium',
        status: 'draft',
        effective_date: effectiveDate,
        expiry_date: expiryDate,
        tags: tags || [],
        target_audience: targetAudience || [],
        approvers: approvers || [],
        created_by: createdBy,
        ai_structured: aiStructured,
        views: 0
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 검색 히스토리에 생성 로그 추가
    await supabase.from('activity_logs').insert({
      user_id: createdBy,
      action: 'create_policy',
      policy_id: policy.id,
      details: { title, category }
    });

    return NextResponse.json({
      policy,
      aiStructured,
      message: '정책이 성공적으로 생성되었습니다.'
    }, { status: 201 });

  } catch (error) {
    console.error('정책 생성 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
