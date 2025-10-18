# TW 모델 렌파이 비주얼노벨 생성기 디버깅 가이드

이 문서는 TW 모델 렌파이 비주얼노벨 생성기를 테스트하면서 발생할 수 있는 문제들을 식별하고 해결하기 위한 구체적인 디버깅 방법을 안내합니다.

## 🔍 디버깅 준비

### 브라우저 개발자 도구 설정

1. **개발자 도구 열기**
   - Chrome/Edge: F12 또는 Ctrl+Shift+I
   - Firefox: F12 또는 Ctrl+Shift+I
   - Safari: 개발자 메뉴에서 웹 검사기 활성화

2. **콘솔 탭 설정**
   - Preserve log 체크 (페이지 새로고침 시 로그 유지)
   - Show timestamps 체크 (시간 표시)

3. **네트워크 탭 설정**
   - Disable cache 체크 (캐시 비활성화)
   - Preserve log 체크 (로그 유지)

## 🐛 일반적인 문제 진단

### 문제 1: 페이지가 로딩되지 않음

#### 진단 단계
1. 브라우저 콘솔 열기
2. 다음 코드 실행하여 상태 확인:
```javascript
// 전역 앱 객체 확인
console.log('TWApp 객체:', window.TWApp);

// DOM 로드 상태 확인
console.log('DOM 로드 상태:', document.readyState);

// 스크립트 로드 상태 확인
const scripts = document.querySelectorAll('script[type="module"]');
scripts.forEach((script, index) => {
    console.log(`스크립트 ${index}:`, script.src, script.loaded);
});
```

#### 예상 결과 및 해결책
- **TWApp 객체가 undefined인 경우**: `app.js` 로딩 실패
  - 파일 경로 확인
  - ES6 모듈 지원 확인
  - 서버를 통해 접속하는지 확인

- **스크립트 로드 실패**: 네트워크 탭에서 404 오류 확인
  - 파일 경로 수정
  - 서버 재시작

### 문제 2: 스토리 정보 입력 후 다음 단계로 진행되지 않음

#### 진단 단계
1. 브라우저 콘솔에서 다음 코드 실행:
```javascript
// 폼 요소 확인
const form = document.getElementById('story-info-form');
console.log('폼 요소:', form);

// 폼 이벤트 리스너 확인
console.log('폼 이벤트 리스너:', form ? getEventListeners(form) : '폼 없음');

// 앱 컨트롤러 확인
console.log('스토리 컨트롤러:', window.TWApp?.storyController);
console.log('UI 컨트롤러:', window.TWApp?.uiController);
```

#### 예상 결과 및 해결책
- **폼 요소가 null인 경우**: HTML 구조 확인
  - `index.html`의 폼 ID 확인
  - DOM 로드 타이밍 문제 확인

- **이벤트 리스너가 없는 경우**: `app.js`의 이벤트 리스너 설정 확인
  - `initializeEventListeners` 함수 호출 확인

### 문제 3: AI 질문이 생성되지 않음

#### 진단 단계
1. 브라우저 콘솔에서 다음 코드 실행:
```javascript
// 현재 상태 확인
const currentState = window.TWApp?.stateManager?.getStoryState();
console.log('현재 상태:', currentState);

// 질문 컨트롤러 확인
console.log('질문 컨트롤러:', window.TWApp?.storyController?.questionController);

// 컨텍스트 데이터 확인
const position = window.TWApp?.storyController?.getCurrentPosition();
console.log('현재 위치:', position);
```

#### 예상 결과 및 해결책
- **상태 관리자가 undefined인 경우**: `state-manager.js` 로딩 실패
  - 모듈 로드 순서 확인
  - 파일 경로 확인

- **질문 컨트롤러가 없는 경우**: `story-controller.js`의 의존성 확인
  - `question-controller.js` 로딩 확인
  - 순환 참조 확인

## 🛠️ 구체적인 문제 해결 코드

### 해결책 1: 상태 초기화 문제

```javascript
// 브라우저 콘솔에서 실행하여 상태 초기화
try {
    // 현재 상태 가져오기
    const currentState = window.TWApp.stateManager.getStoryState();
    console.log('현재 상태:', currentState);
    
    // 스토리 정보가 없는 경우 초기화
    if (!currentState.storyInfo.title) {
        console.log('스토리 정보 초기화 필요');
        
        // 기본 스토리 정보로 초기화
        const basicStoryInfo = {
            title: "테스트 스토리",
            protagonist: "테스트 캐릭터",
            theme: "테스트 테마",
            description: "테스트용 스토리 설명"
        };
        
        // 스토리 초기화
        const result = await window.TWApp.storyController.initializeStory(basicStoryInfo);
        console.log('스토리 초기화 결과:', result);
    }
} catch (error) {
    console.error('상태 초기화 오류:', error);
}
```

### 해결책 2: 질문 생성 문제

```javascript
// 브라우저 콘솔에서 실행하여 질문 생성 테스트
try {
    // 현재 위치 확인
    const currentPosition = window.TWApp.storyController.getCurrentPosition();
    console.log('현재 위치:', currentPosition);
    
    // 질문 생성을 위한 컨텍스트 준비
    const context = {
        currentBottleneck: currentPosition.bottleneck || 'gi',
        currentSegment: currentPosition.segment || 'gi_1',
        recentAnswers: [],
        storyVariables: {}
    };
    
    console.log('질문 생성 컨텍스트:', context);
    
    // 질문 생성
    const question = await window.TWApp.storyController.generateQuestion(context);
    console.log('생성된 질문:', question);
    
    // UI 업데이트
    window.TWApp.uiController.displayQuestion(question);
} catch (error) {
    console.error('질문 생성 오류:', error);
}
```

### 해결책 3: RPY 생성 문제

```javascript
// 브라우저 콘솔에서 실행하여 RPY 생성 테스트
try {
    // 현재 상태 확인
    const currentState = window.TWApp.stateManager.getStoryState();
    console.log('RPY 생성 전 상태:', currentState);
    
    // 최소한의 이벤트가 있는지 확인
    if (currentState.eventNodes.length === 0) {
        console.warn('이벤트가 없어 RPY 생성을 테스트할 수 없습니다.');
        
        // 테스트용 이벤트 추가
        const testEvent = {
            id: 'test_event',
            parentSegment: 'gi_1',
            content: '테스트 이벤트 내용',
            background: 'classroom',
            music: 'cheerful_music'
        };
        
        window.TWApp.stateManager.addEvent(testEvent);
        console.log('테스트 이벤트 추가됨');
    }
    
    // RPY 생성
    const projectFiles = await window.TWApp.storyController.generateRPY();
    console.log('생성된 프로젝트 파일 수:', projectFiles.size);
    
    // 파일 내용 확인
    for (const [path, content] of projectFiles.entries()) {
        console.log(`파일: ${path}, 내용 길이: ${content.length}`);
    }
} catch (error) {
    console.error('RPY 생성 오류:', error);
}
```

## 🔧 디버깅을 위한 유틸리티 함수

### 유틸리티 1: 상태 검사기

```javascript
// 브라우저 콘솔에서 실행하여 상태 검사
function debugStoryState() {
    try {
        const state = window.TWApp.stateManager.getStoryState();
        const progress = window.TWApp.storyController.getStoryProgress();
        
        console.group('스토리 상태 디버그');
        console.log('전체 상태:', state);
        console.log('진행 상태:', progress);
        
        // 병목별 진행 상태
        Object.entries(state.mainBottlenecks).forEach(([id, bottleneck]) => {
            console.log(`병목 ${id}:`, {
                name: bottleneck.name,
                completed: bottleneck.completed,
                segments: bottleneck.segments.length
            });
        });
        
        // 이벤트 및 선택지 상태
        console.log('이벤트 수:', state.eventNodes.length);
        console.log('선택지 수:', state.choiceNodes.length);
        console.log('질문 수:', state.aiQuestions.length);
        
        console.groupEnd();
        
        return { state, progress };
    } catch (error) {
        console.error('상태 검사 오류:', error);
        return null;
    }
}

// 실행
debugStoryState();
```

### 유틸리티 2: UI 상태 검사기

```javascript
// 브라우저 콘솔에서 실행하여 UI 상태 검사
function debugUIState() {
    try {
        console.group('UI 상태 디버그');
        
        // 주요 요소 확인
        const elements = {
            storyInfoForm: document.getElementById('story-info-form'),
            storyInfoSection: document.getElementById('story-info-section'),
            questionSection: document.getElementById('question-section'),
            chatContainer: document.getElementById('chat-container'),
            timeline: document.getElementById('story-timeline'),
            storyInfoPanel: document.getElementById('story-info-panel')
        };
        
        Object.entries(elements).forEach(([id, element]) => {
            console.log(`${id}:`, element ? '존재함' : '없음');
            if (element) {
                console.log(`  표시 상태: ${window.getComputedStyle(element).display}`);
            }
        });
        
        // 메시지 확인
        const messages = document.querySelectorAll('.message');
        console.log(`메시지 수: ${messages.length}`);
        
        // 타임라인 확인
        const bottlenecks = document.querySelectorAll('.bottleneck');
        console.log(`병목 수: ${bottlenecks.length}`);
        
        console.groupEnd();
        
        return elements;
    } catch (error) {
        console.error('UI 상태 검사 오류:', error);
        return null;
    }
}

// 실행
debugUIState();
```

### 유틸리티 3: 이벤트 추적기

```javascript
// 브라우저 콘솔에서 실행하여 이벤트 로깅 설정
function setupEventLogging() {
    try {
        console.log('이벤트 로깅 설정 시작');
        
        // 폼 제출 이벤트 로깅
        const form = document.getElementById('story-info-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                console.log('폼 제출 이벤트:', e);
            });
        }
        
        // 버튼 클릭 이벤트 로깅
        const buttons = document.querySelectorAll('button');
        buttons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                console.log(`버튼 ${index} 클릭:`, button.id, e);
            });
        });
        
        // 선택지 클릭 이벤트 로깅
        const documentClickHandler = (e) => {
            if (e.target.classList.contains('choice-button')) {
                console.log('선택지 클릭:', e.target.textContent);
            }
        };
        
        document.addEventListener('click', documentClickHandler);
        
        console.log('이벤트 로깅 설정 완료');
        
        return () => {
            document.removeEventListener('click', documentClickHandler);
        };
    } catch (error) {
        console.error('이벤트 로깅 설정 오류:', error);
        return null;
    }
}

// 실행
const cleanupEventLogging = setupEventLogging();
```

## 📊 성능 분석

### 성능 측정 코드

```javascript
// 브라우저 콘솔에서 실행하여 성능 측정
function measurePerformance() {
    try {
        console.group('성능 분석');
        
        // 페이지 로드 시간
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`페이지 로드 시간: ${loadTime}ms`);
        
        // 메모리 사용량 (지원하는 브라우저만)
        if (performance.memory) {
            console.log('메모리 사용량:', {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
            });
        }
        
        // 렌더링 성능
        const renderStart = performance.now();
        
        // 강제 재렌더링
        document.body.style.display = 'none';
        document.body.offsetHeight; // 리플로우 강제
        document.body.style.display = '';
        
        const renderEnd = performance.now();
        console.log(`렌더링 시간: ${renderEnd - renderStart}ms`);
        
        console.groupEnd();
    } catch (error) {
        console.error('성능 분석 오류:', error);
    }
}

// 실행
measurePerformance();
```

## 🚨 응급 복구 절차

### 상태 초기화

```javascript
// 브라우저 콘솔에서 실행하여 전체 상태 초기화
function emergencyReset() {
    try {
        console.warn('응급 상태 초기화 실행');
        
        // 상태 관리자 초기화
        window.TWApp.stateManager.resetState();
        
        // UI 초기화
        window.TWApp.uiController.showStoryInfoSection();
        window.TWApp.uiController.hideQuestionSection();
        window.TWApp.uiController.clearChatContainer();
        
        // 흐름 컨트롤러 초기화
        window.TWApp.storyController.flowController.reset();
        
        console.log('응급 상태 초기화 완료');
        
        // 페이지 새로고침
        location.reload();
    } catch (error) {
        console.error('응급 상태 초기화 오류:', error);
        location.reload();
    }
}

// 실행 (필요한 경우만)
// emergencyReset();
```

---

이 디버깅 가이드를 통해 TW 모델 렌파이 비주얼노벨 생성기의 문제를 효과적으로 진단하고 해결할 수 있습니다. 복잡한 문제의 경우 GitHub Issues에 상세한 정보와 함께 문제를 보고해주세요.