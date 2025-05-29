'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PolicySearch from '../components/PolicySearch';

export default function PoliciesPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 인증 확인
  useEffect(() => {
    const token = localStorage.getItem('authToken') || 
                 localStorage.getItem('token') || 
                 sessionStorage.getItem('authToken');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    setIsAuthenticated(true);
    fetchPolicies();
  }, [router]);

  // 정책 목록 조회
  const fetchPolicies = async (filters) => {
    try {
      setLoading(true);
      
      let url = '/api/policies';
      const params = new URLSearchParams();

      if (filters) {
        if (filters.keyword) params.append('search', filters.keyword);
        if (filters.category) params.append('category', filters.category);
        if (filters.department) params.append('department', filters.department);
        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const token = localStorage.getItem('authToken') || 
                   localStorage.getItem('token') || 
                   sessionStorage.getItem('authToken');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('정책 조회에 실패했습니다.');
      }

      const data = await response.json();
      setPolicies(data.data?.policies || []);
    } catch (err) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 고급 검색
  const handleSearch = async (filters) => {
    await fetchPolicies(filters);
  };

  // 검색 초기화
  const handleClearSearch = () => {
    fetchPolicies();
  };

  // 상태별 색상
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 우선순위별 색상
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>로그인 페이지로 이동 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">정책 목록</h1>
                <p className="text-gray-600">등록된 정책을 검색하고 관리하세요</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  대시보드
                </button>
                <button 
                  onClick={() => router.push('/policies/new')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  새 정책 등록
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 검색 컴포넌트 */}
        <PolicySearch onSearch={handleSearch} onClear={handleClearSearch} />

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">정책을 불러오는 중...</span>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-red-400">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    fetchPolicies();
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 정책 목록 */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md">
            {policies.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">정책이 없습니다</h3>
                <p className="mt-1 text-sm text-gray-500">
                  검색 조건을 변경하거나 새로운 정책을 등록해보세요.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/policies/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
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
                    {policies.map((policy) => (
                      <tr key={policy.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {policy.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {policy.document_id}
                            </div>
                            {policy.ai_tags && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {policy.ai_tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {tag}
                                  </span>
                                ))}
                                {policy.ai_tags.length > 3 && (
                                  <span className="text-xs text-gray-500">+{policy.ai_tags.length - 3}</span>
                                )}
                              </div>
                            )}
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
                            onClick={() => router.push(`/policies/${policy.id}`)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            보기
                          </button>
                          <button 
                            onClick={() => router.push(`/policies/${policy.id}/edit`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            수정
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
