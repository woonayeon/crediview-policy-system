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
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // 인증 확인
    const user = authenticateToken(req)
    const { id } = req.query

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '정책 ID가 필요합니다.'
      })
    }

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, user, id)
      case 'PUT':
        return await handlePut(req, res, user, id)
      case 'DELETE':
        return await handleDelete(req, res, user, id)
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        })
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      })
    }

    console.error('정책 API 오류:', error)
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      details: error.message
    })
  }
}

// 정책 상세 조회
async function handleGet(req, res, user, id) {
  try {
    console.log(`정책 상세 조회: ${id}`)

    // policyHelpers가 없을 경우를 대비한 직접 구현
    const result = await getPolicyById(id)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error || '정책을 찾을 수 없습니다.'
      })
    }

    // 조회수 증가 (선택적)
    try {
      await incrementViews(id)
    } catch (viewError) {
      console.error('조회수 증가 오류:', viewError)
      // 조회수 증가 실패는 전체 요청을 실패시키지 않음
    }

    return res.status(200).json({
      success: true,
      data: result.policy
    })

  } catch (error) {
    console.error('정책 조회 오류:', error)
    return res.status(500).json({
      success: false,
      message: '정책 조회 중 오류가 발생했습니다.',
      details: error.message
    })
  }
}

// 정책 수정
async function handlePut(req, res, user, id) {
  try {
    const { title, content, priority, status } = req.body

    if (!title && !content && !priority && !status) {
      return res.status(400).json({
        success: false,
        message: '수정할 내용이 없습니다.'
      })
    }

    console.log(`정책 수정: ${id}`)

    const updateData = {
      updated_at: new Date().toISOString()
    }
    
    if (title) updateData.title = title.trim()
    if (content) updateData.content = content.trim()
    if (priority) updateData.priority = priority
    if (status) updateData.status = status

    const result = await updatePolicy(id, updateData)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || '정책 수정에 실패했습니다.'
      })
    }

    return res.status(200).json({
      success: true,
      message: '정책이 성공적으로 수정되었습니다.',
      data: result.policy
    })

  } catch (error) {
    console.error('정책 수정 오류:', error)
    return res.status(500).json({
      success: false,
      message: '정책 수정 중 오류가 발생했습니다.',
      details: error.message
    })
  }
}

// 정책 삭제
async function handleDelete(req, res, user, id) {
  try {
    console.log(`정책 삭제: ${id}`)

    const result = await deletePolicy(id)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || '정책 삭제에 실패했습니다.'
      })
    }

    return res.status(200).json({
      success: true,
      message: '정책이 성공적으로 삭제되었습니다.'
    })

  } catch (error) {
    console.error('정책 삭제 오류:', error)
    return res.status(500).json({
      success: false,
      message: '정책 삭제 중 오류가 발생했습니다.',
      details: error.message
    })
  }
}

// 직접 구현된 데이터베이스 헬퍼 함수들
async function getPolicyById(id) {
  try {
    // policyHelpers를 사용할 수 있다면 사용
    if (typeof policyHelpers !== 'undefined' && policyHelpers.getPolicyById) {
      return await policyHelpers.getPolicyById(id)
    }

    // 직접 Supabase 클라이언트 사용 (fallback)
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    const { data, error } = await supabase
      .from('policies')
      .select(`
        *,
        users!policies_created_by_fkey(name, email, department)
      `)
      .eq('id', id)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      policy: data
    }

  } catch (error) {
    console.error('getPolicyById 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function updatePolicy(id, updateData) {
  try {
    // policyHelpers를 사용할 수 있다면 사용
    if (typeof policyHelpers !== 'undefined' && policyHelpers.updatePolicy) {
      return await policyHelpers.updatePolicy(id, updateData)
    }

    // 직접 Supabase 클라이언트 사용 (fallback)
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    const { data, error } = await supabase
      .from('policies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      policy: data
    }

  } catch (error) {
    console.error('updatePolicy 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function deletePolicy(id) {
  try {
    // policyHelpers를 사용할 수 있다면 사용
    if (typeof policyHelpers !== 'undefined' && policyHelpers.deletePolicy) {
      return await policyHelpers.deletePolicy(id)
    }

    // 직접 Supabase 클라이언트 사용 (fallback)
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true
    }

  } catch (error) {
    console.error('deletePolicy 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function incrementViews(id) {
  try {
    // policyHelpers를 사용할 수 있다면 사용
    if (typeof policyHelpers !== 'undefined' && policyHelpers.incrementViews) {
      return await policyHelpers.incrementViews(id)
    }

    // 직접 Supabase 클라이언트 사용 (fallback)
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    // 현재 조회수 가져오기
    const { data: currentData } = await supabase
      .from('policies')
      .select('views')
      .eq('id', id)
      .single()

    const currentViews = currentData?.views || 0

    // 조회수 1 증가
    const { error } = await supabase
      .from('policies')
      .update({ views: currentViews + 1 })
      .eq('id', id)

    if (error) {
      throw error
    }

    return { success: true }

  } catch (error) {
    console.error('incrementViews 오류:', error)
    return { success: false, error: error.message }
  }
}
```
