import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// GET - 통계 정보 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dashboard'; // 'dashboard' | 'detailed' | 'analytics'
    const period = searchParams.get('period') || '30d'; // '7d' | '30d' | '90d' | '1y'

    switch (type) {
      case 'dashboard':
        return await getDashboardStats();
      case 'detailed':
        return await getDetailedStats(period);
      case 'analytics':
        return await getAnalyticsStats(period);
      default:
        return NextResponse.json({ error: '지원하지 않는 통계 타입입니다.' }, { status: 400 });
    }

  } catch (error) {
    console.error('통계 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// 대시보드 기본 통계
async function getDashboardStats() {
  // 전체 정책 통계 조회
  const { data: policies, error: policiesError } = await supabase
    .from('policies')
    .select('id, status, priority, category, created_at, views, department');

  if (policiesError) {
    throw new Error(`정책 조회 실패: ${policiesError.message}`);
  }

  if (!policies) {
    return NextResponse.json({
      basicStats: {
        totalPolicies: 0,
        activePolicies: 0,
        pendingApproval: 0,
        expiringSoon: 0,
        draftPolicies: 0
      },
      categoryStats: {},
      departmentStats: {},
      priorityStats: {},
      recentActivity: []
    });
  }

  // 기본 통계 계산
  const basicStats = {
    totalPolicies: policies.length,
    activePolicies: policies.filter(p => p.status === 'active').length,
    pendingApproval: policies.filter(p => p.status === 'pending').length,
    expiringSoon: policies.filter(p => p.status === 'expiring').length,
    draftPolicies: policies.filter(p => p.status === 'draft').length
  };

  // 카테고리별 분포
  const categoryStats = policies.reduce((acc: any, policy) => {
    const category = policy.category || '미분류';
    acc[category] = {
      count: (acc[category]?.count || 0) + 1,
      active: (acc[category]?.active || 0) + (policy.status === 'active' ? 1 : 0),
      pending: (acc[category]?.pending || 0) + (policy.status === 'pending' ? 1 : 0)
    };
    return acc;
  }, {});

  // 부서별 분포
  const departmentStats = policies.reduce((acc: any, policy) => {
    const department = policy.department || '미지정';
    acc[department] = {
      count: (acc[department]?.count || 0) + 1,
      totalViews: (acc[department]?.totalViews || 0) + (policy.views || 0)
    };
    return acc;
  }, {});

  // 우선순위별 분포
  const priorityStats = policies.reduce((acc: any, policy) => {
    const priority = policy.priority || 'medium';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  // 최근 활동 조회
  const { data: recentActivity } = await supabase
    .from('activity_logs')
    .select(`
      *,
      policies!activity_logs_policy_id_fkey(title),
      users!activity_logs_user_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  return NextResponse.json({
    basicStats,
    categoryStats,
    departmentStats,
    priorityStats,
    recentActivity: recentActivity || [],
    updatedAt: new Date().toISOString()
  });
}

// 상세 통계
async function getDetailedStats(period: string) {
  // 기간 계산
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  // 기간별 정책 데이터 조회
  const { data: policies } = await supabase
    .from('policies')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true });

  // 검색 히스토리 조회
  const { data: searchHistory } = await supabase
    .from('search_history')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // AI 사용량 조회
  const { data: aiUsage } = await supabase
    .from('ai_usage_logs')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // 일별 트렌드 계산
  const dailyTrends = generateDailyTrends(policies || [], startDate, endDate);
  
  // 검색 트렌드 계산
  const searchTrends = calculateSearchTrends(searchHistory || []);
  
  // AI 사용량 통계
  const aiStats = calculateAIStats(aiUsage || []);

  return NextResponse.json({
    period,
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    dailyTrends,
    searchTrends,
    aiStats,
    summary: {
      totalPoliciesCreated: policies?.length || 0,
      totalSearches: searchHistory?.length || 0,
      totalAIRequests: aiUsage?.length || 0
    }
  });
}

// 분석 통계
async function getAnalyticsStats(period: string) {
  // 모든 정책 데이터 조회
  const { data: allPolicies } = await supabase
    .from('policies')
    .select('*');

  // 사용자 활동 조회
  const { data: userActivity } = await supabase
    .from('activity_logs')
    .select(`
      *,
      users!activity_logs_user_id_fkey(name, department)
    `)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  // 조회수 순위
  const topViewedPolicies = allPolicies
    ?.sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10)
    .map(policy => ({
      id: policy.id,
      title: policy.title,
      category: policy.category,
      views: policy.views || 0,
      createdAt: policy.created_at
    })) || [];

  // 부서별 활동
  const departmentActivity = userActivity?.reduce((acc: any, activity) => {
    const dept = activity.users?.department || '미지정';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {}) || {};

  // 정책 생명주기 분석
  const lifecycleAnalysis = analyzePolicyLifecycle(allPolicies || []);

  // 컴플라이언스 점수 계산
  const complianceScore = calculateComplianceScore(allPolicies || []);

  return NextResponse.json({
    topViewedPolicies,
    departmentActivity,
    lifecycleAnalysis,
    complianceScore,
    insights: generateInsights(allPolicies || [], userActivity || [])
  });
}

// 일별 트렌드 생성
function generateDailyTrends(policies: any[], startDate: Date, endDate: Date) {
  const trends = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayPolicies = policies.filter(p => 
      p.created_at.startsWith(dateStr)
    );

    trends.push({
      date: dateStr,
      created: dayPolicies.length,
      categories: dayPolicies.reduce((acc: any, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {})
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return trends;
}

// 검색 트렌드 계산
function calculateSearchTrends(searchHistory: any[]) {
  const queries = searchHistory.reduce((acc: any, search) => {
    if (search.query) {
      acc[search.query] = (acc[search.query] || 0) + 1;
    }
    return acc;
  }, {});

  const topQueries = Object.entries(queries)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  return {
    totalSearches: searchHistory.length,
    uniqueQueries: Object.keys(queries).length,
    topQueries,
    avgResultsPerSearch: searchHistory.length > 0 
      ? (searchHistory.reduce((sum, s) => sum + (s.results_count || 0), 0) / searchHistory.length).toFixed(1)
      : 0
  };
}

// AI 사용량 통계 계산
function calculateAIStats(aiUsage: any[]) {
  const successful = aiUsage.filter(usage => usage.success);
  const failed = aiUsage.filter(usage => !usage.success);

  return {
    totalRequests: aiUsage.length,
    successfulRequests: successful.length,
    failedRequests: failed.length,
    successRate: aiUsage.length > 0 ? ((successful.length / aiUsage.length) * 100).toFixed(1) : 0,
    avgProcessingTime: successful.length > 0 
      ? (successful.reduce((sum, usage) => sum + (usage.processing_time || 0), 0) / successful.length).toFixed(0)
      : 0,
    analysisTypes: aiUsage.reduce((acc: any, usage) => {
      const type = usage.analysis_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  };
}

// 정책 생명주기 분석
function analyzePolicyLifecycle(policies: any[]) {
  const now = new Date();
  const lifecycle = {
    new: 0,        // 30일 이내
    active: 0,     // 30일~1년
    mature: 0,     // 1년~2년
    old: 0         // 2년 이상
  };

  policies.forEach(policy => {
    const createdDate = new Date(policy.created_at);
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceCreation <= 30) {
      lifecycle.new++;
    } else if (daysSinceCreation <= 365) {
      lifecycle.active++;
    } else if (daysSinceCreation <= 730) {
      lifecycle.mature++;
    } else {
      lifecycle.old++;
    }
  });

  return lifecycle;
}

// 컴플라이언스 점수 계산
function calculateComplianceScore(policies: any[]) {
  if (policies.length === 0) return { score: 0, details: {} };

  let totalScore = 0;
  const details = {
    upToDate: 0,
    hasAIAnalysis: 0,
    hasApprovers: 0,
    hasTargetAudience: 0
  };

  policies.forEach(policy => {
    let policyScore = 100;

    // 최근 업데이트 확인
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(policy.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceUpdate > 365) {
      policyScore -= 20;
    } else if (daysSinceUpdate > 180) {
      policyScore -= 10;
    } else {
      details.upToDate++;
    }

    // AI 분석 여부
    if (policy.ai_structured) {
      details.hasAIAnalysis++;
    } else {
      policyScore -= 15;
    }

    // 승인자 설정 여부
    if (policy.approvers && policy.approvers.length > 0) {
      details.hasApprovers++;
    } else {
      policyScore -= 10;
    }

    // 대상 지정 여부
    if (policy.target_audience && policy.target_audience.length > 0) {
      details.hasTargetAudience++;
    } else {
      policyScore -= 5;
    }

    totalScore += Math.max(policyScore, 0);
  });

  return {
    score: Math.round(totalScore / policies.length),
    details: {
      upToDate: Math.round((details.upToDate / policies.length) * 100),
      hasAIAnalysis: Math.round((details.hasAIAnalysis / policies.length) * 100),
      hasApprovers: Math.round((details.hasApprovers / policies.length) * 100),
      hasTargetAudience: Math.round((details.hasTargetAudience / policies.length) * 100)
    }
  };
}

// 인사이트 생성
function generateInsights(policies: any[], userActivity: any[]) {
  const insights = [];

  // 가장 활발한 부서
  const deptActivity = userActivity.reduce((acc: any, activity) => {
    const dept = activity.users?.department || '미지정';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const mostActiveDept = Object.entries(deptActivity)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0];

  if (mostActiveDept) {
    insights.push({
      type: 'department_activity',
      title: '가장 활발한 부서',
      description: `${mostActiveDept[0]}가 최근 30일간 ${mostActiveDept[1]}건의 활동을 기록했습니다.`
    });
  }

  // 정책 증가율
  const recentPolicies = policies.filter(p => 
    new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;
  
  const previousPolicies = policies.filter(p => {
    const createdDate = new Date(p.created_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    return createdDate > sixtyDaysAgo && createdDate <= thirtyDaysAgo;
  }).length;

  if (previousPolicies > 0) {
    const growthRate = ((recentPolicies - previousPolicies) / previousPolicies * 100).toFixed(1);
    insights.push({
      type: 'growth_rate',
      title: '정책 생성 증가율',
      description: `지난 달 대비 ${growthRate}% ${parseFloat(growthRate) > 0 ? '증가' : '감소'}했습니다.`
    });
  }

  return insights;
}
