'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';
import {
  FileText, Users, AlertTriangle, CheckCircle, 
  Clock, TrendingUp, Search, Filter, Plus,
  Calendar, Eye, Edit, Trash2, Download,
  Bell, Shield, Award, Target
} from 'lucide-react';

interface Policy {
  id: string;
  title: string;
  category: string;
  department_owner: string;
  status: 'active' | 'pending' | 'expired' | 'draft';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  document_id: string;
  ai_tags?: string[];
}

interface DashboardStats {
  totalPolicies: number;
  activePolicies: number;
  pendingApproval: number;
  expiringSoon: number;
  draftPolicies: number;
}

const PolicyDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPolicies: 0,
    activePolicies: 0,
    pendingApproval: 0,
    expiringSoon: 0,
    draftPolicies: 0
  });

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // 인증 확인 및 데이터 로드
  useEffect(() => {
    const token = localStorage.getItem('authToken') || 
                 localStorage.getItem('token') || 
                 sessionStorage.getItem('authToken');
    
    if (!token) {
      window.location.href = '/login';
      return;
    }

    loadDashboardData();
  }, []);

  // 대시보드 데이터 로드
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || 
                   localStorage.getItem('token') || 
                   sessionStorage.getItem('authToken');

      // 정책 목록 조회
      const policiesResponse = await fetch('/api/policies?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!policiesResponse.ok) {
        if (policiesResponse.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('데이터를 불러올 수 없습니다.');
      }

      const policiesData = await policiesResponse.json();
      const policyList = policiesData.data?.policies || [];
      
      setPolicies(policyList);
      
      // 통계 계산
      const calculatedStats = {
        totalPolicies: policyList.length,
        activePolicies: policyList.filter((p: Policy) => p.status === 'active').length,
        pendingApproval: policyList.filter((p: Policy) => p.status === 'pending').length,
        expiringSoon: policyList.filter((p: Policy) => p.status === 'expired').length,
        draftPolicies: policyList.filter((p: Policy) => p.status === 'draft').length
      };
      
      setStats(calculatedStats);

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 차트 데이터 생성
  const getCategoryData = () => {
    const categoryCount = policies.reduce((acc: any, policy) => {
      const category = policy.category || '미분류';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCount).map(([name, count], index) => ({
      name,
      count,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6]
    }));
  };

  const getDepartmentData = () => {
    const deptCount = policies.reduce((acc: any, policy) => {
      const dept = policy.department_owner || '미지정';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(deptCount).map(([department, policies]) => ({
      department,
      policies,
      compliance: Math.floor(Math.random() * 20) + 80 // 임시 데이터
    }));
  };

  const getStatusColor = (status: Policy['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Policy['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }: {
    icon: any;
    title: string;
    value: string | number;
    change?: string;
    color?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">오류 발생</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">정책 관리 대시보드</h1>
              <p className="text-gray-600">크레디뷰 내부 정책 통합 관리 시스템</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => window.location.href = '/policies/new'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                새 정책 등록
              </button>
              <button 
                onClick={() => window.location.href = '/policies'}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                정책 목록
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 relative">
                <Bell className="w-5 h-5" />
                {stats.pendingApproval > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 탭 메뉴 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: '개요', icon: Target },
                { id: 'policies', name: '정책 목록', icon: FileText },
                { id: 'analytics', name: '분석', icon: TrendingUp }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 개요 탭 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={FileText}
                title="전체 정책"
                value={stats.totalPolicies}
                color="blue"
              />
              <StatCard
                icon={CheckCircle}
                title="활성 정책"
                value={stats.activePolicies}
                color="green"
              />
              <StatCard
                icon={Clock}
                title="승인 대기"
                value={stats.pendingApproval}
                color="yellow"
              />
              <StatCard
                icon={AlertTriangle}
                title="초안"
                value={stats.draftPolicies}
                color="gray"
              />
            </div>

            {/* 차트 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 카테고리별 분포 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 정책 분포</h3>
                {getCategoryData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getCategoryData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="count"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {getCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>표시할 데이터가 없습니다</p>
                  </div>
                )}
              </div>

              {/* 부서별 현황 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">부서별 정책 현황</h3>
                {getDepartmentData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getDepartmentData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="policies" fill="#3B82F6" name="정책 수" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>표시할 데이터가 없습니다</p>
                  </div>
                )}
              </div>
            </div>

            {/* 최근 정책 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 등록된 정책</h3>
              {policies.length > 0 ? (
                <div className="space-y-4">
                  {policies.slice(0, 5).map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900">{policy.title}</h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                            {policy.status === 'active' ? '활성' :
                             policy.status === 'pending' ? '대기' :
                             policy.status === 'expired' ? '만료' : '초안'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{policy.department_owner}</span>
                          <span>{new Date(policy.created_at).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => window.location.href = `/policies/${policy.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        보기
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>등록된 정책이 없습니다</p>
                  <button
                    onClick={() => window.location.href = '/policies/new'}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    첫 번째 정책을 등록해보세요
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 정책 목록 탭 */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {policies.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">정책이 없습니다</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    새로운 정책을 등록해보세요.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => window.location.href = '/policies/new'}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      새 정책 등록
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          정책명
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          우선순위
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          부서
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          등록일
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {policies.slice(0, 10).map((policy) => (
                        <tr key={policy.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {policy.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {policy.document_id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                              {policy.status === 'active' ? '활성' :
                               policy.status === 'pending' ? '대기' :
                               policy.status === 'expired' ? '만료' : '초안'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getPriorityColor(policy.priority)}`}>
                              {policy.priority === 'high' ? '높음' :
                               policy.priority === 'medium' ? '보통' : '낮음'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {policy.department_owner}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(policy.created_at).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => window.location.href = `/policies/${policy.id}`}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              보기
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 분석 탭 */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">통계 요약</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalPolicies}</div>
                  <div className="text-sm text-gray-600">총 정책 수</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.totalPolicies > 0 ? Math.round((stats.activePolicies / stats.totalPolicies) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">활성화율</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{getCategoryData().length}</div>
                  <div className="text-sm text-gray-600">정책 카테고리 수</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyDashboard;
