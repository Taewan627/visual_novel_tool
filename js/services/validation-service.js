/**
 * TW 모델 유효성 검사 서비스
 * 입력 데이터의 유효성을 검사하고 오류 메시지를 제공
 */

/**
 * TW 유효성 검사 서비스
 */
export class ValidationService {
    constructor() {
        this.rules = {
            storyInfo: {
                title: {
                    required: true,
                    minLength: 1,
                    maxLength: 100,
                    pattern: /^[가-힣a-zA-Z0-9\s\-_.,!?]+$/
                },
                protagonist: {
                    required: true,
                    minLength: 1,
                    maxLength: 50,
                    pattern: /^[가-힣a-zA-Z0-9\s\-_]+$/
                },
                theme: {
                    required: true,
                    minLength: 1,
                    maxLength: 50,
                    pattern: /^[가-힣a-zA-Z0-9\s\-_]+$/
                },
                description: {
                    required: false,
                    maxLength: 500,
                    pattern: /^[가-힣a-zA-Z0-9\s\-_.,!?()'"\\]+$/
                }
            },
            question: {
                ask: {
                    required: true,
                    minLength: 5,
                    maxLength: 200
                },
                choices: {
                    required: true,
                    minItems: 2,
                    maxItems: 6,
                    itemPattern: /^[가-힣a-zA-Z0-9\s\-_.,!?]+$/
                }
            },
            event: {
                content: {
                    required: true,
                    minLength: 5,
                    maxLength: 300
                },
                background: {
                    required: false,
                    pattern: /^[a-z0-9_]+$/
                },
                music: {
                    required: false,
                    pattern: /^[a-z0-9_]+$/
                }
            },
            choice: {
                question: {
                    required: true,
                    minLength: 5,
                    maxLength: 200
                },
                choices: {
                    required: true,
                    minItems: 2,
                    maxItems: 4,
                    validateItems: true
                }
            }
        };
        
        this.errorMessages = {
            required: '이 필드는 필수입니다.',
            minLength: '최소 {min}자 이상 입력해주세요.',
            maxLength: '최대 {max}자까지 입력할 수 있습니다.',
            pattern: '유효하지 않은 형식입니다.',
            minItems: '최소 {min}개 이상 선택해주세요.',
            maxItems: '최대 {max}개까지 선택할 수 있습니다.',
            invalidBottleneck: '유효하지 않은 병목입니다.',
            invalidSegment: '유효하지 않은 세그먼트입니다.',
            invalidChoice: '유효하지 않은 선택입니다.',
            invalidNode: '유효하지 않은 노드입니다.'
        };
    }

    /**
     * 스토리 정보 유효성 검사
     */
    validateStoryInfo(storyInfo) {
        const errors = [];
        const warnings = [];
        
        if (!storyInfo || typeof storyInfo !== 'object') {
            errors.push('스토리 정보는 객체여야 합니다.');
            return { valid: false, errors, warnings };
        }
        
        // 각 필드 검사
        Object.keys(this.rules.storyInfo).forEach(field => {
            const fieldRules = this.rules.storyInfo[field];
            const fieldValue = storyInfo[field];
            const fieldErrors = this.validateField(fieldValue, fieldRules, field);
            
            errors.push(...fieldErrors);
        });
        
        // 특수 검사
        this.validateStoryInfoSpecial(storyInfo, errors, warnings);
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * 스토리 정보 특수 검사
     */
    validateStoryInfoSpecial(storyInfo, errors, warnings) {
        // 제목과 주인공 이름이 같은 경우 경고
        if (storyInfo.title && storyInfo.protagonist && 
            storyInfo.title.trim().toLowerCase() === storyInfo.protagonist.trim().toLowerCase()) {
            warnings.push('제목과 주인공 이름이 같습니다. 다르게 설정하는 것을 권장합니다.');
        }
        
        // 설명이 너무 짧은 경우 경고
        if (storyInfo.description && storyInfo.description.trim().length < 10) {
            warnings.push('설명이 너무 짧습니다. 더 자세한 설명을 추가하는 것을 권장합니다.');
        }
    }

    /**
     * 질문 유효성 검사
     */
    validateQuestion(question) {
        const errors = [];
        const warnings = [];
        
        if (!question || typeof question !== 'object') {
            errors.push('질문은 객체여야 합니다.');
            return { valid: false, errors, warnings };
        }
        
        // 필수 필드 검사
        if (!question.id || typeof question.id !== 'string') {
            errors.push('질문 ID는 문자열이어야 합니다.');
        }
        
        if (!question.kind || typeof question.kind !== 'string') {
            errors.push('질문 종류는 문자열이어야 합니다.');
        }
        
        // 질문 내용 검사
        const askErrors = this.validateField(question.ask, this.rules.question.ask, 'ask');
        errors.push(...askErrors);
        
        // 선택지 검사
        if (!Array.isArray(question.choices)) {
            errors.push('선택지는 배열이어야 합니다.');
        } else {
            const choiceErrors = this.validateChoices(question.choices);
            errors.push(...choiceErrors);
        }
        
        // 특수 검사
        this.validateQuestionSpecial(question, errors, warnings);
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * 선택지 유효성 검사
     */
    validateChoices(choices) {
        const errors = [];
        const choiceRules = this.rules.question.choices;
        
        // 선택지 수 검사
        if (choices.length < choiceRules.minItems) {
            errors.push(this.formatErrorMessage(choiceRules, 'minItems'));
        }
        
        if (choices.length > choiceRules.maxItems) {
            errors.push(this.formatErrorMessage(choiceRules, 'maxItems'));
        }
        
        // 각 선택지 검사
        choices.forEach((choice, index) => {
            if (typeof choice !== 'string') {
                errors.push(`선택지 ${index + 1}은 문자열이어야 합니다.`);
                return;
            }
            
            if (choice.trim().length === 0) {
                errors.push(`선택지 ${index + 1}은 비어있을 수 없습니다.`);
                return;
            }
            
            if (choiceRules.pattern && !choiceRules.pattern.test(choice)) {
                errors.push(`선택지 "${choice}"는 유효하지 않은 형식입니다.`);
            }
            
            // 중복 선택지 검사
            const duplicateCount = choices.filter(c => c.trim() === choice.trim()).length;
            if (duplicateCount > 1) {
                errors.push(`선택지 "${choice}"가 중복됩니다.`);
            }
        });
        
        return errors;
    }

    /**
     * 질문 특수 검사
     */
    validateQuestionSpecial(question, errors, warnings) {
        // 질문 내용과 선택지가 겹치는 경우 검사
        if (question.ask && Array.isArray(question.choices)) {
            const askLower = question.ask.toLowerCase().trim();
            const duplicateChoices = question.choices.filter(choice => 
                choice.toLowerCase().trim() === askLower
            );
            
            if (duplicateChoices.length > 0) {
                warnings.push('질문 내용과 선택지가 겹칩니다.');
            }
        }
    }

    /**
     * 이벤트 유효성 검사
     */
    validateEvent(event) {
        const errors = [];
        const warnings = [];
        
        if (!event || typeof event !== 'object') {
            errors.push('이벤트는 객체여야 합니다.');
            return { valid: false, errors, warnings };
        }
        
        // 필수 필드 검사
        if (!event.id || typeof event.id !== 'string') {
            errors.push('이벤트 ID는 문자열이어야 합니다.');
        }
        
        if (!event.parentSegment || typeof event.parentSegment !== 'string') {
            errors.push('부모 세그먼트 ID는 문자열이어야 합니다.');
        }
        
        // 이벤트 내용 검사
        const contentErrors = this.validateField(event.content, this.rules.event.content, 'content');
        errors.push(...contentErrors);
        
        // 선택적 필드 검사
        if (event.background) {
            const backgroundErrors = this.validateField(event.background, this.rules.event.background, 'background');
            errors.push(...backgroundErrors);
        }
        
        if (event.music) {
            const musicErrors = this.validateField(event.music, this.rules.event.music, 'music');
            errors.push(...musicErrors);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * 선택 노드 유효성 검사
     */
    validateChoiceNode(choiceNode) {
        const errors = [];
        const warnings = [];
        
        if (!choiceNode || typeof choiceNode !== 'object') {
            errors.push('선택 노드는 객체여야 합니다.');
            return { valid: false, errors, warnings };
        }
        
        // 필수 필드 검사
        if (!choiceNode.id || typeof choiceNode.id !== 'string') {
            errors.push('선택 노드 ID는 문자열이어야 합니다.');
        }
        
        if (!choiceNode.parentSegment || typeof choiceNode.parentSegment !== 'string') {
            errors.push('부모 세그먼트 ID는 문자열이어야 합니다.');
        }
        
        // 질문 내용 검사
        const questionErrors = this.validateField(choiceNode.question, this.rules.choice.question, 'question');
        errors.push(...questionErrors);
        
        // 선택지 검사
        if (!Array.isArray(choiceNode.choices)) {
            errors.push('선택지는 배열이어야 합니다.');
        } else {
            if (choiceNode.choices.length < 2) {
                errors.push('선택지는 최소 2개 이상이어야 합니다.');
            }
            
            if (choiceNode.choices.length > 4) {
                errors.push('선택지는 최대 4개까지 가능합니다.');
            }
            
            // 각 선택지 검사
            choiceNode.choices.forEach((choice, index) => {
                if (!choice || typeof choice !== 'object') {
                    errors.push(`선택지 ${index + 1}은 객체여야 합니다.`);
                    return;
                }
                
                if (!choice.label || typeof choice.label !== 'string') {
                    errors.push(`선택지 ${index + 1}의 레이블은 문자열이어야 합니다.`);
                }
                
                if (!choice.variable || typeof choice.variable !== 'string') {
                    errors.push(`선택지 ${index + 1}의 변수는 문자열이어야 합니다.`);
                }
                
                if (!choice.value || typeof choice.value !== 'string') {
                    errors.push(`선택지 ${index + 1}의 값은 문자열이어야 합니다.`);
                }
                
                if (!choice.nextBottleneck || typeof choice.nextBottleneck !== 'string') {
                    errors.push(`선택지 ${index + 1}의 다음 병목은 문자열이어야 합니다.`);
                }
                
                // 다음 병목 유효성 검사
                const validBottlenecks = ['gi', 'seung', 'ten', 'ketsu'];
                if (!validBottlenecks.includes(choice.nextBottleneck)) {
                    errors.push(`선택지 ${index + 1}의 다음 병목이 유효하지 않습니다: ${choice.nextBottleneck}`);
                }
            });
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * 컨텍스트 유효성 검사
     */
    validateContext(context) {
        const errors = [];
        const warnings = [];
        
        if (!context || typeof context !== 'object') {
            errors.push('컨텍스트는 객체여야 합니다.');
            return { valid: false, errors, warnings };
        }
        
        // 필수 필드 검사
        if (!context.currentBottleneck) {
            errors.push('현재 병목은 필수입니다.');
        } else {
            const validBottlenecks = ['gi', 'seung', 'ten', 'ketsu'];
            if (!validBottlenecks.includes(context.currentBottleneck)) {
                errors.push(`유효하지 않은 병목입니다: ${context.currentBottleneck}`);
            }
        }
        
        if (!context.currentSegment) {
            errors.push('현재 세그먼트는 필수입니다.');
        }
        
        // 배열 필드 검사
        if (context.recentAnswers && !Array.isArray(context.recentAnswers)) {
            errors.push('최근 답변은 배열이어야 합니다.');
        }
        
        if (context.storyVariables && typeof context.storyVariables !== 'object') {
            errors.push('스토리 변수는 객체여야 합니다.');
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * 필드 유효성 검사
     */
    validateField(value, rules, fieldName) {
        const errors = [];
        
        // 필수 여부 검사
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${fieldName}: ${this.errorMessages.required}`);
            return errors;
        }
        
        // 값이 없고 필수가 아닌 경우 검사 중단
        if (value === undefined || value === null || value === '') {
            return errors;
        }
        
        // 최소 길이 검사
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${fieldName}: ${this.formatErrorMessage(rules, 'minLength')}`);
        }
        
        // 최대 길이 검사
        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${fieldName}: ${this.formatErrorMessage(rules, 'maxLength')}`);
        }
        
        // 패턴 검사
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${fieldName}: ${this.errorMessages.pattern}`);
        }
        
        return errors;
    }

    /**
     * 오류 메시지 포맷팅
     */
    formatErrorMessage(rules, errorType) {
        let message = this.errorMessages[errorType];
        
        if (errorType === 'minLength' && rules.minLength) {
            message = message.replace('{min}', rules.minLength);
        }
        
        if (errorType === 'maxLength' && rules.maxLength) {
            message = message.replace('{max}', rules.maxLength);
        }
        
        if (errorType === 'minItems' && rules.minItems) {
            message = message.replace('{min}', rules.minItems);
        }
        
        if (errorType === 'maxItems' && rules.maxItems) {
            message = message.replace('{max}', rules.maxItems);
        }
        
        return message;
    }

    /**
     * 규칙 추가
     */
    addRule(category, field, rule) {
        if (!this.rules[category]) {
            this.rules[category] = {};
        }
        
        this.rules[category][field] = { ...this.rules[category][field], ...rule };
    }

    /**
     * 규칙 제거
     */
    removeRule(category, field, ruleName) {
        if (!this.rules[category] || !this.rules[category][field]) {
            return false;
        }
        
        delete this.rules[category][field][ruleName];
        return true;
    }

    /**
     * 오류 메시지 추가
     */
    addErrorMessage(errorType, message) {
        this.errorMessages[errorType] = message;
    }

    /**
     * 오류 메시지 제거
     */
    removeErrorMessage(errorType) {
        delete this.errorMessages[errorType];
    }

    /**
     * 사용자 정의 검사기 추가
     */
    addValidator(name, validator) {
        this.customValidators = this.customValidators || {};
        this.customValidators[name] = validator;
    }

    /**
     * 사용자 정의 검사기 제거
     */
    removeValidator(name) {
        if (this.customValidators) {
            delete this.customValidators[name];
        }
    }

    /**
     * 사용자 정의 검사 실행
     */
    runCustomValidator(name, data) {
        if (!this.customValidators || !this.customValidators[name]) {
            return { valid: false, errors: [`검사기 "${name}"를 찾을 수 없습니다.`] };
        }
        
        return this.customValidators[name](data);
    }

    /**
     * 전체 유효성 검사 결과 포맷팅
     */
    formatValidationResult(result) {
        if (result.valid) {
            return {
                success: true,
                message: '유효성 검사를 통과했습니다.'
            };
        } else {
            return {
                success: false,
                message: '유효성 검사에 실패했습니다.',
                errors: result.errors,
                warnings: result.warnings || []
            };
        }
    }

    /**
     * 여러 항목 일괄 유효성 검사
     */
    validateBatch(items, validatorName) {
        const results = [];
        const allErrors = [];
        const allWarnings = [];
        let hasInvalidItem = false;
        
        items.forEach((item, index) => {
            let result;
            
            if (validatorName === 'storyInfo') {
                result = this.validateStoryInfo(item);
            } else if (validatorName === 'question') {
                result = this.validateQuestion(item);
            } else if (validatorName === 'event') {
                result = this.validateEvent(item);
            } else if (validatorName === 'choice') {
                result = this.validateChoiceNode(item);
            } else {
                result = { valid: false, errors: [`알 수 없는 검사기: ${validatorName}`] };
            }
            
            results.push({
                index,
                item,
                ...result
            });
            
            if (!result.valid) {
                hasInvalidItem = true;
                allErrors.push(...result.errors.map(error => `항목 ${index + 1}: ${error}`));
            }
            
            if (result.warnings) {
                allWarnings.push(...result.warnings.map(warning => `항목 ${index + 1}: ${warning}`));
            }
        });
        
        return {
            valid: !hasInvalidItem,
            results,
            errors: allErrors,
            warnings: allWarnings
        };
    }
}