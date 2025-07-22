import { aiUtils } from '../../../lib/openai'
import jwt from 'jsonwebtoken'

function authenticateToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('인증 토큰이 없습니다.')
  }
  const token = authHeader.substring(7)
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'crediview-secret-key')
  return decoded
}

export default function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    authenticateToken(req)
    const stats = aiUtils.getUsageStats()
    res.status(200).json({ success: true, data: stats })
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: '인증이 필요합니다.' })
    }
    console.error('AI 사용량 조회 오류:', error)
    res.status(500).json({ success: false, message: 'AI 사용량 정보를 가져오는 중 오류가 발생했습니다.' })
  }
}
