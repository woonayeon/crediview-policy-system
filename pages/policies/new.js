```jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PolicyRegistrationForm from '../../components/PolicyRegistrationForm';

export default function NewPolicyPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  }, [router]);

  // 로딩 중
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>페이지를 불러오는 중...</p>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">새 정책 등록</h1>
                <p className="text-gray-600">AI가 자동으로 구조화하여 저장합니다</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  대시보드
                </button>
                <button 
                  onClick={() => router.push('/policies')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  정책 목록
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 등록 폼 */}
      <div className="py-6">
        <PolicyRegistrationForm />
      </div>
    </div>
  );
}
```