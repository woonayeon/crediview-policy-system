import { useEffect, useState } from 'react'
import Navigation from '../components/Navigation'

export default function UsagePage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('authToken') ||
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('authToken')
    if (!token) {
      window.location.href = '/login'
      return
    }
    fetch('/api/ai/usage', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data)
        } else {
          setError(data.message || '데이터를 불러올 수 없습니다.')
        }
      })
      .catch(err => {
        console.error('사용량 조회 오류:', err)
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">AI 사용 현황</h1>
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <p>오늘 사용량: {stats.dailyUsed} / {stats.dailyLimit}</p>
          <p>남은 사용 가능 횟수: {stats.remaining}</p>
          <p>초기화 예정일: {stats.resetTime}</p>
        </div>
      </div>
    </div>
  )
}
