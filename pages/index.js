import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // 자동으로 로그인 페이지로 리다이렉트
    router.push('/login')
  }, [router])

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
