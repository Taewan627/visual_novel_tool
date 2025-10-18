/**
 * AI 서비스
 * AI API와의 통신을 담당하는 서비스
 */

/**
 * AI 서비스 클래스
 */
export class AIService {
    constructor() {
        this.apiKey = null;
        this.baseURL = null;
        this.model = null;
        this.isSimulationMode = true; // 기본적으로 시뮬레이션 모드
    }

    /**
     * AI API 설정
     */
    configure(config) {
        this.apiKey = config.apiKey;
        this.baseURL = config.baseURL || 'https://api.openai.com/v1';
        this.model = config.model || 'gpt-3.5-turbo';
        this.isSimulationMode = config.simulationMode !== false;
        
        console.log(`AI 서비스 설정 완료: ${this.isSimulationMode ? '시뮬레이션 모드' : 'API 모드'}`);
    }

    /**
     * 질문 생성 요청
     */
    async generateQuestion(context) {
        if (this.isSimulationMode) {
            return this.simulateQuestionGeneration(context);
        }
        
        try {
            const response = await fetch('/api/story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: this.buildQuestionPrompt(context)
                })
            });
            
            if (!response.ok) {
                throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Hugging Face API 응답 처리
            let content = '';
            if (data && data[0] && data[0].generated_text) {
                content = data[0].generated_text;
            } else {
                throw new Error('예상치 못한 API 응답 형식');
            }
            
            return this.parseQuestionResponse(content, context);
        } catch (error) {
            console.error('AI 질문 생성 실패:', error);
            // API 실패 시 시뮬레이션으로 대체
            return this.simulateQuestionGeneration(context);
        }
    }

    /**
     * 이벤트 생성 요청
     */
    async generateEvent(question, answer) {
        if (this.isSimulationMode) {
            return this.simulateEventGeneration(question, answer);
        }
        
        try {
            // 질문 종류에 따라 다른 API 엔드포인트 사용
            let endpoint = '/api/story';
            if (question.kind === 'character_action') {
                endpoint = '/api/character';
            } else if (question.kind === 'dialogue_style') {
                endpoint = '/api/dialogue';
            }
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: this.buildEventPrompt(question, answer),
                    description: this.buildEventPrompt(question, answer),
                    utterance: answer,
                    context: question.ask
                })
            });
            
            if (!response.ok) {
                throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Hugging Face API 응답 처리
            let content = '';
            if (data && data[0] && data[0].generated_text) {
                content = data[0].generated_text;
            } else {
                throw new Error('예상치 못한 API 응답 형식');
            }
            
            return this.parseEventResponse(content, question, answer);
        } catch (error) {
            console.error('AI 이벤트 생성 실패:', error);
            // API 실패 시 시뮬레이션으로 대체
            return this.simulateEventGeneration(question, answer);
        }
    }

    /**
     * 질문 생성 시뮬레이션
     */
    simulateQuestionGeneration(context) {
        const { currentBottleneck, recentAnswers } = context;
        
        // 병목별 질문 템플릿
        const questionTemplates = {
            'gi': [
                {
                    ask: "이야기의 시작 분위기는 어떤가요?",
                    kind: "tone",
                    choices: ["밝게", "긴장", "코믹", "진지", "미스터리", "로맨틱"]
                },
                {
                    ask: "주인공은 이 상황에서 어떻게 행동할까요?",
                    kind: "character_action",
                    choices: ["적극적으로", "신중하게", "소극적으로", "창의적으로", "논리적으로", "감정적으로"]
                },
                {
                    ask: "등장인물들의 대화 스타일은 어떤가요?",
                    kind: "dialogue_style",
                    choices: ["정중하게", "친근하게", "격식있게", "장난스럽게", "진지하게", "감동적으로"]
                }
            ],
            'seung': [
                {
                    ask: "갈등이 시작되는 장면의 분위기는 어떤가요?",
                    kind: "tone",
                    choices: ["밝게", "긴장", "코믹", "진지", "미스터리", "로맨틱"]
                },
                {
                    ask: "갈등 상황에서 주인공은 어떻게 대처할까요?",
                    kind: "character_action",
                    choices: ["적극적으로", "신중하게", "소극적으로", "창의적으로", "논리적으로", "감정적으로"]
                },
                {
                    ask: "긴장된 대화의 스타일은 어떤가요?",
                    kind: "dialogue_style",
                    choices: ["정중하게", "친근하게", "격식있게", "장난스럽게", "진지하게", "감동적으로"]
                }
            ]
        };
        
        // 현재 병목에 맞는 질문 템플릿 선택
        const templates = questionTemplates[currentBottleneck] || questionTemplates['gi'];
        
        // 이전 답변과 중복되지 않도록 필터링
        const recentKinds = recentAnswers.map(answer => answer.kind);
        const availableTemplates = templates.filter(template => !recentKinds.includes(template.kind));
        
        // 사용 가능한 템플릿이 없으면 기본 템플릿 사용
        const selectedTemplate = availableTemplates.length > 0 
            ? availableTemplates[Math.floor(Math.random() * availableTemplates.length)]
            : templates[0];
        
        // 질문 객체 생성
        const question = {
            id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            kind: selectedTemplate.kind,
            ask: selectedTemplate.ask,
            choices: [...selectedTemplate.choices],
            context: context,
            timestamp: new Date().toISOString()
        };
        
        return question;
    }

    /**
     * 이벤트 생성 시뮬레이션
     */
    simulateEventGeneration(question, answer) {
        // 질문 종류와 답변에 따른 이벤트 템플릿
        const eventTemplates = {
            'tone': {
                '밝게': {
                    content: "햇살이 눈부신 날, 주인공은 활기차게 하루를 시작한다.",
                    background: "sunny_day",
                    music: "cheerful_music"
                },
                '긴장': {
                    content: "어두운 구름이 몰려오고, 무언가 불길한 예감이 든다.",
                    background: "dark_clouds",
                    music: "tense_music"
                },
                '코믹': {
                    content: "엉뚱한 상황이 벌어지며 웃음이 터져 나온다.",
                    background: "comedy_scene",
                    music: "funny_music"
                },
                '진지': {
                    content: "무거운 침묵이 흐르며, 중요한 순간이 다가온다.",
                    background: "serious_moment",
                    music: "somber_music"
                },
                '미스터리': {
                    content: "안개가 자욱한 거리, 미스터리한 사건의 시작을 암시한다.",
                    background: "foggy_street",
                    music: "mystery_music"
                },
                '로맨틱': {
                    content: "분홍빛 분위기 속에서 특별한 만남이 이루어진다.",
                    background: "romantic_setting",
                    music: "romantic_music"
                }
            },
            'character_action': {
                '적극적으로': {
                    content: "주인공은 망설임 없이 앞으로 나아가며 상황에 직면한다.",
                    background: "action_scene",
                    music: "dynamic_music"
                },
                '신중하게': {
                    content: "주인공은 주변을 살피며 신중하게 다음 행동을 계획한다.",
                    background: "thinking_scene",
                    music: "contemplative_music"
                },
                '소극적으로': {
                    content: "주인공은 뒤로 물러나며 상황을 피하려고 한다.",
                    background: "retreat_scene",
                    music: "hesitant_music"
                },
                '창의적으로': {
                    content: "주인공은 예상치 못은 창의적인 해결책을 제시한다.",
                    background: "creative_scene",
                    music: "inspiring_music"
                },
                '논리적으로': {
                    content: "주인공은 상황을 논리적으로 분석하며 최적의 해결책을 찾는다.",
                    background: "analysis_scene",
                    music: "methodical_music"
                },
                '감정적으로': {
                    content: "주인공은 감정에 따라 행동하며 솔직한 반응을 보인다.",
                    background: "emotional_scene",
                    music: "passionate_music"
                }
            },
            'dialogue_style': {
                '정중하게': {
                    content: "인물들은 서로를 존중하며 정중한 말투로 대화한다.",
                    background: "formal_scene",
                    music: "polite_music"
                },
                '친근하게': {
                    content: "인물들은 친구처럼 편안하고 친근한 말투로 대화한다.",
                    background: "casual_scene",
                    music: "friendly_music"
                },
                '격식있게': {
                    content: "인물들은 격식 있는 자세와 말투로 대화한다.",
                    background: "official_scene",
                    music: "formal_music"
                },
                '장난스럽게': {
                    content: "인물들은 서로 농담을 주고받으며 장난스럽게 대화한다.",
                    background: "playful_scene",
                    music: "humorous_music"
                },
                '진지하게': {
                    content: "인물들은 진지한 표정과 말투로 중요한 대화를 나눈다.",
                    background: "serious_scene",
                    music: "somber_music"
                },
                '감동적으로': {
                    content: "인물들의 대화에 감동적인 내용이 담겨있다.",
                    background: "emotional_scene",
                    music: "moving_music"
                }
            }
        };
        
        // 질문 종류와 답변에 맞는 이벤트 템플릿 선택
        const templates = eventTemplates[question.kind] || eventTemplates['tone'];
        const eventTemplate = templates[answer] || templates['밝게'];
        
        // 이벤트 객체 생성
        const event = {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'simulation_event',
            content: eventTemplate.content,
            background: eventTemplate.background,
            music: eventTemplate.music,
            questionId: question.id,
            answer: answer,
            timestamp: new Date().toISOString()
        };
        
        return event;
    }

    /**
     * 질문 생성 프롬프트 빌드
     */
    buildQuestionPrompt(context) {
        const { currentBottleneck, currentSegment, recentAnswers, storyVariables } = context;
        
        return `
Generate a question for a visual novel story based on the TW model.

Current context:
- Current bottleneck: ${currentBottleneck}
- Current segment: ${currentSegment}
- Recent answers: ${JSON.stringify(recentAnswers)}
- Story variables: ${JSON.stringify(storyVariables)}

Please generate a question with multiple choice answers. The question should help develop the story in the current context.
The response should be in JSON format with the following structure:
{
    "ask": "Question text",
    "kind": "tone|character_action|dialogue_style",
    "choices": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"]
}
        `;
    }

    /**
     * 이벤트 생성 프롬프트 빌드
     */
    buildEventPrompt(question, answer) {
        return `
Generate a story event for a visual novel based on the following question and answer:

Question: ${question.ask}
Question kind: ${question.kind}
Answer: ${answer}

Please generate a story event that reflects the answer and helps advance the story.
The response should be in JSON format with the following structure:
{
    "content": "Event description",
    "background": "Background image name",
    "music": "Background music name"
}
        `;
    }

    /**
     * 질문 응답 파싱
     */
    parseQuestionResponse(content, context) {
        try {
            const parsed = JSON.parse(content);
            
            return {
                id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                kind: parsed.kind || 'tone',
                ask: parsed.ask || "이야기의 다음 방향은 어떻게 될까요?",
                choices: parsed.choices || ["선택지 1", "선택지 2", "선택지 3"],
                context: context,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('질문 응답 파싱 실패:', error);
            
            // 파싱 실패 시 기본 질문 반환
            return {
                id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                kind: 'tone',
                ask: "이야기의 다음 방향은 어떻게 될까요?",
                choices: ["선택지 1", "선택지 2", "선택지 3"],
                context: context,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 이벤트 응답 파싱
     */
    parseEventResponse(content, question, answer) {
        try {
            const parsed = JSON.parse(content);
            
            return {
                id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'ai_event',
                content: parsed.content || "새로운 사건이 발생했습니다.",
                background: parsed.background || "default_bg",
                music: parsed.music || "default_music",
                questionId: question.id,
                answer: answer,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('이벤트 응답 파싱 실패:', error);
            
            // 파싱 실패 시 기본 이벤트 반환
            return {
                id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'ai_event',
                content: "새로운 사건이 발생했습니다.",
                background: "default_bg",
                music: "default_music",
                questionId: question.id,
                answer: answer,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 시뮬레이션 모드 설정
     */
    setSimulationMode(enabled) {
        this.isSimulationMode = enabled;
        console.log(`시뮬레이션 모드: ${enabled ? '활성화' : '비활성화'}`);
    }

    /**
     * API 상태 확인
     */
    async checkAPIStatus() {
        if (this.isSimulationMode) {
            return { status: 'simulation', message: '시뮬레이션 모드' };
        }
        
        try {
            // 서버리스 API 엔드포인트 상태 확인
            const response = await fetch('/api/story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'test'
                })
            });
            
            if (response.ok) {
                return { status: 'available', message: 'API 사용 가능' };
            } else {
                return { status: 'unavailable', message: 'API 사용 불가' };
            }
        } catch (error) {
            return { status: 'error', message: `API 확인 실패: ${error.message}` };
        }
    }

    /**
     * 스토리 API 호출
     */
    async callStory(prompt) {
        const r = await fetch('/api/story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        return r.json();
    }

    /**
     * 캐릭터 API 호출
     */
    async callCharacter(description) {
        const r = await fetch('/api/character', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description })
        });
        return r.json();
    }

    /**
     * 대화 API 호출
     */
    async callDialogue(utterance, context) {
        const r = await fetch('/api/dialogue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ utterance, context })
        });
        return r.json();
    }
}