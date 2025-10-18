/**
 * TW 모델 RPY 생성기
 * 렌파이 스크립트 파일 생성 및 패키징
 */

import { TWTemplateEngine } from './template-engine.js';
import { TWFileStructure } from '../utils/file-structure.js';
import { TWBottleneckMapper } from '../utils/bottleneck-mapper.js';

/**
 * TW RPY 생성기
 */
export class TWRPYGenerator {
    constructor() {
        this.templateEngine = new TWTemplateEngine();
        this.fileStructure = new TWFileStructure();
        this.bottleneckMapper = new TWBottleneckMapper();
        
        // 기본 템플릿
        this.templates = {
            main: `
# 렌파이 메인 스크립트
# TW 모델 기반 자동 생성

define narrator = nvl_narrator

# 스토리 시작
label start:
    scene bg classroom
    show protagonist normal
    
    narrator "{{storyInfo.description}}"
    
    # 기 병목으로 이동
    jump story_gi

# 기 병목
label story_gi:
    call story_gi_1
    call story_gi_2
    jump story_seung

# 승 병목
label story_seung:
    call story_seung_1
    call story_seung_2
    jump story_ending

# 임시 엔딩 (MVP 단계)
label story_ending:
    scene bg ending
    narrator "스토리가 완료되었습니다. (MVP 버전)"
    
    # TODO: 전, 결 병목 구현 예정
    jump ending

# 엔딩
label ending:
    scene black
    narrator "끝"
    return
`,
            
            character: `
# 캐릭터 정의 스크립트

{{#each characters}}
define {{id}} = Character("{{name}}", color="{{color}}")
{{/each}}

# 주인공 정의
define protagonist = Character("{{storyInfo.protagonist}}", color="#ffffff")
`,
            
            gi: `
# 기(Setup) 병목 스크립트
# 서론 및 설정 단계

{{#each segments}}
# {{name}} 세그먼트
label {{id}}:
{{#each events}}
    # 이벤트: {{id}}
    {{#if background}}scene bg {{background}}{{/if}}
    {{#if music}}play music {{music}}{{/if}}
    {{#if characters}}
    {{#each characters}}
    show {{this}} normal
    {{/each}}
    {{/if}}
    narrator "{{content}}"
{{/each}}
    {{#each choices}}
    # 선택지: {{id}}
    menu:
        "{{question}}":
        {{#each choices}}
            "{{label}}":
                $ {{variable}} = "{{value}}"
                jump {{nextBottleneck}}
        {{/each}}
{{/each}}
    return
{{/each}}
`,
            
            seung: `
# 승(Confrontation) 병목 스크립트
# 갈등 및 대립 단계

{{#each segments}}
# {{name}} 세그먼트
label {{id}}:
{{#each events}}
    # 이벤트: {{id}}
    {{#if background}}scene bg {{background}}{{/if}}
    {{#if music}}play music {{music}}{{/if}}
    {{#if characters}}
    {{#each characters}}
    show {{this}} normal
    {{/each}}
    {{/if}}
    narrator "{{content}}"
{{/each}}
    {{#each choices}}
    # 선택지: {{id}}
    menu:
        "{{question}}":
        {{#each choices}}
            "{{label}}":
                $ {{variable}} = "{{value}}"
                jump {{nextBottleneck}}
        {{/each}}
{{/each}}
    return
{{/each}}
`,
            
            ten: `
# 전(Climax) 병목 스크립트
# 절정 및 위기 단계
# TODO: MVP 단계 이후 구현 예정

label story_ten:
    scene bg placeholder
    narrator "전 병목은 MVP 단계 이후 구현될 예정입니다."
    
    # 임시로 다음 단계로 이동
    jump story_ketsu
    
    return
`,
            
            ketsu: `
# 결(Resolution) 병목 스크립트
# 결말 및 해결 단계
# TODO: MVP 단계 이후 구현 예정

label story_ketsu:
    scene bg placeholder
    narrator "결 병목은 MVP 단계 이후 구현될 예정입니다."
    
    # 임시로 엔딩으로 이동
    jump ending
    
    return
`,
            
            options: `
# 게임 옵션 설정
init python:
    # 게임 기본 설정
    config.name = "{{storyInfo.title}}"
    config.version = "1.0"
    config.screen_width = 800
    config.screen_height = 600
    
    # 저장 슬롯 수
    config.save_directory = "{{storyInfo.title}}"
    
    # 번역 설정
    config.default_language = "korean"
    
    # 텍스트 속도 설정
    config.default_text_cps = 50
    
    # 자동 저장 설정
    config.autosave_frequency = 2
`,
            
            gui: `
# GUI 설정 스크립트
init -2 python:
    # 테마 색상 설정
    theme.accent = "#007bff"
    theme.text_color = "#ffffff"
    theme.interface_color = "#404040"
    
    # 텍스트 상자 설정
    style.say_window.background = Frame("images/gui/textbox.png", 12, 12)
    
    # 메뉴 설정
    style.mm_button.background = Frame("images/gui/button.png", 12, 12)
    
    # 선택지 설정
    style.menu_choice_button.background = Frame("images/gui/choice.png", 12, 12)
    
    # NVL 모드 설정
    style.nvl_window.background = Frame("images/gui/nvl.png", 12, 12)
    style.nvl_dialogue.xpos = 50
    style.nvl_dialogue.ypos = 50
`
        };
    }

    /**
     * 전체 RPY 프로젝트 생성
     */
    async generate(storyState) {
        const projectFiles = new Map();
        
        try {
            // 기본 파일 구조 생성
            const basicFiles = this.fileStructure.createBasicStructure(storyState);
            basicFiles.forEach((content, path) => {
                projectFiles.set(path, content);
            });
            
            // 메인 스크립트 생성
            const mainScript = this.generateMainScript(storyState);
            projectFiles.set('game/script/script.rpy', mainScript);
            
            // 병목별 스크립트 생성
            const bottleneckScripts = this.generateBottleneckScripts(storyState);
            bottleneckScripts.forEach((content, path) => {
                projectFiles.set(path, content);
            });
            
            // 캐릭터 스크립트 생성
            const characterScript = this.generateCharacterScript(storyState);
            projectFiles.set('game/script/characters.rpy', characterScript);
            
            // 옵션 파일 생성
            const optionsScript = this.generateOptionsScript(storyState);
            projectFiles.set('game/script/options.rpy', optionsScript);
            
            // GUI 파일 생성
            const guiScript = this.generateGuiScript(storyState);
            projectFiles.set('game/script/gui.rpy', guiScript);
            
            return projectFiles;
        } catch (error) {
            console.error('RPY 생성 실패:', error);
            throw new Error('RPY 생성에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 메인 스크립트 생성
     */
    generateMainScript(storyState) {
        return this.templateEngine.render(this.templates.main, storyState);
    }

    /**
     * 병목별 스크립트 생성
     */
    generateBottleneckScripts(storyState) {
        const scripts = new Map();
        
        // 기 병목 스크립트
        const giSegments = storyState.segmentBottlenecks.filter(seg => seg.parentBottleneck === 'gi');
        const giData = {
            segments: giSegments.map(segment => ({
                ...segment,
                events: storyState.eventNodes.filter(event => event.parentSegment === segment.id),
                choices: storyState.choiceNodes.filter(choice => choice.parentSegment === segment.id)
            }))
        };
        
        const giScript = this.templateEngine.render(this.templates.gi, giData);
        scripts.set('game/script/story_gi.rpy', giScript);
        
        // 승 병목 스크립트
        const seungSegments = storyState.segmentBottlenecks.filter(seg => seg.parentBottleneck === 'seung');
        const seungData = {
            segments: seungSegments.map(segment => ({
                ...segment,
                events: storyState.eventNodes.filter(event => event.parentSegment === segment.id),
                choices: storyState.choiceNodes.filter(choice => choice.parentSegment === segment.id)
            }))
        };
        
        const seungScript = this.templateEngine.render(this.templates.seung, seungData);
        scripts.set('game/script/story_seung.rpy', seungScript);
        
        // MVP 단계에서는 전, 결은 TODO로 남김
        const tenScript = this.templates.ten;
        scripts.set('game/script/story_ten.rpy', tenScript);
        
        const ketsuScript = this.templates.ketsu;
        scripts.set('game/script/story_ketsu.rpy', ketsuScript);
        
        return scripts;
    }

    /**
     * 캐릭터 스크립트 생성
     */
    generateCharacterScript(storyState) {
        // 이벤트에서 캐릭터 추출
        const characters = this.extractCharacters(storyState);
        
        const characterData = {
            characters: characters,
            storyInfo: storyState.storyInfo
        };
        
        return this.templateEngine.render(this.templates.character, characterData);
    }

    /**
     * 옵션 스크립트 생성
     */
    generateOptionsScript(storyState) {
        return this.templateEngine.render(this.templates.options, storyState);
    }

    /**
     * GUI 스크립트 생성
     */
    generateGuiScript(storyState) {
        return this.templateEngine.render(this.templates.gui, storyState);
    }

    /**
     * 캐릭터 추출
     */
    extractCharacters(storyState) {
        const characters = new Set();
        
        // 이벤트에서 캐릭터 추출
        storyState.eventNodes.forEach(event => {
            if (event.characters) {
                event.characters.forEach(char => characters.add(char));
            }
        });
        
        // 기본 캐릭터 목록으로 변환
        return Array.from(characters).map(charId => ({
            id: charId,
            name: this.capitalize(charId),
            color: this.generateCharacterColor(charId)
        }));
    }

    /**
     * 캐릭터 색상 생성
     */
    generateCharacterColor(characterId) {
        const colorMap = {
            'protagonist': '#ffffff',
            'friend': '#00ff00',
            'rival': '#ff0000',
            'mentor': '#0000ff',
            'love_interest': '#ff00ff'
        };
        
        return colorMap[characterId] || this.generateRandomColor();
    }

    /**
     * 랜덤 색상 생성
     */
    generateRandomColor() {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
            '#ff9ff3', '#54a0ff', '#48dbfb', '#0abde3', '#006ba6'
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * 문자열 첫 글자 대문자화
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * 템플릿 추가
     */
    addTemplate(name, template) {
        this.templates[name] = template;
    }

    /**
     * 템플릿 제거
     */
    removeTemplate(name) {
        delete this.templates[name];
    }

    /**
     * 템플릿 가져오기
     */
    getTemplate(name) {
        return this.templates[name];
    }

    /**
     * 사용자 정의 템플릿으로 스크립트 생성
     */
    generateCustomScript(templateName, data) {
        const template = this.getTemplate(templateName);
        if (!template) {
            throw new Error(`템플릿을 찾을 수 없습니다: ${templateName}`);
        }
        
        return this.templateEngine.render(template, data);
    }

    /**
     * 스크립트 유효성 검사
     */
    validateScript(script) {
        const errors = [];
        
        // 기본 렌파이 문법 검사
        if (!script.includes('label')) {
            errors.push('스크립트에 레이블이 없습니다.');
        }
        
        if (!script.includes('narrator') && !script.includes('say')) {
            errors.push('스크립트에 대화가 없습니다.');
        }
        
        // 변수 사용 검사
        const variableMatches = script.match(/\$\s+(\w+)/g);
        if (variableMatches) {
            variableMatches.forEach(match => {
                const variable = match.replace(/^\$\s+/, '');
                if (!script.includes(`$ ${variable} =`)) {
                    errors.push(`변수 ${variable}가 정의되지 않았습니다.`);
                }
            });
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 생성된 스크립트 미리보기
     */
    previewScript(storyState) {
        try {
            const mainScript = this.generateMainScript(storyState);
            const characterScript = this.generateCharacterScript(storyState);
            const optionsScript = this.generateOptionsScript(storyState);
            const guiScript = this.generateGuiScript(storyState);
            
            const giSegments = storyState.segmentBottlenecks.filter(seg => seg.parentBottleneck === 'gi');
            const giData = {
                segments: giSegments.map(segment => ({
                    ...segment,
                    events: storyState.eventNodes.filter(event => event.parentSegment === segment.id),
                    choices: storyState.choiceNodes.filter(choice => choice.parentSegment === segment.id)
                }))
            };
            
            const giScript = this.templateEngine.render(this.templates.gi, giData);
            
            return {
                main: mainScript,
                character: characterScript,
                options: optionsScript,
                gui: guiScript,
                gi: giScript
            };
        } catch (error) {
            console.error('스크립트 미리보기 실패:', error);
            throw new Error('스크립트 미리보기에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 프로젝트 통계 정보 생성
     */
    generateProjectStatistics(storyState) {
        return {
            storyInfo: {
                title: storyState.storyInfo.title,
                protagonist: storyState.storyInfo.protagonist,
                theme: storyState.storyInfo.theme,
                createdAt: storyState.storyInfo.createdAt,
                updatedAt: storyState.storyInfo.updatedAt
            },
            content: {
                totalEvents: storyState.eventNodes.length,
                totalChoices: storyState.choiceNodes.length,
                totalSegments: storyState.segmentBottlenecks.length,
                totalQuestions: storyState.aiQuestions.length
            },
            structure: {
                bottlenecks: Object.keys(storyState.mainBottlenecks).length,
                completedBottlenecks: Object.values(storyState.mainBottlenecks).filter(b => b.completed).length,
                variables: Object.keys(storyState.storyVariables).length
            },
            files: {
                scriptFiles: 7, // script.rpy, story_gi.rpy, story_seung.rpy, story_ten.rpy, story_ketsu.rpy, characters.rpy, options.rpy, gui.rpy
                imageFiles: 0, // 동적으로 생성
                audioFiles: 0  // 동적으로 생성
            }
        };
    }
}