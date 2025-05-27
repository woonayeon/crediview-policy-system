import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [policies, setPolicies] = useState([])
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    draftPolicies: 0,
    recentPolicies: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    checkAuth()
    loadData()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token')
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
        localStorage.removeItem('auth_token')
        router.push('/login')
      }
    } catch (error) {
      console.error('인증 확인 오류:', error)
      router.push('/login')
    }
  }

  const loadData = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) return

    try {
      // 통계 로드
      const statsResponse = await fetch('/api/policies/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.data)
      }

      // 정책 목록 로드
      const policiesResponse = await fetch('/api/policies?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (policiesResponse.ok) {
        const policiesData = await policiesResponse.json()
        setPolicies(policiesData.data.policies || [])
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    router.push('/login')
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // 검색어가 없으면 원래 목록으로 복원
      loadData()
      return
    }

    setSearchLoading(true)
    const token = localStorage.getItem('auth_token')
    
    try {
      const response = await fetch('/api/policies/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: searchQuery,
          searchType: 'keyword',
          limit: 20
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPolicies(data.data.results || [])
        
        if (data.data.results.length === 0) {
          alert(`"${searchQuery}"에 대한 검색 결과가 없습니다.`)
        }
      } else {
        console.error('검색 응답 오류:', response.status)
        alert('검색 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('검색 오류:', error)
      alert('검색 중 오류가 발생했습니다.')
    } finally {
      setSearchLoading(false)
    }
  }

  const handlePolicyClick = async (policy) => {
    const token = localStorage.getItem('auth_token')
    
    try {
      // 정책 상세 정보 로드
      const response = await fetch(`/api/policies/${policy.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSelectedPolicy(data.data)
        setShowModal(true)
      } else {
        // API가 없으면 기본 정보로 모달 표시
        setSelectedPolicy(policy)
        setShowModal(true)
      }
    } catch (error) {
      // 오류 시에도 기본 정보 표시
      setSelectedPolicy(policy)
      setShowModal(true)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedPolicy(null)
  }

  const clearSearch = () => {
    setSearchQuery('')
    loadData()
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
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    button: {
      padding: '0.5rem 1rem',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    logoutButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    main: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#3b82f6'
    },
    statLabel: {
      color: '#6b7280',
      fontSize: '0.875rem'
    },
    searchSection: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    },
    searchContainer: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem'
    },
    searchInput: {
      flex: 1,
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '1rem'
    },
    searchButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    clearButton: {
      padding: '0.75rem 1rem',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    policySection: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    policyItem: {
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    policyItemHover: {
      backgroundColor: '#f9fafb'
    },
    policyTitle: {
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    policyMeta: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    loading: {
      textAlign: 'center',
      padding: '2rem',
      color: '#6b7280'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      borderRadius: '12px',
      fontWeight: '500'
    },
    badgeActive: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    badgeDraft: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    // 모달 스타일
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '2rem',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflow: 'auto',
      margin: '1rem'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '0'
    },
    modalContent: {
      whiteSpace: 'pre-wrap',
      lineHeight: '1.6',
      color: '#374151'
    },
    modalMeta: {
      backgroundColor: '#f9fafb',
      padding: '1rem',
      borderRadius: '4px',
      marginBottom: '1rem',
      fontSize: '0.875rem',
      color: '#6b7280'
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div>시스템을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <header style={styles.header}>
        <h1 style={styles.title}>크레디뷰 AI정책관리시스템</h1>
        <div style={styles.userInfo}>
          <span>{user?.name} ({user?.department})</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            로그아웃
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {/* 통계 카드 */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.totalPolicies}</div>
            <div style={styles.statLabel}>전체 정책</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statNumber, color: '#10b981'}}>{stats.activePolicies}</div>
            <div style={styles.statLabel}>활성 정책</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statNumber, color: '#f59e0b'}}>{stats.draftPolicies}</div>
            <div style={styles.statLabel}>승인 대기</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statNumber, color: '#8b5cf6'}}>{stats.recentPolicies}</div>
            <div style={styles.statLabel}>최근 생성</div>
          </div>
        </div>

        {/* 검색 섹션 */}
        <div style={styles.searchSection}>
          <h2>🔍 정책 검색</h2>
          <p style={{color: '#6b7280', marginBottom: '1rem'}}>
            정책 제목이나 내용의 키워드를 입력하여 검색하세요
          </p>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="정책을 검색하세요... (예: 비밀번호, 채번, 시스템)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={styles.searchInput}
            />
            <button 
              onClick={handleSearch} 
              disabled={searchLoading}
              style={styles.searchButton}
            >
              {searchLoading ? '검색 중...' : '검색'}
            </button>
            <button onClick={clearSearch} style={styles.clearButton}>
              전체보기
            </button>
          </div>
        </div>

        {/* 정책 목록 */}
        <div style={styles.policySection}>
          <h2>정책 목록 ({policies.length}개)</h2>
          {policies.length > 0 ? (
            <div>
              {policies.map((policy, index) => (
                <div 
                  key={policy.id || index} 
                  style={styles.policyItem}
                  onClick={() => handlePolicyClick(policy)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <div style={styles.policyTitle}>{policy.title}</div>
                  <div style={styles.policyMeta}>
                    문서 ID: {policy.document_id || policy.documentId || 'N/A'}
                  </div>
                  {policy.ai_summary && (
                    <div style={{...styles.policyMeta, marginTop: '0.5rem', color: '#3b82f6'}}>
                      🤖 AI 요약: {policy.ai_summary}
                    </div>
                  )}
                  <div style={{...styles.policyMeta, marginTop: '0.5rem'}}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(policy.status === 'active' ? styles.badgeActive : styles.badgeDraft)
                      }}
                    >
                      {policy.status === 'active' ? '활성' : '초안'}
                    </span>
                    <span style={{marginLeft: '1rem'}}>
                      {policy.department_owner || policy.departmentOwner} • {new Date(policy.created_at || policy.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.loading}>
              {searchQuery ? `"${searchQuery}"에 대한 검색 결과가 없습니다.` : '등록된 정책이 없습니다.'}
            </div>
          )}
        </div>
      </main>

      {/* 정책 상세보기 모달 */}
      {showModal && selectedPolicy && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedPolicy.title}</h2>
              <button onClick={closeModal} style={styles.closeButton}>×</button>
            </div>
            
            <div style={styles.modalMeta}>
              <div><strong>문서 ID:</strong> {selectedPolicy.document_id || selectedPolicy.documentId}</div>
              <div><strong>담당 부서:</strong> {selectedPolicy.department_owner || selectedPolicy.departmentOwner}</div>
              <div><strong>상태:</strong> {selectedPolicy.status === 'active' ? '활성' : '초안'}</div>
              <div><strong>생성일:</strong> {new Date(selectedPolicy.created_at || selectedPolicy.createdAt).toLocaleDateString('ko-KR')}</div>
              {selectedPolicy.ai_summary && (
                <div><strong>🤖 AI 요약:</strong> {selectedPolicy.ai_summary}</div>
              )}
            </div>
            
            <div style={styles.modalContent}>
              {selectedPolicy.content || '내용이 없습니다.'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
