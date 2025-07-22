
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Home, 
  FileText, 
  Plus, 
  BarChart3,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell
} from 'lucide-react';

const Navigation = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState(3); // 알림 개수 (임시)

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  const navigationItems = [
    {
      name: '대시보드',
      href: '/',
      icon: Home,
      current: router.pathname === '/'
    },
    {
      name: '정책 목록',
      href: '/policies',
      icon: FileText,
      current: router.pathname === '/policies'
    },
    {
      name: '새 정책',
      href: '/policies/new',
      icon: Plus,
      current: router.pathname === '/policies/new'
    },
    {
      name: '분석',
      href: '/analytics',
      icon: BarChart3,
      current: router.pathname === '/analytics'
    },
    {
      name: 'AI 사용량',
      href: '/usage',
      icon: Activity,
      current: router.pathname === '/usage'
    }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 로고 및 메인 네비게이션 */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  크레디뷰 정책관리
                </span>
              </div>
            </div>
            
            {/* 데스크톱 네비게이션 */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      item.current
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 우측 메뉴 */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* 검색 버튼 */}
            <button
              onClick={() => router.push('/policies?search=true')}
              className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* 알림 버튼 */}
            <button className="p-2 text-gray-400 hover:text-gray-500 relative transition-colors">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* 사용자 메뉴 */}
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">관</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">로그아웃</span>
                </button>
              </div>
            </div>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium transition-colors ${
                    item.current
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </div>
          
          {/* 모바일 사용자 섹션 */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">관리자</span>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">관리자</div>
                <div className="text-sm text-gray-500">admin@crediview.com</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
```

### 저장하기:
1. 커밋 메시지: "Add responsive navigation component"
2. "Commit new file" 버튼 클릭

---

## 🔧 19단계: 레이아웃 컴포넌트 생성

이제 모든 페이지에서 네비게이션을 사용할 수 있도록 레이아웃 컴포넌트를 만들어보겠습니다.

### GitHub에서 새 파일 만들기:

1. **"Add file" 버튼** 클릭 → **"Create new file" 선택**
2. **파일 이름**: `components/Layout.tsx`

### 파일 내용:

```tsx
import { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

const Layout = ({ children, showNavigation = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && <Navigation />}
      <main className={showNavigation ? '' : 'min-h-screen'}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
```

### 저장하기:
1. 커밋 메시지: "Add layout component with navigation"
2. "Commit new file" 버튼 클릭

---

## 🎯 20단계: 메인 페이지에 레이아웃 적용

마지막으로 메인 페이지에 레이아웃을 적용해보겠습니다.

### GitHub에서 파일 수정하기:

1. **`pages/index.js`** 파일 클릭
2. **✏️ (연필 모양) 버튼** 클릭
3. **기존 내용을 모두 지우고** 아래 코드로 교체:

```jsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import PolicyDashboard from '../components/PolicyDashboard'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 인증 확인 로직 (토큰 체크 등)
    const checkAuthentication = () => {
      try {
        // 여러 방법으로 토큰 확인
        const token = localStorage.getItem('authToken') || 
                     localStorage.getItem('token') || 
                     sessionStorage.getItem('authToken')
        
        if (token) {
          // 토큰이 있으면 인증됨으로 처리
          setIsAuthenticated(true)
          setLoading(false)
        } else {
          // 토큰이 없으면 로그인 페이지로 리다이렉트
          router.push('/login')
        }
      } catch (error) {
        console.error('인증 확인 오류:', error)
        router.push('/login')
      }
    }

    checkAuthentication()
  }, [router])

  // 로딩 중 화면
  if (loading) {
    return (
      <Layout showNavigation={false}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '15px'
            }}></div>
            <h1 style={{ margin: 0, color: '#333' }}>크레디뷰 정책 관리 시스템</h1>
          </div>
          <p style={{ color: '#666', fontSize: '16px' }}>시스템을 불러오는 중...</p>
          
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </Layout>
    )
  }

  // 인증되지 않은 경우 (리다이렉트 중)
  if (!isAuthenticated) {
    return (
      <Layout showNavigation={false}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1>크레디뷰 정책 관리 시스템</h1>
          <p>로그인 페이지로 이동 중...</p>
          <a href="/login" style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px',
            marginTop: '20px'
          }}>
            로그인 페이지로 이동
          </a>
        </div>
      </Layout>
    )
  }

  // 인증된 경우 대시보드 표시
  return (
    <Layout>
      <PolicyDashboard />
    </Layout>
  )
}
```
