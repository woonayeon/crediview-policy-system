import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
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
    )
  }

  // 인증되지 않은 경우 (리다이렉트 중)
  if (!isAuthenticated) {
    return (
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
    )
  }

  // 인증된 경우 대시보드 표시
  return <PolicyDashboard />
}
```
