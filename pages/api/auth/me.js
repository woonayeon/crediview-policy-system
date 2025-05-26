import jwt from 'jsonwebtoken'
import { authHelpers } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 없습니다.'
      })
    }

    const token = authHeader.substring(7) // 'Bearer ' 제거

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'crediview-secret-key')
    
    // 사용자 정보 조회 (최신 정보)
    const userResult = await authHelpers.getUserById(decoded.userId)
    
    if (!userResult.success) {
      return res.status(401).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      })
    }

    res.status(200).json({
      success: true,
      user: userResult.user
    })

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다.'
      })
    }

    console.error('사용자 정보 조회 오류:', error)
    res.status(500).json({
      success: false,
      message: '사용자 정보 조회 중 오류가 발생했습니다.'
    })
  }
}
