/**
 * TW 모델 질문 컨트롤러
 * AI 질문 생성 및 답변 처리를 관리
 */

import { ToneQuestionStrategy } from '../strategies/tone-question.js';
import { CharacterActionQuestionStrategy } from '../strategies/character-action-question.js';
import { DialogueStyleQuestionStrategy } from '../strategies/dialogue-style-question.js';
import { ContextAnalyzer } from './context-analyzer.js';
import { AIService } from '../services/ai-service.js';

/**
 * TW 질문 컨트롤러
 */
export class TWQuestionController {
    constructor() {
        this.questionStrategies = {
            'tone': new ToneQuestionStrategy(),
            'character_action': new CharacterActionQuestionStrategy(),
            'dialogue_style': new DialogueStyleQuestionStrategy()
        };
        
        this.contextAnalyzer = new ContextAnalyzer();
        this.aiService = new AIService();
        this.questionHistory = [];
        this.maxHistorySize = 100;
        
        // AI 서비스 초기화 (시뮬레이션 모드)
        this.aiService.configure({
            simulationMode: true
        });
    }

    /**
     * 컨텍스트에 맞는 질문 생성
     */
    async generateQuestion(context) {
        try {
            // 컨텍스트 분석
            const analyzedContext = this.contextAnalyzer.analyze(context);
            
            // AI 서비스를 통해 질문 생성
            const question = await this.aiService.generateQuestion(analyzedContext);
            
            // 질문 기록
            this.addToHistory(question);
            
            return question;
        } catch (error) {
            console.error('질문 생성 실패:', error);
            throw new Error('질문 생성에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 답변 처리
     */
    async processAnswer(question, answer) {
        try {
            const processedAnswer = {
                questionId: question.id,
                kind: question.kind,
                answer: answer,
                processedAt: new Date().toISOString(),
                context: question.context
            };
            
            return processedAnswer;
        } catch (error) {
            console.error('답변 처리 실패:', error);
            throw new Error('답변 처리에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 이벤트 생성
     */
    async generateEvent(question, processedAnswer) {
        try {
            // AI 서비스를 통해 이벤트 생성
            const event = await this.aiService.generateEvent(question, processedAnswer.answer);
            
            return event;
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
            // 선택지는 주로 승 병목에서 생성
            if (context.currentBottleneck !== 'seung') {
                return null;
            }
            
            const choiceData = {
                question: '이 상황에서 어떻게 하시겠습니까?',
                choices: [
                    {
                        label: '적극적으로 대처한다',
                        variable: 'personality',
                        value: 'active',
                        nextBottleneck: this.getNextBottleneck(context.currentBottleneck)
                    },
                    {
                        label: '신중하게 관망한다',
                        variable: 'personality',
                        value: 'cautious',
                        nextBottleneck: this.getNextBottleneck(context.currentBottleneck)
                    }
                ]
            };
            
            return choiceData;
        } catch (error) {
            console.error('선택지 생성 실패:', error);
            throw new Error('선택지 생성에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 다음 병목 가져오기
     */
    getNextBottleneck(currentBottleneck) {
        const bottleneckOrder = ['gi', 'seung', 'ten', 'ketsu'];
        const currentIndex = bottleneckOrder.indexOf(currentBottleneck);
        
        if (currentIndex < bottleneckOrder.length - 1) {
            return bottleneckOrder[currentIndex + 1];
        }
        
        return 'ketsu'; // 기본값
    }

    /**
     * 질문 기록에 추가
     */
    addToHistory(question) {
        this.questionHistory.push(question);
        
        // 기록 크기 제한
        if (this.questionHistory.length > this.maxHistorySize) {
            this.questionHistory.shift();
        }
    }

    /**
     * 질문 기록 가져오기
     */
    getQuestion(questionId) {
        return this.questionHistory.find(q => q.id === questionId);
    }

    /**
     * 최근 질문들 가져오기
     */
    getRecentQuestions(count = 5) {
        return this.questionHistory.slice(-count);
    }

    /**
     * 특정 유형의 질문들 가져오기
     */
    getQuestionsByKind(kind) {
        return this.questionHistory.filter(q => q.kind === kind);
    }

    /**
     * 답변된 질문들 가져오기
     */
    getAnsweredQuestions() {
        return this.questionHistory.filter(q => q.answer);
    }

    /**
     * 답변되지 않은 질문들 가져오기
     */
    getUnansweredQuestions() {
        return this.questionHistory.filter(q => !q.answer);
    }

    /**
     * 질문 통계 가져오기
     */
    getQuestionStatistics() {
        const total = this.questionHistory.length;
        const answered = this.questionHistory.filter(q => q.answer).length;
        const unanswered = total - answered;
        
        const kindStats = {};
        this.questionHistory.forEach(q => {
            kindStats[q.kind] = (kindStats[q.kind] || 0) + 1;
        });
        
        return {
            total,
            answered,
            unanswered,
            byKind: kindStats,
            answerRate: total > 0 ? Math.round((answered / total) * 100) : 0
        };
    }

    /**
     * 질문 전략 추가
     */
    addQuestionStrategy(type, strategy) {
        this.questionStrategies[type] = strategy;
    }

    /**
     * 질문 전략 제거
     */
    removeQuestionStrategy(type) {
        delete this.questionStrategies[type];
    }

    /**
     * 사용 가능한 질문 유형 가져오기
     */
    getAvailableQuestionTypes() {
        return Object.keys(this.questionStrategies);
    }

    /**
     * AI 서비스 설정
     */
    configureAIService(config) {
        this.aiService.configure(config);
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
    }

    /**
     * 질문 유효성 검사
     */
    validateQuestion(question) {
        if (!question || typeof question !== 'object') {
            return { valid: false, message: '질문은 객체여야 합니다.' };
        }
        
        if (!question.id || typeof question.id !== 'string') {
            return { valid: false, message: '질문 ID는 문자열이어야 합니다.' };
        }
        
        if (!question.kind || !this.questionStrategies[question.kind]) {
            return { valid: false, message: '유효하지 않은 질문 유형입니다.' };
        }
        
        if (!question.ask || typeof question.ask !== 'string') {
            return { valid: false, message: '질문 내용은 문자열이어야 합니다.' };
        }
        
        if (!Array.isArray(question.choices) || question.choices.length === 0) {
            return { valid: false, message: '선택지는 비어있지 않은 배열이어야 합니다.' };
        }
        
        return { valid: true, message: '유효한 질문입니다.' };
    }

    /**
     * 답변 유효성 검사
     */
    validateAnswer(question, answer) {
        if (!question || !answer) {
            return { valid: false, message: '질문과 답변은 필수입니다.' };
        }
        
        if (!question.choices.includes(answer)) {
            return { valid: false, message: '유효하지 않은 답변입니다.' };
        }
        
        return { valid: true, message: '유효한 답변입니다.' };
    }

    /**
     * 질문 템플릿 생성
     */
    generateQuestionTemplate(kind, customizations = {}) {
        const strategy = this.questionStrategies[kind];
        if (!strategy) {
            throw new Error(`질문 전략을 찾을 수 없습니다: ${kind}`);
        }
        
        const baseTemplate = {
            id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            kind: kind,
            ask: '',
            choices: [],
            context: {},
            timestamp: new Date().toISOString()
        };
        
        return { ...baseTemplate, ...customizations };
    }

    /**
     * 질문 히스토리 내보내기
     */
    exportHistory() {
        return {
            questions: this.questionHistory,
            statistics: this.getQuestionStatistics(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * 질문 히스토리 가져오기
     */
    importHistory(data) {
        if (!data || !Array.isArray(data.questions)) {
            throw new Error('유효하지 않은 질문 히스토리 데이터입니다.');
        }
        
        // 질문 유효성 검사
        const validQuestions = data.questions.filter(q => {
            const validation = this.validateQuestion(q);
            return validation.valid;
        });
        
        this.questionHistory = validQuestions;
        
        return {
            imported: validQuestions.length,
            total: data.questions.length,
            invalid: data.questions.length - validQuestions.length
        };
    }

    /**
     * 상태 초기화
     */
    reset() {
        this.questionHistory = [];
        this.aiService.setSimulationMode(true);
    }
}