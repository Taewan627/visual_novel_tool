/**
 * 캐릭터 행동 질문 전략
 * 캐릭터의 행동과 선택에 대한 질문 생성
 */

import { QuestionStrategy } from './tone-question.js';

/**
 * 캐릭터 행동 질문 전략
 */
export class CharacterActionQuestionStrategy extends QuestionStrategy {
    constructor() {
        super();
        this.questionTemplates = {
            'gi': [
                "주인공은 이 상황에서 어떻게 행동할까요?",
                "일상 속에서 주인공의 성향은 어떻게 드러나나요?",
                "사건에 처음 마주한 주인공의 반응은 어떤가요?",
                "평소와 다른 상황에서 주인공은 어떻게 행동하나요?"
            ],
            'seung': [
                "갈등 상황에서 주인공은 어떻게 대처할까요?",
                "어려움에 직면했을 때 주인공의 행동 방식은?",
                "첫 번째 위기에 대한 주인공의 반응은 어떤가요?",
                "문제 해결을 위해 주인공은 어떤 선택을 하나요?"
            ],
            'ten': [
                "절정 순간 주인공의 결정적인 행동은?",
                "가장 큰 위기 앞에서 주인공의 선택은?",
                "클라이맥스에서 주인공의 행동은 어떤가요?",
                "모든 것을 걸어야 할 때 주인공은 어떻게 하나요?"
            ],
            'ketsu': [
                "결말에서 주인공의 최종 행동은?",
                "모든 것을 해결하기 위한 주인공의 행동은?",
                "마지막 순간 주인공의 선택은 어떤가요?",
                "이야기를 마무리하는 주인공의 행동은?"
            ]
        };
        
        this.choiceOptions = ['적극적으로', '신중하게', '소극적으로', '창의적으로', '논리적으로', '감정적으로'];
        
        this.eventTemplates = {
            '적극적으로': {
                content: "주인공은 망설임 없이 앞으로 나아가며 상황에 직면한다.",
                action: "step_forward",
                characterExpression: "determined",
                movement: "confident",
                dialogueStyle: "direct"
            },
            '신중하게': {
                content: "주인공은 주변을 살피며 신중하게 다음 행동을 계획한다.",
                action: "observe",
                characterExpression: "thinking",
                movement: "cautious",
                dialogueStyle: "measured"
            },
            '소극적으로': {
                content: "주인공은 뒤로 물러나며 상황을 피하려고 한다.",
                action: "step_back",
                characterExpression: "hesitant",
                movement: "reluctant",
                dialogueStyle: "quiet"
            },
            '창의적으로': {
                content: "주인공은 예상치 못한 창의적인 해결책을 제시한다.",
                action: "think_different",
                characterExpression: "creative",
                movement: "expressive",
                dialogueStyle: "imaginative"
            },
            '논리적으로': {
                content: "주인공은 상황을 논리적으로 분석하며 최적의 해결책을 찾는다.",
                action: "analyze",
                characterExpression: "analytical",
                movement: "methodical",
                dialogueStyle: "precise"
            },
            '감정적으로': {
                content: "주인공은 감정에 따라 행동하며 솔직한 반응을 보인다.",
                action: "react_emotionally",
                characterExpression: "emotional",
                movement: "impulsive",
                dialogueStyle: "passionate"
            }
        };
    }

    /**
     * 질문 생성
     */
    async generate(context) {
        const templates = this.questionTemplates[context.currentBottleneck] || this.questionTemplates['gi'];
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        
        return {
            id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            kind: 'character_action',
            ask: randomTemplate,
            choices: [...this.choiceOptions],
            context: context,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 답변 처리
     */
    async processAnswer(question, answer) {
        const processedAnswer = {
            questionId: question.id,
            kind: question.kind,
            answer: answer,
            processedAt: new Date().toISOString(),
            actionType: this.mapActionToValue(answer),
            personality: this.extractPersonalityTrait(answer),
            impact: this.calculateActionImpact(answer)
        };
        
        return processedAnswer;
    }

    /**
     * 이벤트 생성
     */
    async generateEvent(question, processedAnswer) {
        const eventTemplate = this.eventTemplates[processedAnswer.answer] || this.eventTemplates['신중하게'];
        
        return {
            type: 'action_event',
            content: eventTemplate.content,
            action: eventTemplate.action,
            characterExpression: eventTemplate.characterExpression,
            movement: eventTemplate.movement,
            dialogueStyle: eventTemplate.dialogueStyle,
            actionType: processedAnswer.actionType,
            personality: processedAnswer.personality,
            impact: processedAnswer.impact,
            questionId: question.id,
            answer: processedAnswer.answer
        };
    }

    /**
     * 행동을 값으로 매핑
     */
    mapActionToValue(action) {
        const actionMap = {
            '적극적으로': 'proactive',
            '신중하게': 'cautious',
            '소극적으로': 'passive',
            '창의적으로': 'creative',
            '논리적으로': 'logical',
            '감정적으로': 'emotional'
        };
        
        return actionMap[action] || 'neutral';
    }

    /**
     * 성격 특성 추출
     */
    extractPersonalityTrait(action) {
        const personalityMap = {
            '적극적으로': 'leader',
            '신중하게': 'thinker',
            '소극적으로': 'follower',
            '창의적으로': 'innovator',
            '논리적으로': 'analyst',
            '감정적으로': 'empath'
        };
        
        return personalityMap[action] || 'balanced';
    }

    /**
     * 행동 영향력 계산
     */
    calculateActionImpact(action) {
        const impactMap = {
            '적극적으로': { initiative: 2, risk: 1, influence: 2 },
            '신중하게': { initiative: 0, risk: -1, influence: 1 },
            '소극적으로': { initiative: -1, risk: -2, influence: 0 },
            '창의적으로': { initiative: 1, risk: 1, influence: 2 },
            '논리적으로': { initiative: 1, risk: -1, influence: 1 },
            '감정적으로': { initiative: 0, risk: 2, influence: 1 }
        };
        
        return impactMap[action] || { initiative: 0, risk: 0, influence: 0 };
    }

    /**
     * 컨텍스트에 따른 선택지 조정
     */
    adjustChoicesForContext(context) {
        let choices = [...this.choiceOptions];
        
        // 병목별 선택지 우선순위 조정
        if (context.currentBottleneck === 'gi') {
            // 기 단계에서는 다양한 행동을 균등하게
            choices = [...this.choiceOptions];
        } else if (context.currentBottleneck === 'seung') {
            // 승 단계에서는 적극적이고 창의적인 행동을 우선
            choices = ['적극적으로', '창의적으로', '논리적으로', '신중하게', '감정적으로', '소극적으로'];
        } else if (context.currentBottleneck === 'ten') {
            // 전 단계에서는 결단력 있는 행동을 우선
            choices = ['적극적으로', '감정적으로', '창의적으로', '논리적으로', '신중하게', '소극적으로'];
        } else if (context.currentBottleneck === 'ketsu') {
            // 결 단계에서는 모든 행동을 균등하게
            choices = [...this.choiceOptions];
        }
        
        return choices;
    }

    /**
     * 이전 답변과의 일관성 검사
     */
    checkConsistencyWithPreviousAnswers(currentAnswer, previousAnswers) {
        if (!previousAnswers || previousAnswers.length === 0) {
            return { consistent: true, reason: '이전 답변 없음' };
        }
        
        const actionAnswers = previousAnswers.filter(answer => answer.kind === 'character_action');
        if (actionAnswers.length === 0) {
            return { consistent: true, reason: '이전 행동 답변 없음' };
        }
        
        const latestActionAnswer = actionAnswers[actionAnswers.length - 1];
        
        // 성격 일관성 확인
        const personalityConsistency = this.checkPersonalityConsistency(currentAnswer, latestActionAnswer.answer);
        
        if (!personalityConsistency.consistent) {
            return personalityConsistency;
        }
        
        return { consistent: true, reason: '행동 일관성 유지' };
    }

    /**
     * 성격 일관성 검사
     */
    checkPersonalityConsistency(currentAnswer, previousAnswer) {
        // 반대되는 성격 특성 확인
        const oppositeTraits = [
            { from: '적극적으로', to: '소극적으로' },
            { from: '소극적으로', to: '적극적으로' },
            { from: '신중하게', to: '감정적으로' },
            { from: '감정적으로', to: '신중하게' },
            { from: '창의적으로', to: '논리적으로' },
            { from: '논리적으로', to: '창의적으로' }
        ];
        
        const isOpposite = oppositeTraits.some(trait => 
            previousAnswer === trait.from && currentAnswer === trait.to
        );
        
        if (isOpposite) {
            return { 
                consistent: false, 
                reason: `이전 행동(${previousAnswer})과 현재 행동(${currentAnswer}) 사이에 성격적 불일치가 있습니다.` 
            };
        }
        
        return { consistent: true, reason: '성격 일관성 유지' };
    }

    /**
     * 행동에 따른 후속 질문 추천
     */
    recommendFollowUpQuestions(action) {
        const followUpRecommendations = {
            '적극적으로': [
                'dialogue_style',    // 적극적인 행동 후에는 대화 스타일 질문
                'tone'              // 분위기 질문
            ],
            '신중하게': [
                'dialogue_style',    // 신중한 행동 후에는 대화 스타일 질문
                'tone'              // 분위기 질문
            ],
            '소극적으로': [
                'tone',              // 소극적인 행동 후에는 분위기 질문
                'dialogue_style'    // 대화 스타일 질문
            ],
            '창의적으로': [
                'dialogue_style',    // 창의적인 행동 후에는 대화 스타일 질문
                'tone'              // 분위기 질문
            ],
            '논리적으로': [
                'tone',              // 논리적인 행동 후에는 분위기 질문
                'dialogue_style'    // 대화 스타일 질문
            ],
            '감정적으로': [
                'tone',              // 감정적인 행동 후에는 분위기 질문
                'dialogue_style'    // 대화 스타일 질문
            ]
        };
        
        return followUpRecommendations[action] || ['tone', 'dialogue_style'];
    }

    /**
     * 행동에 따른 변수 설정 제안
     */
    suggestVariableSettings(action) {
        const variableSuggestions = {
            '적극적으로': [
                { variable: 'personality', value: 'active' },
                { variable: 'approach', value: 'direct' }
            ],
            '신중하게': [
                { variable: 'personality', value: 'cautious' },
                { variable: 'approach', value: 'analytical' }
            ],
            '소극적으로': [
                { variable: 'personality', value: 'passive' },
                { variable: 'approach', value: 'reactive' }
            ],
            '창의적으로': [
                { variable: 'personality', value: 'creative' },
                { variable: 'approach', value: 'innovative' }
            ],
            '논리적으로': [
                { variable: 'personality', value: 'logical' },
                { variable: 'approach', value: 'methodical' }
            ],
            '감정적으로': [
                { variable: 'personality', value: 'emotional' },
                { variable: 'approach', value: 'intuitive' }
            ]
        };
        
        return variableSuggestions[action] || [];
    }

    /**
     * 행동에 따른 대화 영향력 계산
     */
    calculateDialogueInfluence(action) {
        const influenceMap = {
            '적극적으로': { style: 'direct', length: 'medium', formality: 'casual' },
            '신중하게': { style: 'measured', length: 'long', formality: 'formal' },
            '소극적으로': { style: 'hesitant', length: 'short', formality: 'polite' },
            '창의적으로': { style: 'expressive', length: 'medium', formality: 'casual' },
            '논리적으로': { style: 'precise', length: 'long', formality: 'formal' },
            '감정적으로': { style: 'emotional', length: 'medium', formality: 'casual' }
        };
        
        return influenceMap[action] || { style: 'neutral', length: 'medium', formality: 'polite' };
    }
}