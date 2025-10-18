/**
 * 대화 스타일 질문 전략
 * 캐릭터의 대화 방식과 커뮤니케이션 스타일에 대한 질문 생성
 */

import { QuestionStrategy } from './tone-question.js';

/**
 * 대화 스타일 질문 전략
 */
export class DialogueStyleQuestionStrategy extends QuestionStrategy {
    constructor() {
        super();
        this.questionTemplates = {
            'gi': [
                "등장인물들의 대화 스타일은 어떤가요?",
                "주인공의 말투는 어떤 특징이 있나요?",
                "초반 대화의 전체적인 톤은 어떤가요?",
                "인물들이 서로를 어떻게 부르나요?"
            ],
            'seung': [
                "갈등 상황에서 대화는 어떻게 전개되나요?",
                "긴장감 있는 대화의 스타일은 어떤가요?",
                "대립하는 인물들의 대화 방식은?",
                "논쟁이나 충돌 시 대화는 어떻게 변하나요?"
            ],
            'ten': [
                "절정 순간의 대화는 어떤 스타일인가요?",
                "가장 긴장된 대화의 톤은 어떤가요?",
                "클라이맥스에서의 대화 방식은?",
                "중요한 대화에서 인물들은 어떻게 말하나요?"
            ],
            'ketsu': [
                "결말의 대화는 어떤 스타일로 마무리되나요?",
                "마지막 대화의 감정선은 어떤가요?",
                "해결의 대화 방식은 어떤가요?",
                "이야기를 마무리하는 대화는 어떤가요?"
            ]
        };
        
        this.choiceOptions = ['정중하게', '친근하게', '격식있게', '장난스럽게', '진지하게', '감동적으로'];
        
        this.eventTemplates = {
            '정중하게': {
                content: "인물들은 서로를 존중하며 정중한 말투로 대화한다.",
                dialogueStyle: "formal",
                tone: "respectful",
                speechRate: "measured",
                formality: "high"
            },
            '친근하게': {
                content: "인물들은 친구처럼 편안하고 친근한 말투로 대화한다.",
                dialogueStyle: "casual",
                tone: "friendly",
                speechRate: "normal",
                formality: "low"
            },
            '격식있게': {
                content: "인물들은 격식 있는 자세와 말투로 대화한다.",
                dialogueStyle: "official",
                tone: "professional",
                speechRate: "measured",
                formality: "very_high"
            },
            '장난스럽게': {
                content: "인물들은 서로 농담을 주고받으며 장난스럽게 대화한다.",
                dialogueStyle: "playful",
                tone: "joking",
                speechRate: "fast",
                formality: "very_low"
            },
            '진지하게': {
                content: "인물들은 진지한 표정과 말투로 중요한 대화를 나눈다.",
                dialogueStyle: "serious",
                tone: "solemn",
                speechRate: "slow",
                formality: "medium"
            },
            '감동적으로': {
                content: "인물들의 대화에 감동적인 내용이 담겨있다.",
                dialogueStyle: "emotional",
                tone: "moving",
                speechRate: "varied",
                formality: "medium"
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
            kind: 'dialogue_style',
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
            dialogueType: this.mapDialogueToValue(answer),
            communicationStyle: this.extractCommunicationStyle(answer),
            impact: this.calculateDialogueImpact(answer)
        };
        
        return processedAnswer;
    }

    /**
     * 이벤트 생성
     */
    async generateEvent(question, processedAnswer) {
        const eventTemplate = this.eventTemplates[processedAnswer.answer] || this.eventTemplates['친근하게'];
        
        return {
            type: 'dialogue_event',
            content: eventTemplate.content,
            dialogueStyle: eventTemplate.dialogueStyle,
            tone: eventTemplate.tone,
            speechRate: eventTemplate.speechRate,
            formality: eventTemplate.formality,
            dialogueType: processedAnswer.dialogueType,
            communicationStyle: processedAnswer.communicationStyle,
            impact: processedAnswer.impact,
            questionId: question.id,
            answer: processedAnswer.answer
        };
    }

    /**
     * 대화 스타일을 값으로 매핑
     */
    mapDialogueToValue(dialogue) {
        const dialogueMap = {
            '정중하게': 'polite',
            '친근하게': 'friendly',
            '격식있게': 'formal',
            '장난스럽게': 'playful',
            '진지하게': 'serious',
            '감동적으로': 'emotional'
        };
        
        return dialogueMap[dialogue] || 'neutral';
    }

    /**
     * 커뮤니케이션 스타일 추출
     */
    extractCommunicationStyle(dialogue) {
        const styleMap = {
            '정중하게': 'respectful',
            '친근하게': 'informal',
            '격식있게': 'official',
            '장난스럽게': 'humorous',
            '진지하게': 'direct',
            '감동적으로': 'expressive'
        };
        
        return styleMap[dialogue] || 'neutral';
    }

    /**
     * 대화 영향력 계산
     */
    calculateDialogueImpact(dialogue) {
        const impactMap = {
            '정중하게': { relationship: 1, tension: -1, intimacy: 0 },
            '친근하게': { relationship: 2, tension: -2, intimacy: 2 },
            '격식있게': { relationship: 0, tension: 1, intimacy: -1 },
            '장난스럽게': { relationship: 1, tension: -2, intimacy: 1 },
            '진지하게': { relationship: 0, tension: 2, intimacy: -1 },
            '감동적으로': { relationship: 2, tension: 0, intimacy: 3 }
        };
        
        return impactMap[dialogue] || { relationship: 0, tension: 0, intimacy: 0 };
    }

    /**
     * 컨텍스트에 따른 선택지 조정
     */
    adjustChoicesForContext(context) {
        let choices = [...this.choiceOptions];
        
        // 병목별 선택지 우선순위 조정
        if (context.currentBottleneck === 'gi') {
            // 기 단계에서는 친근하고 정중한 대화를 우선
            choices = ['친근하게', '정중하게', '장난스럽게', '진지하게', '감동적으로', '격식있게'];
        } else if (context.currentBottleneck === 'seung') {
            // 승 단계에서는 진지하고 격식 있는 대화를 우선
            choices = ['진지하게', '격식있게', '정중하게', '친근하게', '장난스럽게', '감동적으로'];
        } else if (context.currentBottleneck === 'ten') {
            // 전 단계에서는 진지하고 감동적인 대화를 우선
            choices = ['진지하게', '감동적으로', '정중하게', '친근하게', '격식있게', '장난스럽게'];
        } else if (context.currentBottleneck === 'ketsu') {
            // 결 단계에서는 감동적이고 정중한 대화를 우선
            choices = ['감동적으로', '정중하게', '진지하게', '친근하게', '격식있게', '장난스럽게'];
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
        
        const dialogueAnswers = previousAnswers.filter(answer => answer.kind === 'dialogue_style');
        if (dialogueAnswers.length === 0) {
            return { consistent: true, reason: '이전 대화 스타일 답변 없음' };
        }
        
        const latestDialogueAnswer = dialogueAnswers[dialogueAnswers.length - 1];
        
        // 격식성 수준 급격한 변화 확인
        const formalityChanges = [
            { from: '격식있게', to: '장난스럽게' },
            { from: '장난스럽게', to: '격식있게' },
            { from: '정중하게', to: '장난스럽게' },
            { from: '장난스럽게', to: '정중하게' }
        ];
        
        const isFormalityChange = formalityChanges.some(change => 
            latestDialogueAnswer.answer === change.from && currentAnswer === change.to
        );
        
        if (isFormalityChange) {
            return { 
                consistent: false, 
                reason: `이전 대화 스타일(${latestDialogueAnswer.answer})과 현재 대화 스타일(${currentAnswer}) 사이에 격식성 수준의 급격한 변화가 있습니다.` 
            };
        }
        
        return { consistent: true, reason: '대화 스타일 일관성 유지' };
    }

    /**
     * 대화 스타일에 따른 후속 질문 추천
     */
    recommendFollowUpQuestions(dialogue) {
        const followUpRecommendations = {
            '정중하게': [
                'character_action',  // 정중한 대화 후에는 캐릭터 행동 질문
                'tone'              // 분위기 질문
            ],
            '친근하게': [
                'character_action',  // 친근한 대화 후에는 캐릭터 행동 질문
                'tone'              // 분위기 질문
            ],
            '격식있게': [
                'character_action',  // 격식적인 대화 후에는 캐릭터 행동 질문
                'tone'              // 분위기 질문
            ],
            '장난스럽게': [
                'tone',              // 장난스러운 대화 후에는 분위기 질문
                'character_action'   // 캐릭터 행동 질문
            ],
            '진지하게': [
                'character_action',  // 진지한 대화 후에는 캐릭터 행동 질문
                'tone'              // 분위기 질문
            ],
            '감동적으로': [
                'tone',              // 감동적인 대화 후에는 분위기 질문
                'character_action'   // 캐릭터 행동 질문
            ]
        };
        
        return followUpRecommendations[dialogue] || ['character_action', 'tone'];
    }

    /**
     * 대화 스타일에 따른 변수 설정 제안
     */
    suggestVariableSettings(dialogue) {
        const variableSuggestions = {
            '정중하게': [
                { variable: 'communication', value: 'polite' },
                { variable: 'relationship', value: 'formal' }
            ],
            '친근하게': [
                { variable: 'communication', value: 'casual' },
                { variable: 'relationship', value: 'friendly' }
            ],
            '격식있게': [
                { variable: 'communication', value: 'official' },
                { variable: 'relationship', value: 'professional' }
            ],
            '장난스럽게': [
                { variable: 'communication', value: 'playful' },
                { variable: 'relationship', value: 'humorous' }
            ],
            '진지하게': [
                { variable: 'communication', value: 'serious' },
                { variable: 'relationship', value: 'focused' }
            ],
            '감동적으로': [
                { variable: 'communication', value: 'emotional' },
                { variable: 'relationship', value: 'deep' }
            ]
        };
        
        return variableSuggestions[dialogue] || [];
    }

    /**
     * 대화 스타일에 따른 관계 발전 계산
     */
    calculateRelationshipDevelopment(dialogue) {
        const developmentMap = {
            '정중하게': { change: 0, trust: 1, intimacy: 0 },
            '친근하게': { change: 1, trust: 2, intimacy: 1 },
            '격식있게': { change: 0, trust: 0, intimacy: -1 },
            '장난스럽게': { change: 1, trust: 1, intimacy: 1 },
            '진지하게': { change: 0, trust: 1, intimacy: 0 },
            '감동적으로': { change: 2, trust: 2, intimacy: 2 }
        };
        
        return developmentMap[dialogue] || { change: 0, trust: 0, intimacy: 0 };
    }

    /**
     * 대화 스타일에 따른 갈등 해결 방식 제안
     */
    suggestConflictResolution(dialogue) {
        const resolutionMap = {
            '정중하게': 'negotiation',
            '친근하게': 'compromise',
            '격식있게': 'formal_discussion',
            '장난스럽게': 'humorous_approach',
            '진지하게': 'direct_confrontation',
            '감동적으로': 'emotional_appeal'
        };
        
        return resolutionMap[dialogue] || 'discussion';
    }

    /**
     * 대화 스타일에 따른 캐릭터 표현 제안
     */
    suggestCharacterExpressions(dialogue) {
        const expressionMap = {
            '정중하게': ['polite_smile', 'respectful_nod', 'calm_expression'],
            '친근하게': ['warm_smile', 'relaxed_posture', 'friendly_gesture'],
            '격식있게': ['formal_posture', 'serious_expression', 'measured_gesture'],
            '장난스럽게': ['playful_smile', 'wink', 'animated_expression'],
            '진지하게': ['focused_expression', 'intense_gaze', 'deliberate_gesture'],
            '감동적으로': ['emotional_expression', 'tearful_eyes', 'sincere_smile']
        };
        
        return expressionMap[dialogue] || ['neutral_expression'];
    }

    /**
     * 대화 스타일에 따른 장면 전환 효과 제안
     */
    suggestSceneTransitions(dialogue) {
        const transitionMap = {
            '정중하게': 'smooth_fade',
            '친근하게': 'quick_cut',
            '격식있게': 'slow_dissolve',
            '장난스럽게': 'playful_transition',
            '진지하게': 'hard_cut',
            '감동적으로': 'slow_fade_with_music'
        };
        
        return transitionMap[dialogue] || 'standard_transition';
    }
}