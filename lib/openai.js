import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 일일 사용량 제한 (비용 절약)
let dailyUsageCount = 0
const DAILY_LIMIT = 100 // 하루 100회 제한

const resetDailyUsage = () => {
  const now = new Date()
  const lastReset = new Date(localStorage.getItem('lastReset') || 0)
  
  if (now.getDate() !== lastReset.getDate()) {
    dailyUsageCount = 0
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lastReset', now.toISOString())
    }
  }
}

// AI 서비스 클래스
export class AIService {
  constructor() {
    if (typeof window !== 'undefined') {
      resetDailyUsage()
    }
  }

  // 사용량 체크
  checkUsageLimit() {
    if (dailyUsageCount >= DAILY_LIMIT) {
      throw new Error('일일 AI 사용량을 초과했습니다. 내일 다시 시도해주세요.')
    }
  }

  // 정책 구조화
  async structurePolicy(content, title) {
    try {
      this.checkUsageLimit()
      
      const prompt = `다음 정책 문서를 분석하여 JSON 형태로 구조화해주세요.

제목: ${title}
내용: ${content}

다음 형태로 응답해주세요:
{
  "category": "정책 카테고리 (예: 보안정책, 업무규칙, 시스템정책)",
  "policyType": "정책 유형 (규칙/가이드라인/프로세스/기준)",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "tags": ["태그1", "태그2", "태그3"],
  "businessArea": "적용 업무 영역",
  "compliance": {
    "isRequired": true/false,
    "checkpoints": ["확인사항1", "확인사항2"]
  }
}`

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "당신은 기업 정책 분석 전문가입니다. 정책 문서를 체계적으로 분석하여 구조화된 JSON 데이터로 변환합니다."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.3,
      })

      dailyUsageCount++
      
      const responseText = completion.choices[0]?.message?.content
      if (!responseText) {
        throw new Error('AI 응답이 없습니다.')
      }

      // JSON 파싱
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const structuredData = JSON.parse(jsonMatch[0])
        return {
          success: true,
          data: structuredData,
          tokensUsed: completion.usage?.total_tokens || 0
        }
      } else {
        throw new Error('구조화된 데이터를 파싱할 수 없습니다.')
      }

    } catch (error) {
      console.error('정책 구조화 오류:', error)
      return {
        success: false,
        error: error.message,
        tokensUsed: 0
      }
    }
  }

  // 정책 요약 생성
  async generateSummary(content, title) {
    try {
      this.checkUsageLimit()

      const prompt = `다음 정책을 2-3문장으로 간결하게 요약해주세요:

제목: ${title}
내용: ${content}

요약:`

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "정책 문서를 간결하고 명확하게 요약하는 전문가입니다."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      })

      dailyUsageCount++

      const summary = completion.choices[0]?.message?.content?.trim()
      if (!summary) {
        throw new Error('요약 생성 실패')
      }

      return {
        success: true,
        summary,
        tokensUsed: completion.usage?.total_tokens || 0
      }

    } catch (error) {
      console.error('요약 생성 오류:', error)
      return {
        success: false,
        error: error.message,
        summary: null,
        tokensUsed: 0
      }
    }
  }

  // 태그 추출
  async extractTags(content, title) {
    try {
      this.checkUsageLimit()

      const prompt = `다음 정책에서 검색에 유용한 태그 5개를 추출해주세요 (한국어, 쉼표로 구분):

제목: ${title}
내용: ${content}

태그: `

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "정책 문서에서 검색과 분류에 유용한 핵심 키워드를 추출하는 전문가입니다."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.2,
      })

      dailyUsageCount++

      const tagsText = completion.choices[0]?.message?.content?.trim()
      if (!tagsText) {
        return {
          success: false,
          tags: [],
          tokensUsed: 0
        }
      }

      const tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

      return {
        success: true,
        tags,
        tokensUsed: completion.usage?.total_tokens || 0
      }

    } catch (error) {
      console.error('태그 추출 오류:', error)
      return {
        success: false,
        error: error.message,
        tags: [],
        tokensUsed: 0
      }
    }
  }

  // 전체 AI 처리 파이프라인
  async processPolicy(content, title) {
    const startTime = Date.now()
    const results = {
      structure: null,
      summary: null,
      tags: [],
      processingTime: 0,
      totalTokensUsed: 0,
      success: false
    }

    try {
      console.log(`AI 처리 시작: ${title}`)

      // 병렬 처리로 성능 최적화 (비용은 조금 더 들지만 속도 향상)
      const [structureResult, summaryResult, tagsResult] = await Promise.all([
        this.structurePolicy(content, title),
        this.generateSummary(content, title),
        this.extractTags(content, title)
      ])

      results.structure = structureResult.success ? structureResult.data : null
      results.summary = summaryResult.success ? summaryResult.summary : null
      results.tags = tagsResult.success ? tagsResult.tags : []
      results.totalTokensUsed = (structureResult.tokensUsed || 0) + 
                                (summaryResult.tokensUsed || 0) + 
                                (tagsResult.tokensUsed || 0)
      results.processingTime = Date.now() - startTime
      results.success = structureResult.success || summaryResult.success || tagsResult.success

      console.log(`AI 처리 완료: ${title} (${results.processingTime}ms, ${results.totalTokensUsed} tokens)`)
      
      return results

    } catch (error) {
      console.error('AI 처리 파이프라인 오류:', error)
      results.processingTime = Date.now() - startTime
      results.error = error.message
      return results
    }
  }

  // 간단한 로컬 태그 추출 (AI 사용량 절약용)
  extractLocalTags(content, title) {
    const commonKeywords = [
      '정책', '규칙', '가이드', '프로세스', '보안', '채번', 
      '비밀번호', '인증', '관리', '시스템', '사용자', '데이터',
      '승인', '권한', '접근', '제한', '금지', '필수', '선택',
      '업무', '운영', '서비스', '고객', '내부', '외부'
    ]

    const text = `${title} ${content}`.toLowerCase()
    const foundTags = commonKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    )

    // 제목에서 핵심 단어 추출
    const titleWords = title.split(/[\s\-_]+/).filter(word => 
      word.length > 1 && !['정책', '규칙', '가이드'].includes(word)
    )

    return [...new Set([...foundTags, ...titleWords])].slice(0, 5)
  }

  // 사용량 통계
  getUsageStats() {
    return {
      dailyUsed: dailyUsageCount,
      dailyLimit: DAILY_LIMIT,
      remaining: DAILY_LIMIT - dailyUsageCount,
      resetTime: new Date().toDateString()
    }
  }
}

// 싱글톤 인스턴스
export const aiService = new AIService()

// 유틸리티 함수들
export const aiUtils = {
  // AI 처리 가능 여부 확인
  canUseAI() {
    return dailyUsageCount < DAILY_LIMIT && !!process.env.OPENAI_API_KEY
  },

  // 비용 추정
  estimateCost(tokensUsed) {
    // GPT-3.5-turbo 기준: $0.002 per 1K tokens
    const costPer1KTokens = 0.002
    return (tokensUsed / 1000) * costPer1KTokens
  },

  // 토큰 수 추정 (대략적)
  estimateTokens(text) {
    // 한국어 기준 대략적 추정: 1 토큰 ≈ 1-2 글자
    return Math.ceil(text.length / 1.5)
  }
}

export default aiService
