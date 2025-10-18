/**
 * TW 모델 스토리 컨트롤러
 * 스토리 생성 흐름을 제어하는 메인 컨트롤러
 */

import { TWFlowController } from '../utils/flow-controller.js';
import { TWQuestionController } from '../utils/question-controller.js';
import { TWTemplateEngine } from '../services/template-engine.js';
import { TWRPYGenerator } from '../services/rpy-generator.js';
import { ValidationService } from '../services/validation-service.js';
import { AIService } from '../services/ai-service.js';

/**
 * TW 스토리 컨트롤러
 */
export class TWStoryController {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.flowController = new TWFlowController();
        this.questionController = new TWQuestionController();
        this.templateEngine = new TWTemplateEngine();
        this.validationService = new ValidationService();
        this.rpyGenerator = new TWRPYGenerator();
        this.aiService = new AIService();
        
        this.currentView = 'story-input'; // story-input, timeline, preview
        
        // AI 서비스 초기화 (시뮬레이션 모드)
        this.aiService.configure({
            simulationMode: true
        });
    }

    /**
     * 스토리 초기화
     */
    async initializeStory(storyInfo) {
        if (!this.validationService.validateStoryInfo(storyInfo)) {
            throw new Error('스토리 정보가 유효하지 않습니다.');
        }
        
        this.stateManager.initializeStoryState(storyInfo);
        this.flowController.setCurrentPosition('gi', 'gi_1');
        
        return this.stateManager.getStoryState();
    }

    /**
     * AI 질문 생성 요청
     */
    async generateQuestion(context) {
        try {
            const question = await this.questionController.generateQuestion(context);
            this.stateManager.addQuestion(question);
            
            return {
                question: question,
                currentPosition: this.flowController.getCurrentPosition()
            };
        } catch (error) {
            console.error('질문 생성 실패:', error);
            throw new Error('질문 생성에 실패했습니다: ' + error.message);
        }
    }

    /**
     * AI 답변 처리
     */
    async processAnswer(questionId, answer) {
        try {
            const question = this.stateManager.getQuestion(questionId);
            if (!question) {
                throw new Error(`질문을 찾을 수 없습니다: ${questionId}`);
            }
            
            // 답변 처리
            const processedAnswer = await this.questionController.processAnswer(question, answer);
            
            // 이벤트 생성
            const event = await this.generateEventFromAnswer(question, processedAnswer);
            
            // 다음 위치로 이동
            const nextPosition = this.flowController.moveToNext();
            
            // 현재 위치 업데이트
            this.stateManager.updateCurrentPosition({
                currentBottleneck: nextPosition.data?.bottleneck || this.flowController.getCurrentPosition().bottleneck,
                currentSegment: nextPosition.data?.segment || this.flowController.getCurrentPosition().segment,
                currentNode: nextPosition.data?.node || null
            });
            
            return {
                question: question,
                processedAnswer: processedAnswer,
                event: event,
                nextPosition: nextPosition,
                storyProgress: this.stateManager.getStoryProgress()
            };
        } catch (error) {
            console.error('답변 처리 실패:', error);
            throw new Error('답변 처리에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 선택 노드 처리
     */
    async processChoice(choiceNodeId, choiceIndex) {
        try {
            const choiceNode = this.stateManager.getChoiceNodes().find(c => c.id === choiceNodeId);
            if (!choiceNode) {
                throw new Error(`선택 노드를 찾을 수 없습니다: ${choiceNodeId}`);
            }
            
            const selectedChoice = choiceNode.choices[choiceIndex];
            if (!selectedChoice) {
                throw new Error(`선택지를 찾을 수 없습니다: ${choiceIndex}`);
            }
            
            // 변수 설정
            this.stateManager.setVariable(selectedChoice.variable, selectedChoice.value);
            
            // 다음 병목으로 수렴
            const nextPosition = this.flowController.convergeToBottleneck(selectedChoice.nextBottleneck);
            
            // 선택 노드 완료 처리
            choiceNode.completed = true;
            this.stateManager.updateNode(choiceNodeId, choiceNode);
            
            // 현재 위치 업데이트
            this.stateManager.updateCurrentPosition({
                currentBottleneck: nextPosition.data.bottleneck,
                currentSegment: nextPosition.data.segment,
                currentNode: null
            });
            
            return {
                result: 'success',
                nextPosition: nextPosition,
                storyProgress: this.stateManager.getStoryProgress()
            };
        } catch (error) {
            console.error('선택 처리 실패:', error);
            throw new Error('선택 처리에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 다음 단계로 이동
     */
    async moveToNext() {
        try {
            const nextPosition = this.flowController.moveToNext();
            
            if (nextPosition.type === 'completed') {
                return { type: 'completed', message: '모든 스토리가 완료되었습니다.' };
            } else {
                // 다음 질문 생성을 위한 컨텍스트 준비
                const context = {
                    currentBottleneck: nextPosition.data?.bottleneck || this.flowController.getCurrentPosition().bottleneck,
                    currentSegment: nextPosition.data?.segment || this.flowController.getCurrentPosition().segment,
                    recentAnswers: this.stateManager.getRecentAnswers(),
                    storyVariables: this.stateManager.getStoryState().storyVariables
                };
                
                // 다음 질문 생성
                const questionResult = await this.generateQuestion(context);
                
                return {
                    type: 'question',
                    question: questionResult.question,
                    position: nextPosition
                };
            }
        } catch (error) {
            console.error('다음 단계 이동 실패:', error);
            throw new Error('다음 단계 이동에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 답변 기반 이벤트 생성
     */
    async generateEventFromAnswer(question, processedAnswer) {
        try {
            const event = await this.questionController.generateEvent(question, processedAnswer);
            
            // 이벤트 데이터 보강
            const enhancedEvent = {
                ...event,
                id: `event_${Date.now()}`,
                parentSegment: this.flowController.getCurrentPosition().segment,
                questionId: question.id,
                answer: processedAnswer.answer,
                createdAt: new Date().toISOString()
            };
            
            // 이벤트 저장
            this.stateManager.addEvent(enhancedEvent);
            
            return enhancedEvent;
        } catch (error) {
            console.error('이벤트 생성 실패:', error);
            throw new Error('이벤트 생성에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 선택지 생성
     */
    async generateChoice(context) {
        try {
            const choiceData = await this.questionController.generateChoice(context);
            
            // 선택지 데이터 보강
            const enhancedChoice = {
                ...choiceData,
                id: `choice_${Date.now()}`,
                parentSegment: this.flowController.getCurrentPosition().segment,
                createdAt: new Date().toISOString()
            };
            
            // 선택지 저장
            this.stateManager.addChoiceNode(enhancedChoice);
            
            return enhancedChoice;
        } catch (error) {
            console.error('선택지 생성 실패:', error);
            throw new Error('선택지 생성에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 스토리 타임라인 가져오기
     */
    getStoryTimeline() {
        return {
            bottlenecks: this.stateManager.getBottlenecks(),
            segments: this.stateManager.getSegments(),
            events: this.stateManager.getEvents(),
            choices: this.stateManager.getChoiceNodes(),
            currentProgress: this.flowController.getCurrentPosition()
        };
    }

    /**
     * RPY 파일 생성 요청
     */
    async generateRPY() {
        try {
            const storyState = this.stateManager.getStoryState();
            const projectFiles = await this.rpyGenerator.generate(storyState);
            
            return projectFiles;
        } catch (error) {
            console.error('RPY 생성 실패:', error);
            throw new Error('RPY 생성에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 스토리 상태 저장
     */
    async saveStoryState() {
        return await this.stateManager.saveToLocalStorage();
    }

    /**
     * 스토리 상태 로드
     */
    async loadStoryState() {
        return await this.stateManager.loadFromLocalStorage();
    }

    /**
     * 스토리 상태 내보내기
     */
    exportStoryState() {
        return this.stateManager.exportToJSON();
    }

    /**
     * 스토리 상태 가져오기
     */
    importStoryState(jsonString) {
        return this.stateManager.importFromJSON(jsonString);
    }

    /**
     * 최근 답변들 가져오기
     */
    getRecentAnswers(count = 5) {
        return this.stateManager.getRecentAnswers(count);
    }

    /**
     * 스토리 진행률 가져오기
     */
    getStoryProgress() {
        return this.stateManager.getStoryProgress();
    }

    /**
     * 현재 위치 가져오기
     */
    getCurrentPosition() {
        return this.flowController.getCurrentPosition();
    }

    /**
     * 상태 되돌리기
     */
    undo() {
        return this.stateManager.undoState();
    }

    /**
     * 스토리 리셋
     */
    resetStory() {
        this.stateManager.resetState();
        this.flowController.setCurrentPosition(null, null);
        this.questionController.reset();
    }

    /**
     * 자동 저장 활성화/비활성화
     */
    setAutoSaveEnabled(enabled) {
        this.stateManager.autoSaveEnabled = enabled;
        this.stateManager.storyState.metadata.autoSaveEnabled = enabled;
    }

    /**
     * AI 서비스 설정
     */
    configureAIService(config) {
        this.aiService.configure(config);
        this.questionController.configureAIService(config);
    }

    /**
     * AI 서비스 상태 확인
     */
    async checkAIServiceStatus() {
        return await this.aiService.checkAPIStatus();
    }

    /**
     * 시뮬레이션 모드 설정
     */
    setSimulationMode(enabled) {
        this.aiService.setSimulationMode(enabled);
        this.questionController.setSimulationMode(enabled);
    }

    /**
     * 스토리 유효성 검사
     */
    validateStory() {
        const storyState = this.stateManager.getStoryState();
        
        // 기본 정보 검사
        if (!storyState.storyInfo.title || !storyState.storyInfo.protagonist) {
            return { valid: false, message: '스토리 기본 정보가 incomplete 합니다.' };
        }
        
        // 최소한의 이벤트 검사
        if (storyState.eventNodes.length === 0) {
            return { valid: false, message: '최소한 하나의 이벤트가 필요합니다.' };
        }
        
        // 현재 위치 검사
        if (!storyState.currentProgress.currentBottleneck) {
            return { valid: false, message: '현재 위치가 설정되지 않았습니다.' };
        }
        
        return { valid: true, message: '스토리가 유효합니다.' };
    }

    /**
     * 스토리 통계 정보
     */
    getStoryStatistics() {
        const storyState = this.stateManager.getStoryState();
        
        return {
            totalEvents: storyState.eventNodes.length,
            completedEvents: storyState.eventNodes.filter(e => e.completed).length,
            totalChoices: storyState.choiceNodes.length,
            completedChoices: storyState.choiceNodes.filter(c => c.completed).length,
            totalQuestions: storyState.aiQuestions.length,
            answeredQuestions: storyState.aiQuestions.filter(q => q.answer).length,
            variablesCount: Object.keys(storyState.storyVariables).length,
            progress: this.stateManager.getStoryProgress().totalProgress,
            createdAt: storyState.storyInfo.createdAt,
            updatedAt: storyState.storyInfo.updatedAt
        };
    }
}