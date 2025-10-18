/**
 * TW 모델 컨텍스트 분석기
 * 스토리 컨텍스트를 분석하여 질문 생성에 필요한 정보 제공
 */

/**
 * TW 컨텍스트 분석기
 */
export class ContextAnalyzer {
    constructor() {
        this.bottleneckComplexity = {
            'gi': 1,
            'seung': 2,
            'ten': 3,
            'ketsu': 2
        };
        
        this.toneMapping = {
            '밝게': 'positive',
            '긴장': 'tense',
            '코믹': 'humorous',
            '진지': 'serious',
            '미스터리': 'mysterious',
            '로맨틱': 'romantic'
        };
        
        this.actionMapping = {
            '적극적으로': 'proactive',
            '신중하게': 'cautious',
            '소극적으로': 'passive',
            '창의적으로': 'creative',
            '논리적으로': 'logical',
            '감정적으로': 'emotional'
        };
        
        this.dialogueMapping = {
            '정중하게': 'formal',
            '친근하게': 'casual',
            '격식있게': 'official',
            '장난스럽게': 'playful',
            '진지하게': 'serious',
            '감동적으로': 'emotional'
        };
    }

    /**
     * 컨텍스트 분석
     */
    analyze(context) {
        return {
            ...context,
            analyzedAt: new Date().toISOString(),
            complexity: this.calculateComplexity(context),
            emotionalTone: this.analyzeEmotionalTone(context),
            storyPhase: this.determineStoryPhase(context),
            characterDevelopment: this.analyzeCharacterDevelopment(context),
            narrativeStyle: this.analyzeNarrativeStyle(context),
            conflictLevel: this.analyzeConflictLevel(context),
            pacing: this.analyzePacing(context)
        };
    }

    /**
     * 컨텍스트 복잡도 계산
     */
    calculateComplexity(context) {
        let complexity = 1;
        
        // 병목 단계별 복잡도
        complexity += this.bottleneckComplexity[context.currentBottleneck] || 1;
        
        // 생성된 이벤트 수에 따른 복잡도
        complexity += Math.min(context.eventCount || 0, 5) * 0.2;
        
        // 선택지 수에 따른 복잡도
        complexity += Math.min(context.choiceCount || 0, 3) * 0.3;
        
        // 변수 수에 따른 복잡도
        complexity += Math.min(Object.keys(context.storyVariables || {}).length, 5) * 0.1;
        
        return Math.round(complexity * 10) / 10; // 소수점 한 자리까지
    }

    /**
     * 감정 톤 분석
     */
    analyzeEmotionalTone(context) {
        const recentAnswers = context.recentAnswers || [];
        const toneAnswers = recentAnswers.filter(answer => answer.kind === 'tone');
        
        if (toneAnswers.length === 0) {
            return 'neutral';
        }
        
        // 가장 최근 톤 답변 반환
        const latestToneAnswer = toneAnswers[toneAnswers.length - 1];
        return this.toneMapping[latestToneAnswer.answer] || 'neutral';
    }

    /**
     * 스토리 단계 결정
     */
    determineStoryPhase(context) {
        const { currentBottleneck, currentSegment } = context;
        
        // 병목 이름을 한국어로 변환
        const bottleneckNames = {
            'gi': '기',
            'seung': '승',
            'ten': '전',
            'ketsu': '결'
        };
        
        const segmentNames = {
            'gi_1': '일상 소개',
            'gi_2': '사건 발생',
            'seung_1': '갈등 시작',
            'seung_2': '첫 실패',
            'ten_1': '절정',
            'ketsu_1': '결말'
        };
        
        return {
            bottleneck: bottleneckNames[currentBottleneck] || currentBottleneck,
            segment: segmentNames[currentSegment] || currentSegment,
            full: `${bottleneckNames[currentBottleneck] || currentBottleneck} > ${segmentNames[currentSegment] || currentSegment}`
        };
    }

    /**
     * 캐릭터 발전 분석
     */
    analyzeCharacterDevelopment(context) {
        const actionAnswers = context.recentAnswers?.filter(answer => answer.kind === 'character_action') || [];
        
        if (actionAnswers.length === 0) {
            return 'unknown';
        }
        
        // 캐릭터 행동 패턴 분석
        const actionCounts = {};
        actionAnswers.forEach(answer => {
            actionCounts[answer.answer] = (actionCounts[answer.answer] || 0) + 1;
        });
        
        // 가장 빈번한 행동 패턴 반환
        const mostFrequentAction = Object.keys(actionCounts).reduce((a, b) => 
            actionCounts[a] > actionCounts[b] ? a : b
        );
        
        return this.actionMapping[mostFrequentAction] || 'unknown';
    }

    /**
     * 내레이티브 스타일 분석
     */
    analyzeNarrativeStyle(context) {
        const dialogueAnswers = context.recentAnswers?.filter(answer => answer.kind === 'dialogue_style') || [];
        
        if (dialogueAnswers.length === 0) {
            return 'neutral';
        }
        
        // 가장 최근 대화 스타일 답변 반환
        const latestDialogueAnswer = dialogueAnswers[dialogueAnswers.length - 1];
        return this.dialogueMapping[latestDialogueAnswer.answer] || 'neutral';
    }

    /**
     * 갈등 수준 분석
     */
    analyzeConflictLevel(context) {
        const { currentBottleneck, storyVariables } = context;
        
        // 병목별 기본 갈등 수준
        const baseConflictLevel = {
            'gi': 1,
            'seung': 3,
            'ten': 5,
            'ketsu': 2
        };
        
        let conflictLevel = baseConflictLevel[currentBottleneck] || 1;
        
        // 캐릭터 성향에 따른 갈등 수준 조정
        if (storyVariables?.personality === 'active') {
            conflictLevel += 1;
        } else if (storyVariables?.personality === 'cautious') {
            conflictLevel -= 0.5;
        }
        
        // 감정 톤에 따른 갈등 수준 조정
        const emotionalTone = this.analyzeEmotionalTone(context);
        if (emotionalTone === 'tense') {
            conflictLevel += 1;
        } else if (emotionalTone === 'humorous') {
            conflictLevel -= 0.5;
        }
        
        return Math.max(1, Math.min(5, Math.round(conflictLevel)));
    }

    /**
     * 페이싱 분석
     */
    analyzePacing(context) {
        const { currentBottleneck, eventCount, choiceCount } = context;
        
        // 병목별 기본 페이싱
        const basePacing = {
            'gi': 'slow',
            'seung': 'medium',
            'ten': 'fast',
            'ketsu': 'slow'
        };
        
        let pacing = basePacing[currentBottleneck] || 'medium';
        
        // 이벤트 수에 따른 페이싱 조정
        if (eventCount > 3) {
            pacing = 'fast';
        } else if (eventCount < 1) {
            pacing = 'slow';
        }
        
        // 선택지 수에 따른 페이싱 조정
        if (choiceCount > 2) {
            pacing = 'medium';
        }
        
        return pacing;
    }

    /**
     * 질문 유형 추천
     */
    recommendQuestionType(context) {
        const { currentBottleneck, emotionalTone, conflictLevel, pacing } = context;
        
        // 병목별 추천 질문 유형
        const bottleneckRecommendations = {
            'gi': ['tone', 'character_action', 'dialogue_style'],
            'seung': ['character_action', 'dialogue_style', 'tone'],
            'ten': ['tone', 'character_action', 'dialogue_style'],
            'ketsu': ['dialogue_style', 'tone', 'character_action']
        };
        
        let recommendations = bottleneckRecommendations[currentBottleneck] || ['tone'];
        
        // 감정 톤에 따른 조정
        if (emotionalTone === 'tense' && conflictLevel >= 4) {
            recommendations = ['character_action', 'tone'];
        } else if (emotionalTone === 'humorous') {
            recommendations = ['dialogue_style', 'tone'];
        }
        
        // 페이싱에 따른 조정
        if (pacing === 'fast') {
            recommendations = ['character_action'];
        } else if (pacing === 'slow') {
            recommendations = ['tone', 'dialogue_style'];
        }
        
        return recommendations;
    }

    /**
     * 컨텍스트 요약 생성
     */
    generateContextSummary(context) {
        const storyPhase = this.determineStoryPhase(context);
        const emotionalTone = this.analyzeEmotionalTone(context);
        const conflictLevel = this.analyzeConflictLevel(context);
        const pacing = this.analyzePacing(context);
        
        return {
            phase: storyPhase.full,
            tone: emotionalTone,
            conflict: conflictLevel,
            pacing: pacing,
            complexity: this.calculateComplexity(context)
        };
    }

    /**
     * 컨텍스트 비교
     */
    compareContexts(context1, context2) {
        const summary1 = this.generateContextSummary(context1);
        const summary2 = this.generateContextSummary(context2);
        
        const differences = {};
        
        // 각 속성 비교
        Object.keys(summary1).forEach(key => {
            if (summary1[key] !== summary2[key]) {
                differences[key] = {
                    from: summary1[key],
                    to: summary2[key]
                };
            }
        });
        
        return {
            differences,
            similarity: this.calculateSimilarity(summary1, summary2)
        };
    }

    /**
     * 컨텍스트 유사도 계산
     */
    calculateSimilarity(summary1, summary2) {
        const keys = Object.keys(summary1);
        let matches = 0;
        
        keys.forEach(key => {
            if (summary1[key] === summary2[key]) {
                matches++;
            }
        });
        
        return matches / keys.length;
    }

    /**
     * 다음 컨텍스트 예측
     */
    predictNextContext(currentContext, answer) {
        const { currentBottleneck, currentSegment } = currentContext;
        
        // 다음 세그먼트나 병목 예측
        const segmentMap = {
            'gi': ['gi_1', 'gi_2'],
            'seung': ['seung_1', 'seung_2'],
            'ten': ['ten_1'],
            'ketsu': ['ketsu_1']
        };
        
        const bottleneckOrder = ['gi', 'seung', 'ten', 'ketsu'];
        const currentSegments = segmentMap[currentBottleneck] || [];
        const currentIndex = currentSegments.indexOf(currentSegment);
        
        let nextBottleneck = currentBottleneck;
        let nextSegment = currentSegment;
        
        // 다음 세그먼트로 이동
        if (currentIndex < currentSegments.length - 1) {
            nextSegment = currentSegments[currentIndex + 1];
        } else {
            // 다음 병목으로 이동
            const bottleneckIndex = bottleneckOrder.indexOf(currentBottleneck);
            if (bottleneckIndex < bottleneckOrder.length - 1) {
                nextBottleneck = bottleneckOrder[bottleneckIndex + 1];
                nextSegment = segmentMap[nextBottleneck]?.[0] || `${nextBottleneck}_1`;
            }
        }
        
        // 답변을 기반으로 컨텍스트 업데이트
        const updatedRecentAnswers = [...(currentContext.recentAnswers || []), answer];
        
        return {
            ...currentContext,
            currentBottleneck: nextBottleneck,
            currentSegment: nextSegment,
            recentAnswers: updatedRecentAnswers,
            eventCount: (currentContext.eventCount || 0) + 1
        };
    }

    /**
     * 컨텍스트 유효성 검사
     */
    validateContext(context) {
        if (!context || typeof context !== 'object') {
            return { valid: false, message: '컨텍스트는 객체여야 합니다.' };
        }
        
        if (!context.currentBottleneck) {
            return { valid: false, message: '현재 병목은 필수입니다.' };
        }
        
        if (!context.currentSegment) {
            return { valid: false, message: '현재 세그먼트는 필수입니다.' };
        }
        
        const validBottlenecks = ['gi', 'seung', 'ten', 'ketsu'];
        if (!validBottlenecks.includes(context.currentBottleneck)) {
            return { valid: false, message: '유효하지 않은 병목입니다.' };
        }
        
        return { valid: true, message: '유효한 컨텍스트입니다.' };
    }
}