/**
 * 분위기 질문 전략
 * 스토리의 분위기와 감정적 톤에 대한 질문 생성
 */

/**
 * 기본 질문 전략 인터페이스
 */
class QuestionStrategy {
    async generate(context) {
        throw new Error('구현되지 않은 메서드: generate');
    }
    
    async processAnswer(question, answer) {
        return {
            questionId: question.id,
            kind: question.kind,
            answer: answer,
            processedAt: new Date().toISOString()
        };
    }
    
    async generateEvent(question, processedAnswer) {
        throw new Error('구현되지 않은 메서드: generateEvent');
    }
}

/**
 * 분위기 질문 전략
 */
export class ToneQuestionStrategy extends QuestionStrategy {
    constructor() {
        super();
        this.questionTemplates = {
            'gi': [
                "이야기의 시작 분위기는 어떤가요?",
                "주인공의 일상은 어떤 느낌인가요?",
                "초반 장면의 전체적인 톤은 어떤가요?",
                "이야기가 시작되는 날의 분위기는 어떤가요?"
            ],
            'seung': [
                "갈등이 시작되는 장면의 분위기는 어떤가요?",
                "긴장감이 고조되는 분위기는 어떤가요?",
                "대립이 벌어지는 상황의 톤은 어떤가요?",
                "문제가 발생했을 때의 분위기는 어떤가요?"
            ],
            'ten': [
                "절정 장면의 분위기는 어떤가요?",
                "위기 상황의 긴장감은 어떤 수준인가요?",
                "클라이맥스의 감정선은 어떤가요?",
                "가장 중요한 순간의 분위기는 어떤가요?"
            ],
            'ketsu': [
                "결말의 전체적인 분위기는 어떤가요?",
                "해결의 감정적인 톤은 어떤가요?",
                "마지막 장면의 느낌은 어떤가요?",
                "이야기가 마무리되는 분위기는 어떤가요?"
            ]
        };
        
        this.choiceOptions = ['밝게', '긴장', '코믹', '진지', '미스터리', '로맨틱'];
        
        this.eventTemplates = {
            '밝게': {
                content: "햇살이 눈부신 날, 주인공은 활기차게 하루를 시작한다.",
                background: "sunny_day",
                music: "cheerful_music",
                characterExpression: "happy",
                lighting: "bright"
            },
            '긴장': {
                content: "어두운 구름이 몰려오고, 무언가 불길한 예감이 든다.",
                background: "dark_clouds",
                music: "tense_music",
                characterExpression: "worried",
                lighting: "dim"
            },
            '코믹': {
                content: "엉뚱한 상황이 벌어지며 웃음이 터져 나온다.",
                background: "comedy_scene",
                music: "funny_music",
                characterExpression: "amused",
                lighting: "normal"
            },
            '진지': {
                content: "무거운 침묵이 흐르며, 중요한 순간이 다가온다.",
                background: "serious_moment",
                music: "somber_music",
                characterExpression: "serious",
                lighting: "focused"
            },
            '미스터리': {
                content: "안개가 자욱한 거리, 미스터리한 사건의 시작을 암시한다.",
                background: "foggy_street",
                music: "mystery_music",
                characterExpression: "curious",
                lighting: "mysterious"
            },
            '로맨틱': {
                content: "분홍빛 분위기 속에서 특별한 만남이 이루어진다.",
                background: "romantic_setting",
                music: "romantic_music",
                characterExpression: "lovestruck",
                lighting: "soft"
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
            kind: 'tone',
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
            tone: this.mapToneToValue(answer),
            impact: this.calculateToneImpact(answer)
        };
        
        return processedAnswer;
    }

    /**
     * 이벤트 생성
     */
    async generateEvent(question, processedAnswer) {
        const eventTemplate = this.eventTemplates[processedAnswer.answer] || this.eventTemplates['밝게'];
        
        return {
            type: 'tone_event',
            content: eventTemplate.content,
            background: eventTemplate.background,
            music: eventTemplate.music,
            characterExpression: eventTemplate.characterExpression,
            lighting: eventTemplate.lighting,
            tone: processedAnswer.tone,
            impact: processedAnswer.impact,
            questionId: question.id,
            answer: processedAnswer.answer
        };
    }

    /**
     * 분위기를 값으로 매핑
     */
    mapToneToValue(tone) {
        const toneMap = {
            '밝게': 'positive',
            '긴장': 'tense',
            '코믹': 'humorous',
            '진지': 'serious',
            '미스터리': 'mysterious',
            '로맨틱': 'romantic'
        };
        
        return toneMap[tone] || 'neutral';
    }

    /**
     * 분위기 영향력 계산
     */
    calculateToneImpact(tone) {
        const impactMap = {
            '밝게': { emotional: 1, tension: -1, mystery: -1 },
            '긴장': { emotional: -1, tension: 2, mystery: 1 },
            '코믹': { emotional: 1, tension: -2, mystery: -1 },
            '진지': { emotional: 0, tension: 1, mystery: 0 },
            '미스터리': { emotional: -1, tension: 1, mystery: 2 },
            '로맨틱': { emotional: 2, tension: -1, mystery: 0 }
        };
        
        return impactMap[tone] || { emotional: 0, tension: 0, mystery: 0 };
    }

    /**
     * 컨텍스트에 따른 선택지 조정
     */
    adjustChoicesForContext(context) {
        let choices = [...this.choiceOptions];
        
        // 병목별 선택지 우선순위 조정
        if (context.currentBottleneck === 'gi') {
            // 기 단계에서는 밝고 긍정적인 분위기를 우선
            choices = ['밝게', '로맨틱', '코믹', '진지', '미스터리', '긴장'];
        } else if (context.currentBottleneck === 'seung') {
            // 승 단계에서는 긴장감 있는 분위기를 우선
            choices = ['긴장', '진지', '미스터리', '밝게', '로맨틱', '코믹'];
        } else if (context.currentBottleneck === 'ten') {
            // 전 단계에서는 긴장하고 진지한 분위기를 우선
            choices = ['긴장', '진지', '미스터리', '밝게', '코믹', '로맨틱'];
        } else if (context.currentBottleneck === 'ketsu') {
            // 결 단계에서는 모든 분위기를 균등하게
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
        
        const toneAnswers = previousAnswers.filter(answer => answer.kind === 'tone');
        if (toneAnswers.length === 0) {
            return { consistent: true, reason: '이전 분위기 답변 없음' };
        }
        
        const latestToneAnswer = toneAnswers[toneAnswers.length - 1];
        
        // 급격한 분위기 변화 확인
        const drasticChanges = [
            { from: '밝게', to: '긴장' },
            { from: '긴장', to: '밝게' },
            { from: '코믹', to: '진지' },
            { from: '진지', to: '코믹' }
        ];
        
        const isDrasticChange = drasticChanges.some(change => 
            latestToneAnswer.answer === change.from && currentAnswer === change.to
        );
        
        if (isDrasticChange) {
            return { 
                consistent: false, 
                reason: `이전 분위기(${latestToneAnswer.answer})와 현재 분위기(${currentAnswer}) 사이에 급격한 변화가 있습니다.` 
            };
        }
        
        return { consistent: true, reason: '분위기 일관성 유지' };
    }

    /**
     * 분위기에 따른 후속 질문 추천
     */
    recommendFollowUpQuestions(tone) {
        const followUpRecommendations = {
            '밝게': [
                'character_action',  // 밝은 분위기에서는 캐릭터 행동 질문
                'dialogue_style'    // 대화 스타일 질문
            ],
            '긴장': [
                'character_action',  // 긴장한 상황에서는 캐릭터 행동 질문
                'dialogue_style'    // 대화 스타일 질문
            ],
            '코믹': [
                'dialogue_style',    // 코믹한 상황에서는 대화 스타일 질문
                'character_action'   // 캐릭터 행동 질문
            ],
            '진지': [
                'character_action',  // 진지한 상황에서는 캐릭터 행동 질문
                'dialogue_style'    // 대화 스타일 질문
            ],
            '미스터리': [
                'character_action',  // 미스터리한 상황에서는 캐릭터 행동 질문
                'dialogue_style'    // 대화 스타일 질문
            ],
            '로맨틱': [
                'dialogue_style',    // 로맨틱한 상황에서는 대화 스타일 질문
                'character_action'   // 캐릭터 행동 질문
            ]
        };
        
        return followUpRecommendations[tone] || ['character_action', 'dialogue_style'];
    }
}