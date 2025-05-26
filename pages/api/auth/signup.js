import bcrypt from 'bcryptjs'
import { authHelpers } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    const { name, email, password, department } = req.body

    // 입력 검증
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '모든 필드를 입력해주세요.'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 8자리 이상이어야 합니다.'
      })
    }

    // 이메일 중복 확인
    const existingUser = await authHelpers.getUserByEmail(email)
    if (existingUser.success) {
      return res.status(409).json({
        success: false,
        message: '이미 사용 중인 이메일입니다.'
      })
    }

    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(password, 12)

    // 사용자 생성
    const userResult = await authHelpers.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      department: department || '기획팀'
    })

    if (!userResult.success) {
      return res.status(400).json({
        success: false,
        message: userResult.error || '회원가입 처리 중 오류가 발생했습니다.'
      })
    }

    // 성공 응답 (비밀번호 해시 제외)
    const { password_hash, ...userWithoutPassword } = userResult.user

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('회원가입 오류:', error)
    res.status(500).json({
      success: false,
      message: '회원가입 처리 중 오류가 발생했습니다.'
    })
  }
}
