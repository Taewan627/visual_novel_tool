/**
 * TW 모델 상태 관리자
 * JSON 기반 상태 저장 및 관리
 */

/**
 * TW 스토리 상태 관리자
 */
export class TWStateManager {
    constructor() {
        this.storyState = this.initializeEmptyState();
        this.stateHistory = [];
        this.maxHistorySize = 50;
        this.autoSaveEnabled = true;
        this.lastSaveTime = null;
    }

    /**
     * 빈 상태 초기화
     */
    initializeEmptyState() {
        return {
            // 스토리 기본 정보
            storyInfo: {
                title: "",
                protagonist: "",
                theme: "",
                description: "",
                createdAt: null,
                updatedAt: null
            },
            
            // 메인 병목씬 정의
            mainBottlenecks: {
                gi: {
                    id: "gi",
                    name: "기",
                    description: "서론 및 설정",
                    completed: false,
                    startedAt: null,
                    completedAt: null,
                    segments: []
                },
                seung: {
                    id: "seung",
                    name: "승",
                    description: "갈등 및 대립",
                    completed: false,
                    startedAt: null,
                    completedAt: null,
                    segments: []
                },
                ten: {
                    id: "ten",
                    name: "전",
                    description: "절정 및 위기",
                    completed: false,
                    startedAt: null,
                    completedAt: null,
                    segments: []
                },
                ketsu: {
                    id: "ketsu",
                    name: "결",
                    description: "결말 및 해결",
                    completed: false,
                    startedAt: null,
                    completedAt: null,
                    segments: []
                }
            },
            
            // 세그먼트 병목 정의
            segmentBottlenecks: [],
            
            // 이벤트 노드 정의
            eventNodes: [],
            
            // 선택 노드 정의
            choiceNodes: [],
            
            // AI 질문 기록
            aiQuestions: [],
            
            // 스토리 변수
            storyVariables: {},
            
            // 현재 진행 상태
            currentProgress: {
                currentBottleneck: null,
                currentSegment: null,
                currentNode: null,
                completedNodes: [],
                totalProgress: 0
            },
            
            // 메타데이터
            metadata: {
                version: "1.0.0",
                lastSaved: null,
                autoSaveEnabled: true,
                exportFormat: "tw-story"
            }
        };
    }

    /**
     * 스토리 상태 초기화
     */
    initializeStoryState(storyInfo) {
        this.storyState.storyInfo = {
            ...storyInfo,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // 기본 세그먼트 병목 생성
        this.createDefaultSegments();
        
        // 현재 위치 설정
        this.storyState.currentProgress.currentBottleneck = "gi";
        this.storyState.currentProgress.currentSegment = "gi_1";
        
        this.saveStateToHistory();
        
        if (this.autoSaveEnabled) {
            this.scheduleAutoSave();
        }
        
        return this.storyState;
    }

    /**
     * 기본 세그먼트 병목 생성
     */
    createDefaultSegments() {
        // 기(Setup) 병목의 세그먼트
        this.addSegment({
            id: "gi_1",
            parentBottleneck: "gi",
            name: "일상 소개",
            description: "주인공의 일상 생활 소개",
            order: 1
        });
        
        this.addSegment({
            id: "gi_2",
            parentBottleneck: "gi",
            name: "사건 발생",
            description: "중요한 사건이 발생",
            order: 2
        });
        
        // 승(Confrontation) 병목의 세그먼트
        this.addSegment({
            id: "seung_1",
            parentBottleneck: "seung",
            name: "갈등 시작",
            description: "주요 갈등이 시작됨",
            order: 1
        });
        
        this.addSegment({
            id: "seung_2",
            parentBottleneck: "seung",
            name: "첫 실패",
            description: "주인공이 첫 번째 실패를 겪음",
            order: 2
        });
        
        // MVP 단계에서는 전과 결은 확장 포인트로 남겨둠
    }

    /**
     * 세그먼트 추가
     */
    addSegment(segmentData) {
        const segment = {
            ...segmentData,
            completed: false,
            startedAt: null,
            completedAt: null,
            events: [],
            createdAt: new Date().toISOString()
        };
        
        this.storyState.segmentBottlenecks.push(segment);
        
        // 부모 병목에 세그먼트 추가
        const parentBottleneck = this.storyState.mainBottlenecks[segment.parentBottleneck];
        if (parentBottleneck) {
            parentBottleneck.segments.push(segment.id);
        }
        
        this.scheduleAutoSave();
        return segment;
    }

    /**
     * 이벤트 노드 추가
     */
    addEvent(eventData) {
        const event = {
            ...eventData,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.storyState.eventNodes.push(event);
        
        // 부모 세그먼트에 이벤트 추가
        const parentSegment = this.storyState.segmentBottlenecks.find(
            seg => seg.id === eventData.parentSegment
        );
        
        if (parentSegment) {
            parentSegment.events.push(event.id);
        }
        
        this.saveStateToHistory();
        this.scheduleAutoSave();
        return event;
    }

    /**
     * 선택 노드 추가
     */
    addChoiceNode(choiceData) {
        const choice = {
            ...choiceData,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.storyState.choiceNodes.push(choice);
        
        // 부모 세그먼트에 선택 노드 추가
        const parentSegment = this.storyState.segmentBottlenecks.find(
            seg => seg.id === choiceData.parentSegment
        );
        
        if (parentSegment) {
            parentSegment.events.push(choice.id);
        }
        
        this.saveStateToHistory();
        this.scheduleAutoSave();
        return choice;
    }

    /**
     * AI 질문 추가
     */
    addQuestion(questionData) {
        const question = {
            ...questionData,
            createdAt: new Date().toISOString()
        };
        
        this.storyState.aiQuestions.push(question);
        this.saveStateToHistory();
        this.scheduleAutoSave();
        return question;
    }

    /**
     * 스토리 변수 설정
     */
    setVariable(name, value) {
        this.storyState.storyVariables[name] = value;
        this.storyState.storyInfo.updatedAt = new Date().toISOString();
        this.saveStateToHistory();
        this.scheduleAutoSave();
    }

    /**
     * 노드 업데이트
     */
    updateNode(nodeId, nodeData) {
        const eventType = this.determineNodeType(nodeId);
        
        switch (eventType) {
            case 'event':
                const eventIndex = this.storyState.eventNodes.findIndex(e => e.id === nodeId);
                if (eventIndex !== -1) {
                    this.storyState.eventNodes[eventIndex] = {
                        ...this.storyState.eventNodes[eventIndex],
                        ...nodeData,
                        updatedAt: new Date().toISOString()
                    };
                }
                break;
                
            case 'choice':
                const choiceIndex = this.storyState.choiceNodes.findIndex(c => c.id === nodeId);
                if (choiceIndex !== -1) {
                    this.storyState.choiceNodes[choiceIndex] = {
                        ...this.storyState.choiceNodes[choiceIndex],
                        ...nodeData,
                        updatedAt: new Date().toISOString()
                    };
                }
                break;
        }
        
        this.saveStateToHistory();
        this.scheduleAutoSave();
    }

    /**
     * 노드 타입 결정
     */
    determineNodeType(nodeId) {
        if (this.storyState.eventNodes.find(e => e.id === nodeId)) {
            return 'event';
        }
        if (this.storyState.choiceNodes.find(c => c.id === nodeId)) {
            return 'choice';
        }
        return 'unknown';
    }

    /**
     * 현재 위치 업데이트
     */
    updateCurrentPosition(position) {
        this.storyState.currentProgress = {
            ...this.storyState.currentProgress,
            ...position,
            updatedAt: new Date().toISOString()
        };
        
        this.calculateTotalProgress();
        this.saveStateToHistory();
        this.scheduleAutoSave();
    }

    /**
     * 전체 진행률 계산
     */
    calculateTotalProgress() {
        const totalNodes = this.storyState.eventNodes.length + this.storyState.choiceNodes.length;
        const completedNodes = this.storyState.eventNodes.filter(e => e.completed).length + 
                              this.storyState.choiceNodes.filter(c => c.completed).length;
        
        this.storyState.currentProgress.totalProgress = totalNodes > 0 ? 
            Math.round((completedNodes / totalNodes) * 100) : 0;
    }

    /**
     * 상태 기록 저장
     */
    saveStateToHistory() {
        const stateSnapshot = JSON.parse(JSON.stringify(this.storyState));
        this.stateHistory.push(stateSnapshot);
        
        // 기록 크기 제한
        if (this.stateHistory.length > this.maxHistorySize) {
            this.stateHistory.shift();
        }
    }

    /**
     * 상태 되돌리기
     */
    undoState() {
        if (this.stateHistory.length > 1) {
            this.stateHistory.pop(); // 현재 상태 제거
            this.storyState = JSON.parse(JSON.stringify(this.stateHistory[this.stateHistory.length - 1]));
            this.scheduleAutoSave();
            return true;
        }
        return false;
    }

    /**
     * 자동 저장 스케줄
     */
    scheduleAutoSave() {
        if (!this.autoSaveEnabled) return;
        
        // 이전 자동 저장 취소
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        // 1초 후 자동 저장
        this.autoSaveTimeout = setTimeout(() => {
            this.saveToLocalStorage();
        }, 1000);
    }

    /**
     * 로컬 스토리지에 저장
     */
    async saveToLocalStorage() {
        try {
            localStorage.setItem('twStoryState', JSON.stringify(this.storyState));
            this.storyState.metadata.lastSaved = new Date().toISOString();
            this.lastSaveTime = new Date();
            return true;
        } catch (error) {
            console.error('로컬 스토리지 저장 실패:', error);
            return false;
        }
    }

    /**
     * 로컬 스토리지에서 로드
     */
    async loadFromLocalStorage() {
        try {
            const savedState = localStorage.getItem('twStoryState');
            if (savedState) {
                this.storyState = JSON.parse(savedState);
                this.stateHistory = [JSON.parse(JSON.stringify(this.storyState))];
                return true;
            }
            return false;
        } catch (error) {
            console.error('로컬 스토리지 로드 실패:', error);
            return false;
        }
    }

    /**
     * JSON으로 내보내기
     */
    exportToJSON() {
        return JSON.stringify(this.storyState, null, 2);
    }

    /**
     * JSON에서 가져오기
     */
    importFromJSON(jsonString) {
        try {
            const importedState = JSON.parse(jsonString);
            
            // 기본 유효성 검사
            if (this.validateStoryState(importedState)) {
                this.storyState = importedState;
                this.stateHistory = [JSON.parse(JSON.stringify(this.storyState))];
                this.scheduleAutoSave();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('JSON 가져오기 실패:', error);
            return false;
        }
    }

    /**
     * 스토리 상태 유효성 검사
     */
    validateStoryState(state) {
        return state && 
               state.storyInfo && 
               state.mainBottlenecks && 
               state.segmentBottlenecks &&
               state.eventNodes &&
               state.choiceNodes &&
               state.aiQuestions;
    }

    /**
     * 저장되지 않은 변경사항 확인
     */
    hasUnsavedChanges() {
        return this.lastSaveTime && 
               new Date(this.storyState.storyInfo.updatedAt) > this.lastSaveTime;
    }

    /**
     * Getter 메서드들
     */
    getStoryState() {
        return this.storyState;
    }

    getBottlenecks() {
        return this.storyState.mainBottlenecks;
    }

    getSegments() {
        return this.storyState.segmentBottlenecks;
    }

    getEvents() {
        return this.storyState.eventNodes;
    }

    getChoiceNodes() {
        return this.storyState.choiceNodes;
    }

    getQuestion(questionId) {
        return this.storyState.aiQuestions.find(q => q.id === questionId);
    }

    getRecentAnswers(count = 5) {
        return this.storyState.aiQuestions
            .filter(q => q.answer)
            .slice(-count);
    }

    getStoryProgress() {
        this.calculateTotalProgress();
        return {
            currentBottleneck: this.storyState.currentProgress.currentBottleneck,
            currentSegment: this.storyState.currentProgress.currentSegment,
            currentNode: this.storyState.currentProgress.currentNode,
            totalProgress: this.storyState.currentProgress.totalProgress,
            completedNodes: this.storyState.currentProgress.completedNodes
        };
    }

    /**
     * 상태 초기화
     */
    resetState() {
        this.storyState = this.initializeEmptyState();
        this.stateHistory = [];
        this.lastSaveTime = null;
        
        // 로컬 스토리지에서도 제거
        localStorage.removeItem('twStoryState');
    }
}