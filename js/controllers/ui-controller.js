/**
 * TW 모델 UI 컨트롤러
 * 사용자 인터페이스 제어 및 업데이트
 */

/**
 * TW UI 컨트롤러
 */
export class TWUIController {
    constructor(storyController, stateManager) {
        this.storyController = storyController;
        this.stateManager = stateManager;
        this.currentQuestion = null;
        this.isProcessing = false;
        
        this.initializeEventListeners();
    }

    /**
     * 이벤트 리스너 초기화
     */
    initializeEventListeners() {
        // 스토리 정보 폼은 이미 app.js에서 처리됨
        // 여기서는 질문-답변 관련 이벤트만 처리
    }

    /**
     * 초기 상태에서 UI 업데이트
     */
    updateUIFromState() {
        const storyState = this.stateManager.getStoryState();
        
        if (storyState.storyInfo.title) {
            // 스토리가 이미 초기화된 경우
            this.hideStoryInfoSection();
            this.showQuestionSection();
            this.updateStoryInfoPanel();
            this.updateTimeline();
            this.updateStatistics();
        } else {
            // 초기 상태인 경우
            this.showStoryInfoSection();
            this.hideQuestionSection();
        }
    }

    /**
     * 질문 표시
     */
    async displayQuestion(question) {
        this.currentQuestion = question;
        this.isProcessing = true;
        
        // 기존 콘텐츠 제거
        this.clearChatContainer();
        
        // 질문 메시지 생성
        this.addAIMessage(question.ask, question);
        
        // 선택지 버튼 생성
        this.addChoiceButtons(question);
        
        // 스크롤을 맨 아래로
        this.scrollToBottom();
        
        this.isProcessing = false;
    }

    /**
     * AI 메시지 추가
     */
    addAIMessage(text, question = null) {
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message fade-in-up';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar ai-avatar';
        avatarDiv.innerHTML = '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = text;
        
        contentDiv.appendChild(textDiv);
        
        // 질문 컨텍스트 추가
        if (question && question.context) {
            const contextDiv = document.createElement('div');
            contextDiv.className = 'question-context';
            const bottleneckName = this.getBottleneckDisplayName(question.context.currentBottleneck);
            const segmentName = this.getSegmentDisplayName(question.context.currentSegment);
            contextDiv.textContent = `${bottleneckName} > ${segmentName} 단계에서의 질문`;
            contentDiv.appendChild(contextDiv);
        }
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        chatContainer.appendChild(messageDiv);
    }

    /**
     * 선택지 버튼 추가
     */
    addChoiceButtons(question) {
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) return;
        
        const choicesContainer = document.createElement('div');
        choicesContainer.className = 'choices-container';
        
        question.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.dataset.choice = choice;
            button.innerHTML = `
                <span class="choice-icon">${this.getChoiceIcon(choice)}</span>
                <span class="choice-text">${choice}</span>
            `;
            
            button.addEventListener('click', () => {
                if (!this.isProcessing) {
                    this.processChoice(choice);
                }
            });
            
            choicesContainer.appendChild(button);
        });
        
        chatContainer.appendChild(choicesContainer);
    }

    /**
     * 선택지 처리
     */
    async processChoice(choice) {
        if (!this.currentQuestion || this.isProcessing) return;
        
        this.isProcessing = true;
        
        // 사용자 답변 표시
        this.addUserMessage(choice);
        
        // 선택지 버튼 비활성화
        this.disableChoiceButtons();
        
        try {
            // 스토리 컨트롤러를 통해 답변 처리
            const result = await this.storyController.processAnswer(this.currentQuestion.id, choice);
            
            // AI 피드백 표시
            this.displayAIFeedback(result);
            
            // UI 업데이트
            this.updateTimeline();
            this.updateStoryInfoPanel();
            this.updateStatistics();
            
            // 다음 단계 버튼 표시
            this.showNextStepButton();
            
        } catch (error) {
            console.error('답변 처리 중 오류:', error);
            this.displayError('답변 처리 중 오류가 발생했습니다: ' + error.message);
        }
        
        this.isProcessing = false;
    }

    /**
     * 사용자 메시지 추가
     */
    addUserMessage(text) {
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message fade-in-up';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar user-avatar';
        avatarDiv.innerHTML = '👤';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = text;
        
        contentDiv.appendChild(textDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    /**
     * AI 피드백 표시
     */
    displayAIFeedback(result) {
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) return;
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'message ai-feedback fade-in-up';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar ai-avatar';
        avatarDiv.innerHTML = '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const feedbackText = document.createElement('div');
        feedbackText.className = 'message-text';
        feedbackText.textContent = '좋은 선택입니다! 이제 해당 내용에 맞는 장면을 생성해보겠습니다.';
        
        contentDiv.appendChild(feedbackText);
        
        // 생성된 이벤트 표시
        if (result.event) {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'generated-event';
            
            const eventTitle = document.createElement('h4');
            eventTitle.textContent = '생성된 이벤트:';
            
            const eventContent = document.createElement('p');
            eventContent.textContent = result.event.content;
            
            const eventDetails = document.createElement('div');
            eventDetails.className = 'event-details';
            
            if (result.event.background) {
                const backgroundSpan = document.createElement('span');
                backgroundSpan.textContent = `배경: ${result.event.background}`;
                eventDetails.appendChild(backgroundSpan);
            }
            
            if (result.event.music) {
                const musicSpan = document.createElement('span');
                musicSpan.textContent = `음악: ${result.event.music}`;
                eventDetails.appendChild(musicSpan);
            }
            
            eventDiv.appendChild(eventTitle);
            eventDiv.appendChild(eventContent);
            eventDiv.appendChild(eventDetails);
            
            contentDiv.appendChild(eventDiv);
        }
        
        feedbackDiv.appendChild(avatarDiv);
        feedbackDiv.appendChild(contentDiv);
        
        chatContainer.appendChild(feedbackDiv);
        this.scrollToBottom();
    }

    /**
     * 다음 단계 버튼 표시
     */
    showNextStepButton() {
        const nextStepContainer = document.getElementById('next-step-container');
        if (nextStepContainer) {
            nextStepContainer.style.display = 'block';
        }
    }

    /**
     * 다음 단계로 이동
     */
    async moveToNextStep() {
        try {
            // 다음 단계 버튼 숨기기
            this.hideNextStepButton();
            
            // 로딩 표시
            this.showLoadingMessage();
            
            // 다음 단계로 이동
            const result = await this.storyController.moveToNext();
            
            if (result.type === 'completed') {
                this.displayCompletion();
            } else if (result.type === 'question') {
                this.displayQuestion(result.question);
            }
            
        } catch (error) {
            console.error('다음 단계 이동 중 오류:', error);
            this.displayError('다음 단계로 이동 중 오류가 발생했습니다: ' + error.message);
        }
    }

    /**
     * 로딩 메시지 표시
     */
    showLoadingMessage() {
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) return;
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message';
        loadingDiv.id = 'loading-message';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar ai-avatar';
        avatarDiv.innerHTML = '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-message';
        loadingText.innerHTML = `
            <span>다음 내용을 생성 중입니다</span>
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        `;
        
        contentDiv.appendChild(loadingText);
        loadingDiv.appendChild(avatarDiv);
        loadingDiv.appendChild(contentDiv);
        
        chatContainer.appendChild(loadingDiv);
        this.scrollToBottom();
    }

    /**
     * 로딩 메시지 제거
     */
    hideLoadingMessage() {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    /**
     * 완료 표시
     */
    displayCompletion() {
        this.hideLoadingMessage();
        
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) return;
        
        const completionDiv = document.createElement('div');
        completionDiv.className = 'message ai-message';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar ai-avatar';
        avatarDiv.innerHTML = '🎉';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const completionText = document.createElement('div');
        completionText.className = 'message-text';
        completionText.textContent = '축하합니다! MVP 버전의 스토리 생성이 완료되었습니다. 이제 RPY 파일로 내보낼 수 있습니다.';
        
        contentDiv.appendChild(completionText);
        completionDiv.appendChild(avatarDiv);
        completionDiv.appendChild(contentDiv);
        
        chatContainer.appendChild(completionDiv);
        this.scrollToBottom();
    }

    /**
     * 오류 표시
     */
    displayError(message) {
        this.hideLoadingMessage();
        
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message ai-message';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar ai-avatar';
        avatarDiv.innerHTML = '⚠️';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const errorText = document.createElement('div');
        errorText.className = 'error-message';
        errorText.innerHTML = `
            <h4>오류가 발생했습니다</h4>
            <p>${message}</p>
        `;
        
        contentDiv.appendChild(errorText);
        errorDiv.appendChild(avatarDiv);
        errorDiv.appendChild(contentDiv);
        
        chatContainer.appendChild(errorDiv);
        this.scrollToBottom();
    }

    /**
     * 선택지 버튼 비활성화
     */
    disableChoiceButtons() {
        const choiceButtons = document.querySelectorAll('.choice-button');
        choiceButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.6';
        });
    }

    /**
     * 다음 단계 버튼 숨기기
     */
    hideNextStepButton() {
        const nextStepContainer = document.getElementById('next-step-container');
        if (nextStepContainer) {
            nextStepContainer.style.display = 'none';
        }
    }

    /**
     * 채팅 컨테이너 초기화
     */
    clearChatContainer() {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.innerHTML = '';
        }
    }

    /**
     * 스크롤을 맨 아래로
     */
    scrollToBottom() {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 100);
        }
    }

    /**
     * 타임라인 업데이트
     */
    updateTimeline() {
        const timeline = document.getElementById('story-timeline');
        if (!timeline) return;
        
        const storyTimeline = this.storyController.getStoryTimeline();
        
        // 기존 타임라인 제거
        timeline.innerHTML = '';
        
        // 병목 표시줄 생성
        const bottleneckBar = document.createElement('div');
        bottleneckBar.className = 'bottleneck-bar';
        
        // 각 병목 생성
        Object.entries(storyTimeline.bottlenecks).forEach(([bottleneckId, bottleneck]) => {
            const bottleneckDiv = this.createBottleneckElement(bottleneckId, bottleneck, storyTimeline);
            bottleneckBar.appendChild(bottleneckDiv);
        });
        
        timeline.appendChild(bottleneckBar);
        
        // 현재 위치 표시
        const currentPositionDiv = this.createCurrentPositionElement(storyTimeline.currentProgress);
        timeline.appendChild(currentPositionDiv);
    }

    /**
     * 병목 요소 생성
     */
    createBottleneckElement(bottleneckId, bottleneck, storyTimeline) {
        const bottleneckDiv = document.createElement('div');
        bottleneckDiv.className = 'bottleneck';
        bottleneckDiv.dataset.bottleneck = bottleneckId;
        
        // 활성/완료 상태 확인
        const currentBottleneck = storyTimeline.currentProgress.currentBottleneck;
        if (bottleneckId === currentBottleneck) {
            bottleneckDiv.classList.add('active');
        } else if (bottleneck.completed) {
            bottleneckDiv.classList.add('completed');
        } else if (!this.isBottleneckAvailable(bottleneckId)) {
            bottleneckDiv.classList.add('disabled');
        }
        
        // 병목 헤더
        const headerDiv = document.createElement('div');
        headerDiv.className = 'bottleneck-header';
        
        const titleDiv = document.createElement('h3');
        titleDiv.innerHTML = `
            <span class="bottleneck-icon">${bottleneck.name.charAt(0)}</span>
            <span class="bottleneck-name">${bottleneck.name}</span>
            <span class="bottleneck-english">(${bottleneck.englishName || bottleneckId})</span>
        `;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        const progress = this.calculateBottleneckProgress(bottleneckId, storyTimeline);
        const progressFill = document.createElement('div');
        progressFill.className = 'progress';
        progressFill.style.width = `${progress}%`;
        
        progressBar.appendChild(progressFill);
        headerDiv.appendChild(titleDiv);
        headerDiv.appendChild(progressBar);
        
        // 세그먼트 컨테이너
        const segmentsDiv = document.createElement('div');
        segmentsDiv.className = 'segments';
        
        // 세그먼트들 추가
        const segments = storyTimeline.segments.filter(seg => seg.parentBottleneck === bottleneckId);
        segments.forEach(segment => {
            const segmentDiv = this.createSegmentElement(segment, storyTimeline.currentProgress);
            segmentsDiv.appendChild(segmentDiv);
        });
        
        bottleneckDiv.appendChild(headerDiv);
        bottleneckDiv.appendChild(segmentsDiv);
        
        return bottleneckDiv;
    }

    /**
     * 세그먼트 요소 생성
     */
    createSegmentElement(segment, currentProgress) {
        const segmentDiv = document.createElement('div');
        segmentDiv.className = 'segment';
        segmentDiv.dataset.segment = segment.id;
        
        // 활성/완료 상태 확인
        if (segment.id === currentProgress.currentSegment) {
            segmentDiv.classList.add('active');
        } else if (segment.completed) {
            segmentDiv.classList.add('completed');
        }
        
        // 세그먼트 점
        const dotDiv = document.createElement('div');
        dotDiv.className = 'segment-dot';
        
        // 세그먼트 레이블
        const labelDiv = document.createElement('div');
        labelDiv.className = 'segment-label';
        labelDiv.textContent = segment.name;
        
        segmentDiv.appendChild(dotDiv);
        segmentDiv.appendChild(labelDiv);
        
        return segmentDiv;
    }

    /**
     * 현재 위치 요소 생성
     */
    createCurrentPositionElement(currentProgress) {
        const positionDiv = document.createElement('div');
        positionDiv.className = 'current-position';
        
        const positionIndicator = document.createElement('div');
        positionIndicator.className = 'position-indicator';
        
        const bottleneckName = this.getBottleneckDisplayName(currentProgress.currentBottleneck);
        const segmentName = this.getSegmentDisplayName(currentProgress.currentSegment);
        positionIndicator.textContent = `현재 위치: ${bottleneckName} > ${segmentName}`;
        
        positionDiv.appendChild(positionIndicator);
        
        // 전체 진행률 표시
        const progressText = document.getElementById('total-progress');
        if (progressText) {
            progressText.textContent = `${currentProgress.totalProgress}%`;
        }
        
        return positionDiv;
    }

    /**
     * 병목 진행률 계산
     */
    calculateBottleneckProgress(bottleneckId, storyTimeline) {
        const segments = storyTimeline.segments.filter(seg => seg.parentBottleneck === bottleneckId);
        if (segments.length === 0) return 0;
        
        const completedSegments = segments.filter(seg => seg.completed).length;
        return Math.round((completedSegments / segments.length) * 100);
    }

    /**
     * 병목 사용 가능 여부 확인
     */
    isBottleneckAvailable(bottleneckId) {
        // MVP 단계에서는 기, 승만 사용 가능
        return ['gi', 'seung'].includes(bottleneckId);
    }

    /**
     * 스토리 정보 패널 업데이트
     */
    updateStoryInfoPanel() {
        const storyState = this.stateManager.getStoryState();
        const panel = document.getElementById('story-info-panel');
        if (!panel) return;
        
        panel.innerHTML = `
            <div class="info-item">
                <label>제목:</label>
                <span>${storyState.storyInfo.title || '미정의 스토리'}</span>
            </div>
            <div class="info-item">
                <label>주인공:</label>
                <span>${storyState.storyInfo.protagonist || '미정'}</span>
            </div>
            <div class="info-item">
                <label>테마:</label>
                <span>${storyState.storyInfo.theme || '미정'}</span>
            </div>
            <div class="info-item">
                <label>설명:</label>
                <p>${storyState.storyInfo.description || '아직 설명이 없습니다.'}</p>
            </div>
        `;
        
        // 변수 목록 업데이트
        this.updateVariablesList();
    }

    /**
     * 변수 목록 업데이트
     */
    updateVariablesList() {
        const variablesList = document.getElementById('variables-list');
        if (!variablesList) return;
        
        const storyVariables = this.stateManager.getStoryState().storyVariables;
        
        if (Object.keys(storyVariables).length === 0) {
            variablesList.innerHTML = '<div class="variable-item">아직 변수가 없습니다.</div>';
            return;
        }
        
        variablesList.innerHTML = '';
        Object.entries(storyVariables).forEach(([name, value]) => {
            const variableDiv = document.createElement('div');
            variableDiv.className = 'variable-item';
            variableDiv.innerHTML = `
                <span class="variable-name">${name}</span>
                <span class="variable-value">${value}</span>
            `;
            variablesList.appendChild(variableDiv);
        });
    }

    /**
     * 통계 업데이트
     */
    updateStatistics() {
        const stats = this.storyController.getStoryStatistics();
        
        const eventCount = document.getElementById('event-count');
        if (eventCount) {
            eventCount.textContent = stats.totalEvents;
        }
        
        const choiceCount = document.getElementById('choice-count');
        if (choiceCount) {
            choiceCount.textContent = stats.totalChoices;
        }
        
        const questionCount = document.getElementById('question-count');
        if (questionCount) {
            questionCount.textContent = stats.answeredQuestions;
        }
    }

    /**
     * 스토리 정보 섹션 표시
     */
    showStoryInfoSection() {
        const section = document.getElementById('story-info-section');
        if (section) {
            section.style.display = 'block';
        }
    }

    /**
     * 스토리 정보 섹션 숨기기
     */
    hideStoryInfoSection() {
        const section = document.getElementById('story-info-section');
        if (section) {
            section.style.display = 'none';
        }
    }

    /**
     * 질문 섹션 표시
     */
    showQuestionSection() {
        const section = document.getElementById('question-section');
        if (section) {
            section.style.display = 'block';
        }
    }

    /**
     * 질문 섹션 숨기기
     */
    hideQuestionSection() {
        const section = document.getElementById('question-section');
        if (section) {
            section.style.display = 'none';
        }
    }

    /**
     * 스토리 정보 모달 열기
     */
    openStoryInfoModal() {
        const modal = document.getElementById('story-info-modal');
        const overlay = document.getElementById('modal-overlay');
        const storyState = this.stateManager.getStoryState();
        
        if (modal && overlay) {
            // 폼에 현재 정보 채우기
            document.getElementById('edit-title').value = storyState.storyInfo.title || '';
            document.getElementById('edit-protagonist').value = storyState.storyInfo.protagonist || '';
            document.getElementById('edit-theme').value = storyState.storyInfo.theme || '';
            document.getElementById('edit-description').value = storyState.storyInfo.description || '';
            
            modal.style.display = 'block';
            overlay.style.display = 'flex';
        }
    }

    /**
     * 스토리 정보 모달 닫기
     */
    closeStoryInfoModal() {
        const modal = document.getElementById('story-info-modal');
        const overlay = document.getElementById('modal-overlay');
        
        if (modal && overlay) {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        }
    }

    /**
     * 모달에서 스토리 정보 저장
     */
    saveStoryInfoFromModal() {
        const title = document.getElementById('edit-title').value.trim();
        const protagonist = document.getElementById('edit-protagonist').value.trim();
        const theme = document.getElementById('edit-theme').value.trim();
        const description = document.getElementById('edit-description').value.trim();
        
        if (!title || !protagonist || !theme) {
            alert('제목, 주인공, 테마는 필수 항목입니다.');
            return;
        }
        
        // 상태 업데이트
        const storyState = this.stateManager.getStoryState();
        storyState.storyInfo.title = title;
        storyState.storyInfo.protagonist = protagonist;
        storyState.storyInfo.theme = theme;
        storyState.storyInfo.description = description;
        storyState.storyInfo.updatedAt = new Date().toISOString();
        
        // UI 업데이트
        this.updateStoryInfoPanel();
        
        // 모달 닫기
        this.closeStoryInfoModal();
    }

    /**
     * 모든 모달 닫기
     */
    closeAllModals() {
        this.closeStoryInfoModal();
    }

    /**
     * 프로젝트 다운로드
     */
    async downloadProject(projectFiles) {
        try {
            // JSZip 라이브러리 로드 확인
            if (typeof JSZip === 'undefined') {
                // 동적으로 JSZip 로드
                await this.loadJSZip();
            }
            
            // FileSaver.js 로드 확인
            if (typeof saveAs === 'undefined') {
                // 동적으로 FileSaver.js 로드
                await this.loadFileSaver();
            }
            
            const zip = new JSZip();
            
            // 파일들 ZIP에 추가
            projectFiles.forEach((content, path) => {
                zip.file(path, content);
            });
            
            // ZIP 생성 및 다운로드
            const storyState = this.stateManager.getStoryState();
            const blob = await zip.generateAsync({ type: 'blob' });
            
            saveAs(blob, `${storyState.storyInfo.title || 'story'}.zip`);
            
        } catch (error) {
            console.error('프로젝트 다운로드 실패:', error);
            throw new Error('프로젝트 다운로드에 실패했습니다: ' + error.message);
        }
    }

    /**
     * JSZip 라이브러리 동적 로드
     */
    async loadJSZip() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * FileSaver.js 라이브러리 동적 로드
     */
    async loadFileSaver() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * 선택지 아이콘 가져오기
     */
    getChoiceIcon(choice) {
        const icons = {
            '밝게': '☀️',
            '긴장': '⚡',
            '코믹': '😄',
            '진지': '🤔',
            '미스터리': '🔍',
            '로맨틱': '💕',
            '적극적으로': '🚀',
            '신중하게': '🤔',
            '소극적으로': '🐌',
            '창의적으로': '💡',
            '논리적으로': '🧮',
            '감정적으로': '❤️',
            '정중하게': '🙇',
            '친근하게': '🤝',
            '격식있게': '👔',
            '장난스럽게': '😜',
            '진지하게': '😐',
            '감동적으로': '😭'
        };
        
        return icons[choice] || '❓';
    }

    /**
     * 병목 표시 이름 가져오기
     */
    getBottleneckDisplayName(bottleneckId) {
        const names = {
            'gi': '기',
            'seung': '승',
            'ten': '전',
            'ketsu': '결'
        };
        return names[bottleneckId] || bottleneckId;
    }

    /**
     * 세그먼트 표시 이름 가져오기
     */
    getSegmentDisplayName(segmentId) {
        const names = {
            'gi_1': '일상 소개',
            'gi_2': '사건 발생',
            'seung_1': '갈등 시작',
            'seung_2': '첫 실패'
        };
        return names[segmentId] || segmentId;
    }
}