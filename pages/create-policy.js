import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function CreatePolicy() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    departmentOwner: '기획팀',
    priority: 'medium'
  })
  const [loading, setLoading] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)
  const [error, setError] = useState('')
  const [aiPreview, setAiPreview] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleAiPreview = async () => {
    if (!formData.title || !formData.content) {
      setError('제목과 내용을 입력해주세요.')
      return
    }

    setAiProcessing(true)
    setError('')

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/ai/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAiPreview(data.data)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'AI 분석 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('AI 미리보기 오류:', error)
      setError('AI 분석 중 오류가 발생했습니다.')
    } finally {
      setAiProcessing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      setError('제목과 내용을 입력해주세요.')
      return
    }

    if (formData.title.length < 5) {
      setError('제목은 5자 이상 입력해주세요.')
      return
    }

    if (formData.content.length < 20) {
      setError('내용은 20자 이상 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        alert('정책이 성공적으로 생성되었습니다!')
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        setError(errorData.message || '정책 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('정책 생성 오류:', error)
      setError('정책 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      backgroundColor: 'white',
      padding: '1rem 2rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    backButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block'
    },
    main: {
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    },
    form: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '1rem',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '1rem',
      boxSizing: 'border-box',
      minHeight: '200px',
      resize: 'vertical'
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '1rem',
      boxSizing: 'border-box'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem'
    },
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    secondaryButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    error: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      padding: '0.75rem',
      borderRadius: '4px',
      marginBottom: '1rem',
      fontSize: '0.875rem'
    },
    aiPreview: {
      backgroundColor: '#f0f9ff',
      border: '1px solid #bfdbfe',
      borderRadius: '8px',
      padding: '1.5rem',
      marginTop: '1rem'
    },
    aiTitle: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#1e40af',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    aiSection: {
      marginBottom: '1rem'
    },
    aiLabel: {
      fontWeight: '600',
      color: '#1e40af',
      marginBottom: '0.5rem'
    },
    aiContent: {
      color: '#1f2937',
      lineHeight: '1.5'
    },
    tagList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    tag: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.875rem'
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#6b7280'
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid #f3f3f3',
      borderTop: '2px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  }

  return (
    <div style={styles.container}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* 헤더 */}
      <header style={styles.header}>
        <h1 style={styles.title}>새 정책 생성</h1>
        <a href="/dashboard" style={styles.backButton}>
          ← 대시보드로 돌아가기
        </a>
      </header>

      <main style={styles.main}>
        <div style={styles.form}>
          <h2 style={{marginBottom: '1.5rem', color: '#1f2937'}}>🤖 AI 기반 정책 생성</h2>
          
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="title">
                정책 제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="정책 제목을 입력하세요 (예: 비밀번호 보안 정책)"
                style={styles.input}
                required
              />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="departmentOwner">
                  담당 부서
                </label>
                <select
                  id="departmentOwner"
                  name="departmentOwner"
                  value={formData.departmentOwner}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="기획팀">기획팀</option>
                  <option value="운영팀">운영팀</option>
                  <option value="개발팀">개발팀</option>
                  <option value="정책관리팀">정책관리팀</option>
                  <option value="디지털솔루션팀">디지털솔루션팀</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="priority">
                  우선순위
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="high">높음</option>
                  <option value="medium">보통</option>
                  <option value="low">낮음</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="content">
                정책 내용 *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="정책 내용을 상세히 입력하세요. AI가 자동으로 분석하여 구조화합니다."
                style={styles.textarea}
                required
              />
              <div style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem'}}>
                💡 팁: 구체적인 규칙, 절차, 기준 등을 포함하여 작성하면 AI가 더 정확하게 분석합니다.
              </div>
            </div>

            {/* AI 미리보기 */}
            {aiPreview && (
              <div style={styles.aiPreview}>
                <div style={styles.aiTitle}>
                  🤖 AI 분석 결과
                </div>
                
                {aiPreview.summary && (
                  <div style={styles.aiSection}>
                    <div style={styles.aiLabel}>📋 요약</div>
                    <div style={styles.aiContent}>{aiPreview.summary}</div>
                  </div>
                )}
                
                {aiPreview.tags && aiPreview.tags.length > 0 && (
                  <div style={styles.aiSection}>
                    <div style={styles.aiLabel}>🏷️ 추출된 태그</div>
                    <div style={styles.tagList}>
                      {aiPreview.tags.map((tag, index) => (
                        <span key={index} style={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {aiPreview.category && (
                  <div style={styles.aiSection}>
                    <div style={styles.aiLabel}>📁 분류</div>
                    <div style={styles.aiContent}>{aiPreview.category}</div>
                  </div>
                )}
              </div>
            )}

            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleAiPreview}
                disabled={aiProcessing || !formData.title || !formData.content}
                style={styles.secondaryButton}
              >
                {aiProcessing ? (
                  <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    AI 분석 중...
                  </div>
                ) : (
                  '🤖 AI 미리보기'
                )}
              </button>
              
              <button
                type="submit"
                disabled={loading}
                style={styles.button}
              >
                {loading ? (
                  <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    생성 중...
                  </div>
                ) : (
                  '정책 생성'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
