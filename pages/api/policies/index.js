import jwt from 'jsonwebtoken'
import { policyHelpers } from '../../../lib/supabase'
import { aiService } from '../../../lib/openai'

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

// 문서 ID 생성
function generateDocumentId(categoryCode = 'GN') {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  return `CV-${categoryCode}-${dateStr}-${randomNum}`
}

export default async function handler(req, res) {
  try {
    // 인증 확인
    const user = authenticateToken(req)

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, user)
      case 'POST':
        return await handlePost(req, res, user)
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
      message: '서버 오류가 발생했습니다.'
    })
  }
}

// 정책 목록 조회
async function handleGet(req, res, user) {
  try {
    const { 
      page = '1', 
      limit = '20', 
      search = '', 
      status = '', 
      department = '',
      sortBy = 'updated_at',
      sortOrder = 'desc'
    } = req.query

    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const offset = (pageNum - 1) * limitNum

    const options = {
      search: search.trim(),
      status: status || undefined,
      department: department || undefined,
      sortBy,
      sortOrder,
      limit: limitNum,
      offset
    }

    const result = await policyHelpers.getPolicies(options)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    // 전체 개수 조회 (페이징용)
    const totalResult = await policyHelpers.getPolicies({ ...options, limit: null, offset: null })
    const totalCount = totalResult.success ? totalResult.policies.length : 0
    const totalPages = Math.ceil(totalCount / limitNum)

    res.status(200).json({
      success: true,
      data: {
        policies: result.policies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    })

  } catch (error) {
    console.error('정책 목록 조회 오류:', error)
    res.status(500).json({
      success: false,
      message: '정책 목록을 불러오는 중 오류가 발생했습니다.'
    })
  }
}

// 정책 생성
async function handlePost(req, res, user) {
  try {
    const { title, content, priority = 'medium', departmentOwner = '기획팀' } = req.body

    // 입력 검증
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '제목과 내용을 입력해주세요.'
      })
    }

    if (title.length < 2) {
      return res.status(400).json({
        success: false,
        message: '제목은 2자 이상이어야 합니다.'
      })
    }

    if (content.length < 10) {
      return res.status(400).json({
        success: false,
        message: '내용은 10자 이상이어야 합니다.'
      })
    }

    console.log(`새 정책 생성 시작: ${title}`)

    // AI 처리 실행
    let aiResults = {
      structure: null,
      summary: null,
      tags: [],
      success: false
    }

    try {
      aiResults = await aiService.processPolicy(content, title)
      console.log('AI 처리 결과:', aiResults)
    } catch (aiError) {
      console.error('AI 처리 오류:', aiError)
      // AI 처리 실패해도 정책 생성은 계속 진행
      aiResults.tags = aiService.extractLocalTags(content, title) // 로컬 태그 추출
    }

    // 정책 데이터 준비
    const documentId = generateDocumentId()
    const policyData = {
      document_id: documentId,
      title: title.trim(),
      content: content.trim(),
      ai_structure: aiResults.structure ? JSON.stringify(aiResults.structure) : null,
      ai_summary: aiResults.summary,
      ai_tags: aiResults.tags.length > 0 ? aiResults.tags : null,
      status: 'draft',
      priority,
      department_owner: departmentOwner,
      author_id: user.userId,
      approval_status: 'pending',
      version: 1
    }

    // 데이터베이스에 저장
    const result = await policyHelpers.createPolicy(policyData)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      })
    }

    console.log(`정책 생성 완료: ${documentId}`)

    // 성공 응답
    res.status(201).json({
      success: true,
      message: '정책이 성공적으로 생성되었습니다.',
      data: {
        ...result.policy,
        aiProcessed: aiResults.success,
        aiTokensUsed: aiResults.totalTokensUsed || 0
      }
    })

  } catch (error) {
    console.error('정책 생성 오류:', error)
    res.status(500).json({
      success: false,
      message: '정책 생성 중 오류가 발생했습니다.'
    })
  }
}
