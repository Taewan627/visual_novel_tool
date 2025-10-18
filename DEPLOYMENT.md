# Vercel 배포 가이드

이 문서는 TW 모델 렌파이 비주얼노벨 생성기를 Vercel에 배포하는 방법을 안내합니다.

## 🚀 배포 전 준비 사항

### 1. API 키 설정

1. **Gemini API 키 발급**
   - [Google AI Studio](https://aistudio.google.com/app/apikey) 방문
   - 새 API 키 생성
   - 키 복사

2. **OpenAI API 키 발급** (선택사항)
   - [OpenAI API](https://platform.openai.com/api-keys) 방문
   - 새 API 키 생성
   - 키 복사

### 2. 환경 변수 설정

#### 로컬 개발 환경
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일에 API 키 입력
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

#### Vercel 배포 환경
Vercel 대시보드에서 환경 변수 설정:
1. Vercel 프로젝트 설정으로 이동
2. Environment Variables 섹션에서 다음 변수 추가:
   - `GEMINI_API_KEY`: Gemini API 키
   - `OPENAI_API_KEY`: OpenAI API 키 (선택사항)

## 📋 배포 단계

### 1. Vercel CLI 설치
```bash
npm i -g vercel
```

### 2. Vercel 로그인
```bash
vercel login
```

### 3. 프로젝트 배포
```bash
# 프로젝트 루트 디렉토리에서 실행
vercel

# 프롬프트에 따라 설정:
# - Set up and deploy? Yes
# - Which scope? 사용자 계정 선택
# - Link to existing project? No (첫 배포 시)
# - Project name? tw-renpy-generator (기본값)
# - In which directory is your code located? ./ (기본값)
# - Want to override the settings? No (기본값)
```

### 4. 환경 변수 설정 (Vercel 대시보드)
1. Vercel 프로젝트 대시보드로 이동
2. Settings → Environment Variables
3. 다음 변수 추가:
   - `GEMINI_API_KEY`: Gemini API 키
   - `OPENAI_API_KEY`: OpenAI API 키 (선택사항)

### 5. 재배포
```bash
vercel --prod
```

## 🔧 배포 설정

### vercel.json 설정
프로젝트 루트의 `vercel.json` 파일은 다음을 포함합니다:
- 정적 파일 라우팅
- 환경 변수 참조
- SPA 라우팅 설정

### 빌드 프로세스
이 프로젝트는 정적 파일이므로 별도의 빌드 과정이 필요 없습니다.
Vercel이 자동으로 정적 파일을 호스팅합니다.

## 🐛 문제 해결

### 1. API 키 관련 문제
- **증상**: AI 기능이 작동하지 않음
- **해결**: Vercel 대시보드에서 환경 변수가 올바르게 설정되었는지 확인

### 2. CORS 오류
- **증상**: API 요청 실패
- **해결**: API 키가 올바르게 설정되었는지 확인

### 3. 라우팅 문제
- **증상**: 페이지 새로고침 시 404 오류
- **해결**: `vercel.json`의 라우팅 설정 확인

### 4. 모듈 로드 오류
- **증상**: JavaScript 모듈 로드 실패
- **해결**: 브라우저가 ES6 모듈을 지원하는지 확인

## 📝 배포 후 확인 사항

1. **기본 기능 테스트**
   - 페이지 로딩 확인
   - 스토리 정보 입력 확인
   - 질문-답변 기능 확인

2. **AI 기능 테스트**
   - API 키가 올바르게 설정되었는지 확인
   - 시뮬레이션 모드로의 대체 기능 확인

3. **내보내기 기능 테스트**
   - RPY 파일 생성 및 다운로드 확인

## 🔄 자동 배포 설정

GitHub와 연동하여 자동 배포를 설정할 수 있습니다:

1. Vercel 프로젝트에서 Git 연동
2. 브랜치 설정 (main/master)
3. 자동 배포 활성화

이렇게 설정하면 main 브랜치에 푸시할 때마다 자동으로 배포됩니다.

## 📊 배포 상태 확인

배포 후 다음을 확인하세요:
- Vercel 대시보드의 배포 로그
- 브라우저 개발자 도구의 콘솔 오류
- 네트워크 탭에서 API 요청 상태

---

문제가 발생하면 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)를 참조하거나 GitHub Issues를 통해 문의해주세요.