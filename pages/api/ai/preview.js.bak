import jwt from 'jsonwebtoken'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    const { title, content } = req.body

    // 입력 검증
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '제목과 내용을 입력해주세요.'
      })
    }

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-temp-will-add-later') {
      return res.status(200).json({
        success: true,
        data: {
          summary: `"${title}" 정책에 대한 AI 분석입니다. (OpenAI API 키가 설정되지 않아 더미 데이터를 표시합니다)`,
          tags: ['정책', '규칙', '관리', title.includes('비밀번호') ? '보안' : '시스템'],
          category: title.includes('비밀번호') ? '보안정책' : 
                   title.includes('채번') ? '채번규칙' : '시스템정책'
        }
      })
    }

    console.log(`AI 미리보기 요청: ${title}`)

    // OpenAI로 정책 분석
    const prompt = `다음 정책을 분석해주세요:

제목: ${title}
내용: ${content}

다음 형태로 JSON 응답해주세요:
{
  "summary": "정책의 핵심 내용을 2-3문장으로 요약",
  "tags": ["관련 태그 5개 이내"],
  "category": "정책 카테고리 (보안정책, 시스템정책, 업무규칙, 채번규칙 중 하나)"
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 기업 정책 분석 전문가입니다. 주어진 정책을 분석하여 요약, 태그, 카테고리를 JSON 형태로 제공합니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('AI 응답이 없습니다.')
    }

    // JSON 파싱
    let aiResult
    try {
      // JSON 부분만 추출
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('JSON 형태가 아닙니다.')
      }
    } catch (parseError) {
      // JSON 파싱 실패 시 기본값 제공
      console.error('JSON 파싱 오류:', parseError)
      aiResult = {
        summary: `${title}에 대한 정책입니다. AI 분석 중 오류가 발생했지만 정책 생성은 계속 진행됩니다.`,
        tags: ['정책', '규칙'],
        category: '시스템정책'
      }
    }

    res.status(200).json({
      success: true,
      data: aiResult
    })

  } catch (error) {
    console.error('AI 미리보기 오류:', error)
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      })
    }

    // OpenAI API 오류 처리
    if (error.code === 'invalid_api_key') {
      return res.status(400).json({
        success: false,
        message: 'OpenAI API 키가 올바르지 않습니다.'
      })
    }

    if (error.code === 'insufficient_quota') {
      return res.status(400).json({
        success: false,
        message: 'OpenAI API 사용량 한도를 초과했습니다.'
      })
    }

    res.status(500).json({
      success: false,
      message: 'AI 분석 중 오류가 발생했습니다.'
    })
  }
}
