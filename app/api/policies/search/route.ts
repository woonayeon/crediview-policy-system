import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// POST - 고급 검색
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      keyword,
      category,
      department,
      status,
      priority,
      tags,
      dateRange,
      userId,
      page = 1,
      limit = 10
    } = body;

    let query = supabase
      .from('policies')
      .select(`
        *,
        users!policies_created_by_fkey(name, email, department)
      `);

    // 키워드 검색 (제목, 내용, 태그)
    if (keyword) {
      query = query.or(
        `title.ilike.%${keyword}%,content.ilike.%${keyword}%,tags.cs.{${keyword}}`
      );
    }

    // 필터 적용
    if (category) query = query.eq('category', category);
    if (department) query = query.eq('department', department);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    
    // 태그 필터
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    // 날짜 필터
    if (dateRange?.start) {
      query = query.gte('created_at', dateRange.start);
    }
    if (dateRange?.end) {
      query = query.lte('created_at', dateRange.end);
    }

    // 정렬 및 페이지네이션
    query = query.order('created_at', { ascending: false });
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: policies, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 검색 히스토리 저장
    if (userId && keyword) {
      await supabase.from('search_history').insert({
        user_id: userId,
        query: keyword,
        filters: { category, department, status, priority, tags },
        results_count: policies?.length || 0,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({
      policies,
      searchInfo: {
        keyword,
        filters: { category, department, status, priority, tags, dateRange },
        resultsCount: policies?.length || 0,
        totalCount: count
      },
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('검색 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// GET - 검색 제안 및 자동완성
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'suggestions' | 'autocomplete' | 'popular'
    const query = searchParams.get('q');
    const userId = searchParams.get('userId');

    switch (type) {
      case 'suggestions':
        // 검색 제안 (최근 검색어, 인기 검색어)
        return await getSearchSuggestions(userId);
        
      case 'autocomplete':
        // 자동완성
        return await getAutoComplete(query || '');
        
      case 'popular':
        // 인기 검색어
        return await getPopularSearches();
        
      default:
        return NextResponse.json({ error: '지원하지 않는 타입입니다.' }, { status: 400 });
    }

  } catch (error) {
    console.error('검색 제안 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// 검색 제안 함수
async function getSearchSuggestions(userId: string | null) {
  const suggestions = {
    recent: [],
    popular: [],
    recommended: []
  };

  // 최근 검색어 (사용자별)
  if (userId) {
    const { data: recentSearches } = await supabase
      .from('search_history')
      .select('query')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    suggestions.recent = recentSearches?.map(s => s.query).filter(Boolean) || [];
  }

  // 인기 검색어 (전체)
  const { data: popularSearches } = await supabase
    .from('search_history')
    .select('query')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 최근 7일
    .order('created_at', { ascending: false });

  if (popularSearches) {
    const queryCount = popularSearches.reduce((acc, search) => {
      if (search.query) {
        acc[search.query] = (acc[search.query] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    suggestions.popular = Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([query]) => query);
  }

  // 추천 검색어 (카테고리 기반)
  const { data: categories } = await supabase
    .from('policies')
    .select('category')
    .limit(10);

  suggestions.recommended = Array.from(new Set(
    categories?.map(p => p.category).filter(Boolean) || []
  )).slice(0, 5);

  return NextResponse.json({ suggestions });
}

// 자동완성 함수
async function getAutoComplete(query: string) {
  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  // 정책 제목에서 자동완성
  const { data: titleMatches } = await supabase
    .from('policies')
    .select('title')
    .ilike('title', `%${query}%`)
    .limit(10);

  // 태그에서 자동완성
  const { data: policies } = await supabase
    .from('policies')
    .select('tags')
    .not('tags', 'is', null)
    .limit(50);

  const tagMatches = policies?.flatMap(p => p.tags || [])
    .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5) || [];

  const suggestions = [
    ...(titleMatches?.map(p => ({ type: 'title', text: p.title })) || []),
    ...tagMatches.map(tag => ({ type: 'tag', text: tag }))
  ];

  return NextResponse.json({ 
    suggestions: suggestions.slice(0, 10),
    query 
  });
}

// 인기 검색어 함수
async function getPopularSearches() {
  const { data: searches } = await supabase
    .from('search_history')
    .select('query, results_count, created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // 최근 30일
    .not('query', 'is', null);

  if (!searches) {
    return NextResponse.json({ popularSearches: [] });
  }

  // 검색어별 통계 계산
  const searchStats = searches.reduce((acc, search) => {
    if (!search.query) return acc;
    
    if (!acc[search.query]) {
      acc[search.query] = {
        query: search.query,
        count: 0,
        totalResults: 0,
        lastSearched: search.created_at
      };
    }
    
    acc[search.query].count += 1;
    acc[search.query].totalResults += search.results_count || 0;
    
    if (new Date(search.created_at) > new Date(acc[search.query].lastSearched)) {
      acc[search.query].lastSearched = search.created_at;
    }
    
    return acc;
  }, {} as Record<string, any>);

  // 인기순으로 정렬
  const popularSearches = Object.values(searchStats)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10)
    .map((stat: any) => ({
      query: stat.query,
      searchCount: stat.count,
      avgResults: Math.round(stat.totalResults / stat.count),
      lastSearched: stat.lastSearched
    }));

  return NextResponse.json({ 
    popularSearches,
    period: '30일간',
    updatedAt: new Date().toISOString()
  });
}
