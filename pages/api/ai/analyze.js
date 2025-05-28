
```javascript
import jwt from 'jsonwebtoken'

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

// AI 분석 시뮬레이션 함수
function simulateAIAnalysis(content, title) {
  // 키워드 기반 카테고리 분류
  const keywords = {
    '보안정책': ['보안', '암호화', '접근', '권한', '인증', '방화벽', '바이러스'],
    '인사정책': ['인사', '채용', '평가', '급여', '휴가', '교육', '승진'],
    '재무정책': ['재무', '예산', '비용', '지출', '결산', '회계', '투자'],
    '운영정책': ['운영', '프로세스', '절차', '업무', '관리', '시스템'],
    '기술정책': ['기술', '개발', '시스템', 'IT', '소프트웨어', '하드웨어'],
    '법무정책': ['법무', '계약', '규정', '준수', '컴플라이언스', '감사']
  }

  let detectedCategory = '운영정책'
  let maxScore = 0

  const contentLower = (content + ' ' + title).toLowerCase()

  for (const [category, keywordList] of Object.entries(keywords)) {
    const score = keywordList.reduce((sum, keyword) => {
      const regex = new RegExp(keyword, 'gi')
      const matches = contentLower.match(regex)
      return sum + (matches ? matches.length : 0)
    }, 0)

    if (score > maxScore) {
      maxScore = score
      detectedCategory = category
    }
  }

  // 태그 추출
  const allKeywords = Object.values(keywords).flat()
  const detectedTags = allKeywords.filter(keyword => 
    contentLower.includes(keyword)
  ).slice(0, 5)

  // 핵심 포인트 추출 (간단한 문장 분리)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const keyPoints = sentences.slice(0, 3).map(s => s.trim())

  // 위험도 평가
  const riskKeywords = ['위험', '중요', '필수', '금지', '제한', '보안', '기밀']
  const riskScore = riskKeywords.reduce((sum, keyword) => {
    return sum + (contentLower.includes(keyword) ? 1 : 0)
  }, 0)

  const riskLevel = riskScore >= 3 ? 'high' : riskScore >= 1 ? 'medium' : 'low'

  return {
    category: detectedCategory,
    policyType: '규정',
    keyPoints: keyPoints.length > 0 ? keyPoints : ['정책의 핵심 내용을 정의합니다.'],
    tags: detectedTags.length > 0 ? detectedTags : ['일반', '정책'],
    businessArea: '전사',
    compliance: {
      isRequired: riskLevel === 'high',
      checkpoints: riskLevel === 'high' ? ['정기 검토 필요', '승인 필수'] : ['정기 검토 권장']
    },
    summary: `${title}에 대한 정책으로, ${detectedCategory} 영역의 주요 규정을 다룹니다.`,
    riskLevel: riskLevel,
    targetAudience: ['전체 직원'],
    effectiveScope: '전사'
  }
}

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    // 인증 확인
    const user = authenticateToken(req)

    const { content, title, analysisType = 'full' } = req.body

    if (!content) {
      return res.status(400).json({
        success: false,
        message: '분석할 내용이 필요합니다.'
      })
    }

    console.log(`AI 분석 요청: ${analysisType} - ${title}`)

    // AI 분석 실행
    const startTime = Date.now()
    const analysisResult = simulateAIAnalysis(content, title || '')
    const processingTime = Date.now() - startTime

    // 분석 타입에 따른 결과 조정
    let result = analysisResult
    if (analysisType === 'quick') {
      result = {
        category: analysisResult.category,
        tags: analysisResult.tags
      }
    } else if (analysisType === 'summary') {
      result = {
        summary: analysisResult.summary
      }
    }

    console.log(`AI 분석 완료: ${processingTime}ms`)

    return res.status(200).json({
      success: true,
      result: result,
      analysisType,
      processingTime,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      })
    }

    console.error('AI 분석 오류:', error)
    return res.status(500).json({
      success: false,
      message: 'AI 분석 중 오류가 발생했습니다.',
      details: error.message
    })
  }
}
```

### 저장하기:
1. 커밋 메시지: "Add AI analysis API endpoint compatible with existing system"
2. "Commit new file" 버튼 클릭

---

## 📄 18단계: 정책 상세보기 API 생성

이어서 정책 상세보기 API도 만들어보겠습니다.

### GitHub에서 새 파일 만들기:

1. **"Add file" 버튼** 클릭 → **"Create new file" 선택**
2. **파일 이름**: `pages/api/policies/[id].js`

### 파일 내용:

```javascript
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
      message: '서버 오류가 발생했습니다.'
    })
  }
}

// 정책 상세 조회
async function handleGet(req, res, user, id) {
  try {
    console.log(`정책 상세 조회: ${id}`)

    const result = await policyHelpers.getPolicyById(id)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: '정책을 찾을 수 없습니다.'
      })
    }

    // 조회수 증가
    await policyHelpers.incrementViews(id)

    return res.status(200).json({
      success: true,
      data: result.policy
    })

  } catch (error) {
    console.error('정책 조회 오류:', error)
    return res.status(500).json({
      success: false,
      message: '정책 조회 중 오류가 발생했습니다.'
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

    const updateData = {}
    if (title) updateData.title = title.trim()
    if (content) updateData.content = content.trim()
    if (priority) updateData.priority = priority
    if (status) updateData.status = status

    const result = await policyHelpers.updatePolicy(id, updateData)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
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
      message: '정책 수정 중 오류가 발생했습니다.'
    })
  }
}

// 정책 삭제
async function handleDelete(req, res, user, id) {
  try {
    console.log(`정책 삭제: ${id}`)

    const result = await policyHelpers.deletePolicy(id)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
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
      message: '정책 삭제 중 오류가 발생했습니다.'
    })
  }
}
```
