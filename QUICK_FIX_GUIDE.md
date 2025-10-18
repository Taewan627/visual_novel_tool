# TW 모델 렌파이 비주얼노벨 생성기 빠른 문제 해결 가이드

## 🚨 주요 문제 해결

### 문제 1: 웹에서 실행 시 작동하지 않음

#### 원인
1. ES6 모듈 로딩 문제
2. 파일 경로 문제
3. 웹 서버를 통해 접속하지 않은 문제

#### 해결 방법

**1. 웹 서버 실행 확인**
```bash
# 방법 1: Node.js (권장)
npm install
npm start

# 방법 2: Python (대안)
python -m http.server 8000

# 방법 3: 직접 실행 스크립트
node start.js
```

**2. 브라우저 접속 확인**
- `http://localhost:3000` (Node.js)
- `http://localhost:8000` (Python)
- `file://` 프로토콜로 접속하지 않기

**3. 브라우저 개발자 도구 확인**
- F12 키로 개발자 도구 열기
- Console 탭에서 오류 메시지 확인
- Network 탭에서 파일 로딩 실패 확인

### 문제 2: AI API 연결 없음

#### 원인
현재 프로젝트는 실제 AI API 연결이 없으며, 시뮬레이션 모드로 작동합니다.

#### 해결 방법

**1. 시뮬레이션 모드로 실행**
- 현재 코드는 기본적으로 시뮬레이션 모드로 설정됨
- 별도의 API 키 없이도 작동함

**2. 실제 AI API 연결 (선택 사항)**
```javascript
// 브라우저 콘솔에서 실행
window.TWApp.storyController.configureAIService({
    simulationMode: false,
    apiKey: 'your-api-key',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo'
});
```

## 🔧 빠른 테스트 방법

### 1. 기본 기능 테스트

1. **서버 실행**
   ```bash
   npm start
   ```

2. **브라우저 접속**
   - `http://localhost:3000`

3. **스토리 정보 입력**
   - 제목: "테스트 스토리"
   - 주인공: "테스트 캐릭터"
   - 테마: "테스트 테마"
   - 설명: "테스트용 설명"

4. **질문-답변 테스트**
   - AI 질문에 선택지로 답변
   - "다음 단계로 진행" 버튼 클릭

### 2. 브라우저 콘솔 디버깅

```javascript
// 앱 상태 확인
console.log(window.TWApp);

// 스토리 상태 확인
console.log(window.TWApp.storyController.getStoryState());

// AI 서비스 상태 확인
window.TWApp.storyController.checkAIServiceStatus().then(console.log);
```

### 3. 강제 상태 초기화

```javascript
// 브라우저 콘솔에서 실행
window.TWApp.storyController.resetStory();
location.reload();
```

## 🐛 일반적인 오류 메시지

### "Failed to load module: xxx.js"

**해결책:**
1. 파일 경로 확인
2. 웹 서버를 통해 접속하는지 확인
3. 브라우저 새로고침 (Ctrl+Shift+R)

### "TWApp is not defined"

**해결책:**
1. `js/app.js` 파일이 로드되었는지 확인
2. 페이지가 완전히 로드될 때까지 기다리기
3. 브라우저 새로고침

### "Cannot read property 'xxx' of undefined"

**해결책:**
1. 객체가 null이 아닌지 확인
2. 초기화 순서 확인
3. 브라우저 콘솔에서 객체 상태 확인

## 📱 모바일 테스트

### 모바일에서 작동하지 않는 경우

1. **브라우저 확인**
   - Chrome, Firefox, Safari 최신 버전 사용
   - 구버전 브라우저는 ES6 모듈 지원하지 않을 수 있음

2. **터치 이벤트 확인**
   - 버튼 클릭 시 반응 있는지 확인
   - 모달이 올바르게 표시되는지 확인

## 🔄 자주 묻는 질문

### Q: 왜 AI API가 필요 없나요?
A: 현재 프로젝트는 시뮬레이션 모드로 작동하며, 실제 AI API 없이도 질문과 이벤트를 생성할 수 있습니다.

### Q: RPY 파일이 생성되지 않는 경우?
A: 최소한의 이벤트가 생성되었는지 확인하세요. 기→승 흐름을 완료해야 RPY 파일을 생성할 수 있습니다.

### Q: 저장/불러오기가 작동하지 않는 경우?
A: 브라우저의 로컬 스토리지를 확인하세요. 개인 정보 모드에서는 일부 기능이 제한될 수 있습니다.

## 🚀 빠른 실행 명령어

```bash
# 서버 시작
npm start

# 다른 포트로 시작
node start.js --port 8080

# Python 서버 (대안)
python -m http.server 8000
```

## 📞 추가 지원

문제가 해결되지 않는 경우:

1. **브라우저 콘솔 오류 메시지 확인**
2. **DEBUG_GUIDE.md**의 디버깅 코드 실행
3. **TROUBLESHOOTING.md** 참조
4. GitHub Issues에 상세한 정보와 함께 문제 보고

---

## 🎯 성공 확인 체크리스트

- [ ] 서버가 성공적으로 시작됨
- [ ] 브라우저에서 페이지가 올바르게 로딩됨
- [ ] 스토리 정보 입력 후 다음 단계로 진행됨
- [ ] AI 질문이 표시되고 답변할 수 있음
- [ ] 타임라인이 업데이트됨
- [ ] RPY 파일이 생성되고 다운로드됨

이 모든 항목이 체크되면 프로젝트가 성공적으로 실행되고 있는 것입니다!