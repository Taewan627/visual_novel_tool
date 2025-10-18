# 리팩토링 아키텍트 변경 요약

## 🎯 목표
- Vercel 배포 오류 제거
- 정적 SPA + 서버리스 함수(/api) 동시 사용
- 클라이언트에서 안전하게 /api 호출 (API 키 노출 금지)

## 📋 원자적 커밋 변경사항

### 1. fix: vercel.json routes for SPA + API
- **파일**: `/vercel.json`
- **변경**: SPA 라우팅과 서버리스 함수 라우팅을 동시에 지원하도록 재설정
- **이전**: 복잡한 builds와 rewrites 설정
- **이후**: 간단한 functions와 routes 설정

```json
{
  "version": 2,
  "name": "tw-renpy-generator",
  "functions": {
    "api/**/*.js": { "runtime": "nodejs18.x", "memory": 128, "maxDuration": 10 }
  },
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "cleanUrls": true
}
```

### 2. feat: add serverless api endpoints (story/character/dialogue)
- **파일**: `/api/story.js`, `/api/character.js`, `/api/dialogue.js`
- **변경**: Hugging Face API를 호출하는 서버리스 함수 3개 생성
- **특징**:
  - 각 함수는 전용 모델 환경 변수 사용
  - API 키는 서버 측에서 안전하게 관리
  - 표준 HTTP 상태 코드와 에러 처리

### 3. refactor: client fetch -> /api/* proxy calls
- **파일**: `/js/services/ai-service.js`
- **변경**: 외부 API 직접 호출을 서버리스 함수 호출로 변경
- **이전**: Gemini/OpenAI API 직접 호출
- **이후**: `/api/story`, `/api/character`, `/api/dialogue` 호출
- **이점**: API 키 노출 방지, CORS 문제 해결

### 4. refactor: remove server dependencies
- **파일**: `/.env.example`, `/DEPLOYMENT.md`
- **변경**: Hugging Face API 키와 모델 설정 추가
- **정리**: 불필요한 서버 의존성 확인 및 정리

## 🏗️ 새로운 아키텍처

```
클라이언트 (SPA)     서버리스 함수 (Vercel)     외부 API
     │                    │                        │
     ├─ /api/story ────────┼─> Hugging Face API     │
     ├─ /api/character ────┤                        │
     └─ /api/dialogue ─────┤                        │
                          │                        │
                          └─> API 키 안전 관리     │
```

## 🚀 실행/배포 체크리스트

### 1. 환경 변수 설정
- [ ] Hugging Face API 키 발급
- [ ] Vercel 대시보드에 환경 변수 설정:
  - `HF_API_KEY`: Hugging Face API 키
  - `MODEL_STORY`: `google/flan-t5-large`
  - `MODEL_CHAR`: `google/flan-t5-large`
  - `MODEL_DIALOGUE`: `google/flan-t5-large`

### 2. 로컬 테스트
- [ ] `npm run dev`로 로컬 서버 실행
- [ ] 스토리 생성 기능 테스트
- [ ] 캐릭터 생성 기능 테스트
- [ ] 대화 생성 기능 테스트

### 3. Vercel 배포
- [ ] GitHub에 코드 푸시
- [ ] Vercel에서 프로젝트 연동
- [ ] 환경 변수 설정 확인
- [ ] 배포 실행

### 4. 배포 후 테스트
- [ ] 페이지 로딩 확인
- [ ] API 엔드포인트 동작 확인
- [ ] 스토리 생성 기능 테스트
- [ ] RPY 내보내기 기능 테스트

## 🔍 문제 해결

### 일반적인 문제
1. **API 키 오류**: Vercel 환경 변수 설정 확인
2. **CORS 오류**: 서버리스 함수를 통한 호출인지 확인
3. **404 오류**: vercel.json 라우팅 설정 확인
4. **함수 오류**: Vercel Functions 로그 확인

### 디버깅 방법
1. Vercel 대시보드의 Functions 탭에서 로그 확인
2. 브라우저 개발자 도구의 네트워크 탭 확인
3. 환경 변수가 올바르게 설정되었는지 확인

## 📊 보안 개선

- **API 키 보호**: 서버리스 함수에서만 API 키 관리
- **CORS 해결**: 프록시 패턴으로 클라이언트-서버 통신
- **환경 변수 분리**: 개발/배포 환경 변수 완전 분리

## 🎉 기대 효과

1. **안전한 배포**: API 키 노출 없는 안전한 배포
2. **확장성**: 새로운 API 엔드포인트 쉽게 추가 가능
3. **유지보수**: 명확한 아키텍처로 유지보수 용이
4. **성능**: Vercel 엣지를 통한 빠른 응답 속도