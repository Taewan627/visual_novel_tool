/**
 * TW 모델 템플릿 엔진
 * 템플릿 처리 및 변수 바인딩을 담당
 */

/**
 * TW 템플릿 엔진
 */
export class TWTemplateEngine {
    constructor() {
        this.helpers = {
            uppercase: (str) => str ? str.toUpperCase() : '',
            lowercase: (str) => str ? str.toLowerCase() : '',
            capitalize: (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '',
            formatDate: (date) => {
                if (!date) return '';
                const d = new Date(date);
                return d.toLocaleDateString();
            },
            formatTime: (date) => {
                if (!date) return '';
                const d = new Date(date);
                return d.toLocaleTimeString();
            },
            formatDateTime: (date) => {
                if (!date) return '';
                const d = new Date(date);
                return d.toLocaleString();
            },
            escapeRenpy: (str) => {
                if (!str) return '';
                return str.replace(/"/g, '\\"').replace(/\n/g, '\\n');
            },
            pluralize: (count, singular, plural) => {
                return count === 1 ? singular : (plural || singular + 's');
            },
            default: (value, defaultValue) => {
                return value !== undefined && value !== null ? value : defaultValue;
            }
        };
    }

    /**
     * 템플릿 렌더링
     */
    render(template, data) {
        if (!template) return '';
        if (!data) return template;
        
        let result = template;
        
        // 변수 치환
        result = this.replaceVariables(result, data);
        
        // 조건문 처리
        result = this.processConditionals(result, data);
        
        // 반복문 처리
        result = this.processLoops(result, data);
        
        // 헬퍼 함수 처리
        result = this.processHelpers(result, data);
        
        // 포함 파일 처리
        result = this.processIncludes(result, data);
        
        return result;
    }

    /**
     * 변수 치환
     */
    replaceVariables(template, data) {
        // 기본 변수 치환 {{variable}}
        return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const value = this.getNestedValue(data, path.trim());
            return value !== undefined && value !== null ? String(value) : match;
        });
    }

    /**
     * 조건문 처리
     */
    processConditionals(template, data) {
        // if 문 처리 {{#if condition}} ... {{/if}}
        const ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
        
        return template.replace(ifRegex, (match, condition, content) => {
            const value = this.evaluateCondition(condition.trim(), data);
            return value ? content : '';
        });
    }

    /**
     * unless 문 처리
     */
    processUnlessStatements(template, data) {
        // unless 문 처리 {{#unless condition}} ... {{/unless}}
        const unlessRegex = /\{\{#unless\s+([^}]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g;
        
        return template.replace(unlessRegex, (match, condition, content) => {
            const value = this.evaluateCondition(condition.trim(), data);
            return !value ? content : '';
        });
    }

    /**
     * 조건 평가
     */
    evaluateCondition(condition, data) {
        // 단순 변수 확인
        if (!condition.includes(' ') && !condition.includes('==') && !condition.includes('!=')) {
            const value = this.getNestedValue(data, condition);
            return this.isTruthy(value);
        }
        
        // 비교 연산자 처리
        const comparisonRegex = /^([^=!\s]+)\s*(==|!=)\s*(.+)$/;
        const match = condition.match(comparisonRegex);
        
        if (match) {
            const [, left, operator, right] = match;
            const leftValue = this.getNestedValue(data, left.trim());
            const rightValue = this.parseValue(right.trim());
            
            if (operator === '==') {
                return leftValue == rightValue;
            } else if (operator === '!=') {
                return leftValue != rightValue;
            }
        }
        
        return false;
    }

    /**
     * 값 파싱
     */
    parseValue(value) {
        // 문자열
        if (value.startsWith('"') && value.endsWith('"')) {
            return value.slice(1, -1);
        }
        
        // 숫자
        if (!isNaN(value) && value !== '') {
            return Number(value);
        }
        
        // 불리언
        if (value === 'true') return true;
        if (value === 'false') return false;
        
        // null
        if (value === 'null') return null;
        
        // 변수
        return value;
    }

    /**
     * 반복문 처리
     */
    processLoops(template, data) {
        // each 문 처리 {{#each array}} ... {{/each}}
        const eachRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
        
        return template.replace(eachRegex, (match, arrayPath, content) => {
            const array = this.getNestedValue(data, arrayPath.trim());
            
            if (!array || !Array.isArray(array)) {
                return '';
            }
            
            return array.map((item, index) => {
                let itemContent = content;
                
                // {{this}} 치환
                itemContent = itemContent.replace(/\{\{this\}\}/g, item !== undefined && item !== null ? String(item) : '');
                
                // {{@index}} 치환
                itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));
                
                // {{@first}} 치환
                itemContent = itemContent.replace(/\{\{@first\}\}/g, index === 0 ? 'true' : 'false');
                
                // {{@last}} 치환
                itemContent = itemContent.replace(/\{\{@last\}\}/g, index === array.length - 1 ? 'true' : 'false');
                
                // 객체 속성 치환
                if (typeof item === 'object' && item !== null) {
                    Object.keys(item).forEach(key => {
                        const itemRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                        const value = item[key] !== undefined && item[key] !== null ? String(item[key]) : '';
                        itemContent = itemContent.replace(itemRegex, value);
                    });
                }
                
                return itemContent;
            }).join('');
        });
    }

    /**
     * 헬퍼 함수 처리
     */
    processHelpers(template, data) {
        // 헬퍼 함수 처리 {{helperName value}}
        const helperRegex = /\{\{(\w+)\s+([^}]+)\}\}/g;
        
        return template.replace(helperRegex, (match, helperName, value) => {
            if (this.helpers[helperName]) {
                // 값이 변수인 경우
                if (value.trim().startsWith('{{') && value.trim().endsWith('}}')) {
                    const variablePath = value.trim().slice(2, -2);
                    const actualValue = this.getNestedValue(data, variablePath.trim());
                    return this.helpers[helperName](actualValue);
                }
                
                // 직접 값인 경우
                return this.helpers[helperName](value);
            }
            return match;
        });
    }

    /**
     * 포함 파일 처리
     */
    processIncludes(template, data) {
        // include 문 처리 {{include 'templateName'}}
        const includeRegex = /\{\{include\s+['"]([^'"]+)['"]\}\}/g;
        
        return template.replace(includeRegex, (match, templateName) => {
            // 실제 구현에서는 템플릿 파일을 로드해야 함
            // 여기서는 간단한 주석으로 대체
            return `<!-- Included template: ${templateName} -->`;
        });
    }

    /**
     * 중첩 값 가져오기
     */
    getNestedValue(obj, path) {
        if (!path || !obj) return undefined;
        
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * 진실 여부 확인
     */
    isTruthy(value) {
        return value !== undefined && value !== null && value !== false && value !== '' && value !== 0;
    }

    /**
     * 헬퍼 함수 추가
     */
    addHelper(name, func) {
        this.helpers[name] = func;
    }

    /**
     * 헬퍼 함수 제거
     */
    removeHelper(name) {
        delete this.helpers[name];
    }

    /**
     * 템플릿 캐시
     */
    cache = new Map();

    /**
     * 캐시된 템플릿 렌더링
     */
    renderCached(template, data, cacheKey) {
        const key = cacheKey || template;
        
        if (this.cache.has(key)) {
            const cachedTemplate = this.cache.get(key);
            return this.render(cachedTemplate, data);
        }
        
        const result = this.render(template, data);
        this.cache.set(key, template);
        
        return result;
    }

    /**
     * 캐시 초기화
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * 템플릿 사전 컴파일
     */
    precompileTemplate(template) {
        let compiled = template;
        
        // 조건문과 반복문을 미리 컴파일
        compiled = this.precompileConditionals(compiled);
        compiled = this.precompileLoops(compiled);
        
        return compiled;
    }

    /**
     * 조건문 사전 컴파일
     */
    precompileConditionals(template) {
        // if/else 문 처리
        const ifElseRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
        
        return template.replace(ifElseRegex, (match, condition, ifContent, elseContent) => {
            return `{{#if ${condition}}}${ifContent}{{#unless ${condition}}}${elseContent}{{/unless}}{{/if}}`;
        });
    }

    /**
     * 반복문 사전 컴파일
     */
    precompileLoops(template) {
        // 반복문 최적화
        // 복잡한 로직은 여기에 구현
        return template;
    }

    /**
     * 템플릿 유효성 검사
     */
    validateTemplate(template) {
        if (!template || typeof template !== 'string') {
            return { valid: false, errors: ['템플릿은 문자열이어야 합니다.'] };
        }
        
        const errors = [];
        
        // 중괄호 짝 검사
        const openBraces = (template.match(/\{\{/g) || []).length;
        const closeBraces = (template.match(/\}\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
            errors.push('중괄호 짝이 맞지 않습니다.');
        }
        
        // 미닫힌 블록 검사
        const blockTypes = ['if', 'unless', 'each'];
        blockTypes.forEach(blockType => {
            const openBlocks = (template.match(new RegExp(`\\{\\{#${blockType}\\s+`, 'g')) || []).length;
            const closeBlocks = (template.match(new RegExp(`\\{\\{/${blockType}\\}\\}`, 'g')) || []).length;
            
            if (openBlocks !== closeBlocks) {
                errors.push(`${blockType} 블록이 제대로 닫히지 않았습니다.`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 템플릿에서 사용된 변수 목록 추출
     */
    extractVariables(template) {
        const variables = new Set();
        
        // 일반 변수 추출
        const variableMatches = template.match(/\{\{([^#\/][^}]*)\}\}/g);
        if (variableMatches) {
            variableMatches.forEach(match => {
                const variable = match.replace(/^\{\{|\}\}$/g, '').trim();
                if (variable && !variable.includes(' ')) {
                    variables.add(variable);
                }
            });
        }
        
        // 반복문 변수 추출
        const eachMatches = template.match(/\{\{#each\s+([^}]+)\}\}/g);
        if (eachMatches) {
            eachMatches.forEach(match => {
                const arrayPath = match.replace(/^\{\{#each\s+|\}\}$/g, '').trim();
                variables.add(arrayPath);
            });
        }
        
        return Array.from(variables);
    }
}