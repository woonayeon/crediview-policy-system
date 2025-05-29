import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authHelpers } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    const { email, password } = req.body

    // 입력 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요.'
      })
    }

    // 사용자 조회
    const userResult = await authHelpers.getUserByEmail(email)
    
    if (!userResult.success) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      })
    }

    const user = userResult.user

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      })
    }

    // JWT 토큰 생성
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      department: user.department,
      role: user.role
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'crediview-secret-key',
      { expiresIn: '7d' }
    )

    // 응답 (비밀번호 해시 제외)
    const { password_hash, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      message: '로그인 성공',
      token,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('로그인 오류:', error)
    res.status(500).json({
      success: false,
      message: '로그인 처리 중 오류가 발생했습니다.'
    })
  }
}
