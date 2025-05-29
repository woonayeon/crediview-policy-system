import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PolicyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [policy, setPolicy] = useState(null);
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
  }, [router]);

  // 정책 상세 정보 조회
  useEffect(() => {
    if (!id || !isAuthenticated) return;

    const fetchPolicy = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken') || 
                     localStorage.getItem('token') || 
                     sessionStorage.getItem('authToken');

        const response = await fetch(`/api/policies/${id}`, {
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
          throw new Error('정책을 불러올 수 없습니다.');
        }

        const data = await response.json();
        setPolicy(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [id, router, isAuthenticated]);

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
      <div className="flex justify-center items-center h-screen">
        <p>로그인 페이지로 이동 중...</p>
      </div>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">정책을 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800">오류 발생</h3>
            <p className="text-red-700 mt-2">{error}</p>
            <div className="mt-4">
              <button
                onClick={() => router.push('/policies')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                정책 목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 정책이 없는 경우
  if (!policy) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">정책을 찾을 수 없습니다</h3>
            <p className="text-gray-600 mt-2">요청하신 정책이 존재하지 않거나 삭제되었습니다.</p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/policies')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                정책 목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
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
                <h1 className="text-2xl font-bold text-gray-900">정책 상세보기</h1>
                <p className="text-gray-600">{policy.document_id}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => router.push('/policies')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  목록으로
                </button>
                <button 
                  onClick={() => router.push(`/policies/${id}/edit`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  수정하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 정책 상세 내용 */}
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 정책 헤더 정보 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{policy.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>상태:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                      {policy.status === 'active' ? '활성' :
                       policy.status === 'pending' ? '대기' :
                       policy.status === 'expired' ? '만료' : '초안'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>우선순위:</span>
                    <span className={`font-medium ${getPriorityColor(policy.priority)}`}>
                      {policy.priority === 'high' ? '높음' :
                       policy.priority === 'medium' ? '보통' : '낮음'}
                    </span>
                  </div>
                  <div>
                    <span>담당 부서: </span>
                    <span className="font-medium">{policy.department_owner}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI 분석 결과 */}
          {policy.ai_summary && (
            <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">AI 요약</h3>
              <p className="text-blue-800">{policy.ai_summary}</p>
              
              {policy.ai_tags && policy.ai_tags.length > 0 && (
                <div className="mt-3">
                  <span className="text-sm font-medium text-blue-800">태그: </span>
                  <div className="inline-flex flex-wrap gap-1 mt-1">
                    {policy.ai_tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 정책 내용 */}
          <div className="px-6 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">정책 내용</h3>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {policy.content}
              </div>
            </div>
          </div>

          {/* 정책 메타데이터 */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">등록일:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(policy.created_at).toLocaleString('ko-KR')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">수정일:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(policy.updated_at).toLocaleString('ko-KR')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">버전:</span>
                <span className="ml-2 text-gray-600">v{policy.version}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">승인 상태:</span>
                <span className="ml-2 text-gray-600">
                  {policy.approval_status === 'approved' ? '승인됨' :
                   policy.approval_status === 'pending' ? '승인 대기' : '승인 거부'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
