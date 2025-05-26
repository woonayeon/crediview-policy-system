import '../styles/globals.css'
import { useState, useEffect } from 'react'

// 전역 상태 관리를 위한 간단한 Context
import { createContext, useContext } from 'react'

const AppContext = createContext()

export function useAppContext() {
  return useContext(AppContext)
}

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 로그인 상태 확인
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        } else {
          localStorage.removeItem('auth_token')
        }
      }
    } catch (error) {
      console.error('인증 확인 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      if (data.success) {
        localStorage.setItem('auth_token', data.token)
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      return { success: false, message: '로그인 중 오류가 발생했습니다.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    window.location.href = '/login'
  }

  const signup = async (userData) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return { success: false, message: '회원가입 중 오류가 발생했습니다.' }
    }
  }

  const contextValue = {
    user,
    login,
    logout,
    signup,
    loading,
    isAuthenticated: !!user
  }

  // 로딩 중일 때 표시할 화면
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">시스템을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        <Component {...pageProps} />
      </div>
    </AppContext.Provider>
  )
}
