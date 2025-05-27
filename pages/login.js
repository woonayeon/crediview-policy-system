import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (data.success) {
        localStorage.setItem('auth_token', data.token)
        router.push('/dashboard')
      } else {
        setError(data.message || '로그인에 실패했습니다.')
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: 'Arial, sans-serif'
    },
    form: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '1.5rem',
      color: '#1f2937'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      marginBottom: '1rem',
      fontSize: '1rem',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '0.75rem',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      cursor: 'pointer',
      marginTop: '1rem'
    },
    buttonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    error: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      padding: '0.75rem',
      borderRadius: '4px',
      marginBottom: '1rem',
      fontSize: '0.875rem'
    },
    link: {
      display: 'block',
      textAlign: 'center',
      marginTop: '1rem',
      color: '#3b82f6',
      textDecoration: 'none'
    },
    info: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      padding: '1rem',
      borderRadius: '4px',
      marginTop: '1rem',
      fontSize: '0.875rem'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <h1 style={styles.title}>크레디뷰 로그인</h1>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="이메일을 입력하세요"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <a href="/signup" style={styles.link}>
          회원가입
        </a>

        <div style={styles.info}>
          <strong>테스트 계정:</strong><br/>
          이메일: test@company.com<br/>
          비밀번호: test123456
        </div>
      </div>
    </div>
  )
}
