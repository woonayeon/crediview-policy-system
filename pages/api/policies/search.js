import jwt from 'jsonwebtoken'
import { searchHelpers } from '../../../lib/supabase'

// 인증 미들웨어
function authenticateToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('인증 토큰이 없습니다.')
  }

  const token = authHeader.substring(7)
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'crediview-secret-key')
  return decoded
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    // 인증 확인
    const user = authenticateToken(req)

    const { 
      query, 
      searchType = 'combined',
      department = '',
      status = '',
      limit = 20 
    } = req.body

    // 입력 검증
    if (!query || query.trim().length < 1) {
      return res.status(400).json({
        success: false,
        message: '검색어를 입력해주세요.'
      })
    }

    const searchQuery = query.trim()
    const searchOptions = {
      department: department || undefined,
      status: status || undefined,
      limit: Math.min(50, Math.max(1, parseInt(limit)))
    }

    console.log(`검색 실행: "${searchQuery}" (${searchType})`)

    let results = []

    // 현재는 키워드 검색만 구현 (의미적 검색은 향후 추가)
    if (searchType === 'keyword' || searchType === 'combined') {
      const searchResult = await searchHelpers.searchPolicies(searchQuery, searchOptions)
      
      if (searchResult.success) {
        results = searchResult.results
      }
    }

    // 검색 히스토리 저장 (에러가 나도 검색 결과는 반환)
    try {
      await searchHelpers.saveSearchHistory(
        user.userId,
        searchQuery,
        searchType,
        results.length
      )
    } catch (historyError) {
      console.error('검색 히스토리 저장 실패:', historyError)
    }

    res.status(200).json({
      success: true,
      data: {
        query: searchQuery,
        searchType,
        results,
        count: results.length
      }
    })

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      })
    }

    console.error('검색 오류:', error)
    res.status(500).json({
      success: false,
      message: '검색 중 오류가 발생했습니다.'
    })
  }
}
