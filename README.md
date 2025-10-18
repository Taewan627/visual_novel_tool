# TW 모델 렌파이 비주얼노벨 생성기

병목 기반 스토리 제어 모델(TW 모델)을 사용하여 렌파이 비주얼노벨 프로젝트를 자동으로 생성하는 웹 기반 도구입니다.

## 🎯 특징

- **TW 모델 기반**: 기(Setup) → 승(Confrontation) → 전(Climax) → 결(Resolution) 흐름
- **AI 질문-답변 시스템**: 자연스러운 스토리 생성을 위한 대화형 인터페이스
- **병목 수렴 구조**: 모든 선택지는 다음 병목으로 수렴하여 스토리 흐름 제어
- **RPY 파일 자동 생성**: 렌파이 스크립트 자동 생성 및 패키징
- **실시간 상태 관리**: JSON 기반 상태 저장 및 로컬 스토리지 자동 저장

## 🚀 빠른 시작

### 1. 프로젝트 클론 또는 다운로드

```bash
git clone https://github.com/your-username/tw-renpy-generator.git
cd tw-renpy-generator
```

### 2. 서버 실행

#### 방법 1: Node.js (권장)

```bash
# Node.js가 설치되어 있는지 확인
node --version

# 의존성 설치
npm install

# 서버 실행
npm start
```

#### 방법 2: Python 3

```bash
# Python 3가 설치되어 있는지 확인
python --version

# 서버 실행
python -m http.server 8000
```

#### 방법 3: 기타 웹 서버

PHP, Live Server 등 원하는 웹 서버를 사용할 수 있습니다.

### 3. 브라우저에서 접속

- Node.js 서버: `http://localhost:3000`
- Python 서버: `http://localhost:8000`
- 기타 서버: 해당 서버의 주소

## 📖 사용법

### 1. 스토리 시작

1. 웹 페이지에서 "제목", "주인공", "테마", "설명"을 입력합니다.
2. "스토리 시작하기" 버튼을 클릭합니다.

### 2. AI 질문-답변

1. AI가 제시하는 질문을 읽습니다.
2. 선택지 중 하나를 선택하여 답변합니다.
3. 답변은 자동으로 스토리에 반영됩니다.

### 3. 진행 확인

- **좌측 타임라인**: 스토리 진행 상황을 시각적으로 확인합니다.
- **우측 패널**: 스토리 정보, 변수 상태, 통계를 확인합니다.

### 4. 프로젝트 내보내기

1. "RPY 내보내기" 버튼을 클릭합니다.
2. ZIP 파일이 다운로드됩니다.
3. 압축을 풀고 렌파이에서 프로젝트를 열어 확인합니다.

## 🏗️ TW 모델 구조

### 병목(Bottleneck) 구조

```
기 (Setup) ──> 승 (Confrontation) ──> 전 (Climax) ──> 결 (Resolution)
```

### MVP 범위

- **기(Setup)**: 일상 소개 → 사건 발생
- **승(Confrontation)**: 갈등 시작 → 첫 실패
- **전(Climax)**: MVP 단계 이후 구현 예정
- **결(Resolution)**: MVP 단계 이후 구현 예정

### 수렴 원리

모든 선택지는 반드시 다음 병목으로 수렴하여 스토리 흐름이 일관되게 유지됩니다.

## 🎨 UI/UX 가이드

### 메인 화면 구성

- **헤더**: 로고, 저장/불러오기/내보내기 버튼
- **좌측 패널**: 스토리 타임라인, 진행률 표시
- **중앙 패널**: 대화형 질문-답변 인터페이스
- **우측 패널**: 스토리 정보, 변수 상태, 통계
- **하단 패널**: 상태 표시줄

### 단축키

- `Ctrl+S`: 저장
- `Ctrl+O`: 불러오기
- `Ctrl+E`: 내보내기
- `Esc`: 모달 닫기

## 🛠️ 기술 스택

- **프론트엔드**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **상태 관리**: 중앙 집중식 JSON 상태 관리
- **템플릿 엔진**: 클라이언트 측 문자열 기반 템플릿
- **파일 처리**: JSZip, FileSaver.js

## 📁 프로젝트 구조

```
tw-renpy-generator/
├── index.html                    # 메인 페이지
├── css/                          # 스타일시트
├── js/                          # JavaScript 모듈
│   ├── controllers/             # 컨트롤러
│   ├── data/                    # 데이터 관리
│   ├── services/                # 서비스
│   ├── strategies/              # 질문 전략
│   └── utils/                   # 유틸리티
└── README.md                    # 이 파일
```

## 🔧 개발

### 로컬 개발 환경 설정

```bash
# 개발 서버 실행 (포트 3000)
npm run dev

# 또는 Python 개발 서버
python -m http.server 8000
```

### 브라우저 호환성

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 로드맵

### v1.0 (MVP) - 현재
- [x] 기(Setup) 병목 구현
- [x] 승(Confrontation) 병목 구현
- [x] AI 질문-답변 시스템
- [x] RPY 파일 생성
- [x] 기본 UI/UX

### v1.1 예정
- [ ] 전(Climax) 병목 구현
- [ ] 결(Resolution) 병목 구현
- [ ] 이미지/음악 관리
- [ ] 고급 질문 유형

### v2.0 예정
- [ ] 클라우드 저장
- [ ] 공유 및 협업 기능
- [ ] 사용자 정의 테마
- [ ] 플러그인 시스템

## 🤝 기여

기여를 환영합니다! 다음 단계를 따라주세요:

1. 이 저장소를 포크합니다.
2. 기능 브랜치를 만듭니다 (`git checkout -b feature/AmazingFeature`).
3. 커밋합니다 (`git commit -m 'Add some AmazingFeature'`).
4. 푸시합니다 (`git push origin feature/AmazingFeature`).
5. 풀 리퀘스트를 엽니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

TW 모델과 렌파이 비주얼노벨 제작에 영감을 주신 모든 분들께 감사드립니다.

## 🚀 배포

### Vercel 배포

이 프로젝트는 Vercel에 정적 사이트로 배포할 수 있습니다. 자세한 배포 방법은 [DEPLOYMENT.md](DEPLOYMENT.md)를 참조하세요.

#### 빠른 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### 환경 변수 설정
- `GEMINI_API_KEY`: Gemini API 키
- `OPENAI_API_KEY`: OpenAI API 키 (선택사항)

## 📞 연락처

질문이나 제안이 있으시면 다음으로 연락주세요:

- 이메일: your-email@example.com
- GitHub Issues: [Issues 페이지](https://github.com/your-username/tw-renpy-generator/issues)

---

⭐ 이 프로젝트가 마음에 드셨다면 스타를 남겨주세요!