# Vercel 배포 가이드

이 문서는 TW 모델 렌파이 비주얼노벨 생성기를 Vercel에 배포하는 방법을 안내합니다.

## 🏗️ 아키텍처

이 프로젝트는 다음과 같은 하이브리드 아키텍처를 사용합니다:
- **정적 SPA**: 클라이언트 측 JavaScript 애플리케이션
- **서버리스 함수**: Vercel Functions를 통한 API 프록시
- **API 키 보안**: 서버리스 함수에서 API 키 관리 (클라이언트 노출 방지)

## 🚀 배포 전 준비 사항

### 1. Hugging Face API 키 설정

1. **Hugging Face API 키 발급**
   - [Hugging Face](https://huggingface.co/settings/tokens) 방문
   - 새 API 키 생성
   - 키 복사

2. **사용할 모델 선택**
   - 스토리 생성: `google/flan-t5-large` (기본값)
   - 캐릭터 생성: `google/flan-t5-large` (기본값)
   - 대화 생성: `google/flan-t5-large` (기본값)

### 2. 환경 변수 설정

#### 로컬 개발 환경
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일에 API 키 입력
HF_API_KEY=your_huggingface_api_key_here
MODEL_STORY=google/flan-t5-large
MODEL_CHAR=google/flan-t5-large
MODEL_DIALOGUE=google/flan-t5-large
```

#### Vercel 배포 환경
Vercel 대시보드에서 환경 변수 설정:
1. Vercel 프로젝트 설정으로 이동
2. Environment Variables 섹션에서 다음 변수 추가:
   - `HF_API_KEY`: Hugging Face API 키
   - `MODEL_STORY`: 스토리 생성 모델 (예: `google/flan-t5-large`)
   - `MODEL_CHAR`: 캐릭터 생성 모델 (예: `google/flan-t5-large`)
   - `MODEL_DIALOGUE`: 대화 생성 모델 (예: `google/flan-t5-large`)

## 📋 배포 단계

### 방법 1: Vercel 웹사이트에서 직접 배포 (권장)

1. **GitHub 저장소 연동**
   - 프로젝트를 GitHub에 푸시
   - [Vercel](https://vercel.com)에 로그인
   - "New Project" 클릭
   - GitHub 저장소 선택

2. **프로젝트 설정**
   - Project Name: `tw-renpy-generator` (또는 원하는 이름)
   - Framework Preset: `Other`
   - Root Directory: `./` (기본값)
   - Build Command: 비워두기 (정적 사이트이므로 빌드 불필요)
   - Output Directory: 비워두기
   - Install Command: `npm install` (기본값)

3. **환경 변수 설정**
   - Environment Variables 섹션에서 다음 변수 추가:
     - `GEMINI_API_KEY`: Gemini API 키
     - `OPENAI_API_KEY`: OpenAI API 키 (선택사항)

4. **배포**
   - "Deploy" 버튼 클릭
   - 배포가 완료되면 자동으로 URL이 생성됨

### 방법 2: Vercel CLI 사용

#### 1. Vercel CLI 설치
```bash
npm i -g vercel
```

#### 2. Vercel 로그인
```bash
vercel login
```

#### 3. 프로젝트 배포
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

**참고**: 이 프로젝트는 순수 정적 사이트이므로 별도의 빌드 과정이 필요 없습니다. Vercel이 자동으로 정적 파일을 호스팅합니다.

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