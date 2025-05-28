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
  department: string;
  status: 'active' | 'pending' | 'expired' | 'draft';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  views: number;
  tags: string[];
}

interface DashboardStats {
  totalPolicies: number;
  activePolicies: number;
  pendingApproval: number;
  expiringSoon: number;
  aiProcessed: number;
  monthlyGrowth: number;
}

const PolicyDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPolicies: 156,
    activePolicies: 128,
    pendingApproval: 12,
    expiringSoon: 8,
    aiProcessed: 89,
    monthlyGrowth: 15.3
  });

  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: '1',
      title: '개인정보보호 정책',
      category: '보안정책',
      department: '법무팀',
      status: 'active',
      priority: 'high',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      createdBy: '김법무',
      views: 245,
      tags: ['개인정보', '보안', '컴플라이언스']
    },
    {
      id: '2',
      title: '재택근무 가이드라인',
      category: '인사정책',
      department: '인사팀',
      status: 'active',
      priority: 'medium',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      createdBy: '박인사',
      views: 189,
      tags: ['재택근무', '인사', '업무환경']
    },
    {
      id: '3',
      title: '비용 승인 절차',
      category: '재무정책',
      department: '재무팀',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-22',
      updatedAt: '2024-01-22',
      createdBy: '최재무',
      views: 67,
      tags: ['비용', '승인', '절차']
    }
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  // 차트 데이터
  const categoryData = [
    { name: '보안정책', count: 45, color: '#3B82F6' },
    { name: '인사정책', count: 32, color: '#10B981' },
    { name: '재무정책', count: 28, color: '#F59E0B' },
    { name: '운영정책', count: 25, color: '#EF4444' },
    { name: '기술정책', count: 18, color: '#8B5CF6' },
    { name: '법무정책', count: 8, color: '#06B6D4' }
  ];

  const monthlyData = [
    { month: '1월', created: 12, updated: 8, views: 1250 },
    { month: '2월', created: 15, updated: 12, views: 1450 },
    { month: '3월', created: 18, updated: 15, views: 1680 },
    { month: '4월', created: 22, updated: 18, views: 1920 },
    { month: '5월', created: 25, updated: 20, views: 2100 }
  ];

  const departmentStats = [
    { department: '법무팀', policies: 35, compliance: 98 },
    { department: '인사팀', policies: 28, compliance: 95 },
    { department: '재무팀', policies: 25, compliance: 92 },
    { department: '운영팀', policies: 22, compliance: 88 },
    { department: '기술팀', policies: 18, compliance: 85 }
  ];

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
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                새 정책 등록
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
                { id: 'analytics', name: '분석', icon: TrendingUp },
                { id: 'compliance', name: '컴플라이언스', icon: Shield }
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
                change="+12"
                color="blue"
              />
              <StatCard
                icon={CheckCircle}
                title="활성 정책"
                value={stats.activePolicies}
                change="+8"
                color="green"
              />
              <StatCard
                icon={Clock}
                title="승인 대기"
                value={stats.pendingApproval}
                change="+3"
                color="yellow"
              />
              <StatCard
                icon={AlertTriangle}
                title="만료 예정"
                value={stats.expiringSoon}
                change="-2"
                color="red"
              />
            </div>

            {/* 차트 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 카테고리별 분포 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 정책 분포</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* 월별 트렌드 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 정책 생성 트렌드</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="created"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      name="신규 생성"
                    />
                    <Area
                      type="monotone"
                      dataKey="updated"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      name="업데이트"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
              <div className="space-y-4">
                {[
                  { action: '새 정책 생성', policy: '개인정보보호 정책', user: '김법무', time: '2시간 전', type: 'create' },
                  { action: '정책 수정', policy: '재택근무 가이드라인', user: '박인사', time: '4시간 전', type: 'update' },
                  { action: '정책 승인', policy: '비용 승인 절차', user: '이대표', time: '6시간 전', type: 'approve' },
                  { action: 'AI 분석 완료', policy: '보안 정책', user: 'System', time: '8시간 전', type: 'ai' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-md">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'create' ? 'bg-green-100' :
                      activity.type === 'update' ? 'bg-blue-100' :
                      activity.type === 'approve' ? 'bg-purple-100' :
                      'bg-yellow-100'
                    }`}>
                      {activity.type === 'create' && <Plus className="w-4 h-4 text-green-600" />}
                      {activity.type === 'update' && <Edit className="w-4 h-4 text-blue-600" />}
                      {activity.type === 'approve' && <CheckCircle className="w-4 h-4 text-purple-600" />}
                      {activity.type === 'ai' && <Award className="w-4 h-4 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}: <span className="text-blue-600">{activity.policy}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 정책 목록 탭 */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            {/* 검색 및 필터 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="정책명, 내용, 태그로 검색..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>전체 카테고리</option>
                    <option>보안정책</option>
                    <option>인사정책</option>
                    <option>재무정책</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>전체 상태</option>
                    <option>활성</option>
                    <option>대기</option>
                    <option>만료</option>
                  </select>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    <Filter className="w-4 h-4" />
                    필터
                  </button>
                </div>
              </div>
            </div>

            {/* 정책 테이블 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        정책명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        카테고리
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        부서
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        우선순위
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        조회수
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
                    {policies.map((policy) => (
                      <tr key={policy.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {policy.title}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {policy.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {tag}
                                </span>
                              ))}
                              {policy.tags.length > 2 && (
                                <span className="text-xs text-gray-500">+{policy.tags.length - 2}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {policy.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {policy.department}
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
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            {policy.views}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(policy.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 분석 탭 */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">부서별 정책 현황</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="policies" fill="#3B82F6" name="정책 수" />
                  <Bar dataKey="compliance" fill="#10B981" name="준수율(%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 컴플라이언스 탭 */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Shield}
                title="컴플라이언스 점수"
                value="94%"
                change="+2%"
                color="green"
              />
              <StatCard
                icon={AlertTriangle}
                title="위험 정책"
                value="3"
                change="-1"
                color="red"
              />
              <StatCard
                icon={CheckCircle}
                title="감사 통과율"
                value="98%"
                change="+1%"
                color="blue"
              />
              <StatCard
                icon={Clock}
                title="검토 필요"
                value="7"
                change="+2"
                color="yellow"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyDashboard;
