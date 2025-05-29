import jwt from 'jsonwebtoken'
import { policyHelpers } from '../../../lib/supabase'

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
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    // 인증 확인
    const user = authenticateToken(req)

    // 통계 데이터 조회
    const statsResult = await policyHelpers.getStats()

    if (!statsResult.success) {
      return res.status(400).json({
        success: false,
        message: statsResult.error
      })
    }

    res.status(200).json({
      success: true,
      data: statsResult.stats
    })

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      })
    }

    console.error('통계 조회 오류:', error)
    res.status(500).json({
      success: false,
      message: '통계 조회 중 오류가 발생했습니다.'
    })
  }
}
