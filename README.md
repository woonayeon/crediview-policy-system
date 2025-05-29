# 🤖 크레디뷰 AI 정책 관리 시스템

AI 기반 정책 구조화 및 검색을 지원하는 내부 정책 관리 시스템입니다.

## ✨ 주요 기능

### 🧠 AI 기반 정책 관리
- **자동 구조화**: OpenAI GPT를 활용한 정책 내용 분석 및 구조화
- **스마트 태그**: AI가 자동으로 관련 태그 추출 및 분류
- **자동 요약**: 긴 정책 문서를 2-3문장으로 요약
- **카테고리 분류**: 정책 유형에 따른 자동 분류

### 🔍 강력한 검색
- **키워드 검색**: 제목, 내용, 태그를 통한 통합 검색
- **의미적 검색**: AI가 문맥을 이해하는 검색 (향후 업데이트)
- **필터링**: 부서, 상태, 우선순위별 필터
- **검색 히스토리**: 사용자별 검색 기록 관리

### 📊 실시간 대시보드
- **통계 현황**: 전체/활성/대기 정책 수 실시간 모니터링
- **최근 활동**: 새로 생성된 정책 및 업데이트 현황
- **사용량 분석**: AI 처리 현황 및 사용량 추적

### 👥 사용자 관리
- **부서별 관리**: 기획팀, 운영팀 등 부서별 정책 관리
- **권한 시스템**: 관리자/일반사용자 권한 구분
- **인증 보안**: JWT 기반 안전한 인증 시스템

## 🛠 기술 스택

### Frontend
- **Next.js 14**: React 기반 풀스택 프레임워크
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **React Hooks**: 모던 React 상태 관리

### Backend
- **Next.js API Routes**: 서버리스 API 엔드포인트
- **JWT**: JSON Web Token 기반 인증
- **bcrypt**: 비밀번호 암호화

### Database
- **Supabase**: PostgreSQL 기반 Backend-as-a-Service
- **실시간 API**: 실시간 데이터 동기화

### AI
- **OpenAI GPT-3.5/4**: 정책 분석 및 구조화
- **자연어 처리**: 한국어 정책 문서 처리 최적화

## 🚀 배포 및 실행

### 환경 변수 설정
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret_key
```

### 로컬 개발
```bash
npm install
npm run dev
```

### 프로덕션 배포
```bash
npm run build
npm start
```

## 📋 데이터베이스 스키마

### 주요 테이블
- **users**: 사용자 정보 (이름, 이메일, 부서, 권한)
- **policies**: 정책 데이터 (제목, 내용, AI 구조화 결과)
- **categories**: 정책 카테고리
- **search_history**: 검색 기록

### AI 구조화 데이터
```json
{
  "category": "보안정책",
  "policyType": "규칙",
  "keyPoints": ["핵심 포인트들"],
  "tags": ["관련", "태그들"],
  "businessArea": "적용 업무 영역",
  "compliance": {
    "isRequired": true,
    "checkpoints": ["확인사항들"]
  }
}
```

## 👤 기본 계정

### 관리자 계정
- **이메일**: admin@company.com
- **비밀번호**: admin123!

## 🔧 주요 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup` - 회원가입
- `GET /api/auth/me` - 사용자 정보 조회

### 정책
- `GET /api/policies` - 정책 목록 조회
- `POST /api/policies` - 새 정책 생성
- `GET /api/policies/stats` - 통계 조회
- `POST /api/policies/search` - 정책 검색

## 💰 비용 관리

### OpenAI API 사용량
- **신규 계정**: 3개월간 $18 무료 크레딧
- **예상 비용**: 월 $5-15 (사용량에 따라)
- **일일 제한**: 100회 AI 처리 (비용 절약)

### 호스팅 (Vercel + Supabase)
- **무료 티어**: 개인/소규모 팀 사용 가능
- **업그레이드**: 필요시 유료 플랜 전환

## 📈 향후 개발 계획

### Phase 1 (완료)
- ✅ 기본 CRUD 기능
- ✅ AI 정책 구조화
- ✅ 키워드 검색
- ✅ 사용자 인증
- ✅ 대시보드

### Phase 2 (계획)
- 🔄 의미적 검색 (벡터 임베딩)
- 🔄 정책 승인 워크플로우
- 🔄 파일 업로드 지원
- 🔄 정책 버전 관리

### Phase 3 (향후)
- 📅 알림 시스템
- 📅 고급 분석 및 리포팅
- 📅 외부 시스템 연동
- 📅 모바일 앱

## 🐛 문제 해결

### 자주 발생하는 문제

#### AI 처리 실패
```javascript
// 원인: OpenAI API 키 오류 또는 사용량 초과
// 해결: 환경변수 확인 및 사용량 점검
```

#### 로그인 실패
```javascript
// 원인: JWT_SECRET 미설정
// 해결: 환경변수에 JWT_SECRET 추가
```

#### 데이터베이스 연결 오류
```javascript
// 원인: Supabase URL/Key 오류
// 해결: 환경변수 재확인
```

## 📞 지원

### 개발팀 연락처
- **기획**: 기획팀 내부 문의
- **기술**: GitHub Issues 활용
- **긴급**: 시스템 관리자 직접 연락

## 📄 라이선스

MIT License - 내부 사용 목적

## 시스템 상태
- ✅ 정책 관리 시스템 완성
- ✅ AI 자동 구조화 기능
- ✅ 반응형 대시보드
- 🚀 배포 진행 중 (2024-12-19)
---

**🎉 크레디뷰 정책 관리 시스템으로 더 효율적인 정책 관리를 경험해보세요!**
