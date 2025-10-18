export const API_CONFIG = {
    defaultProvider: 'gemini',
    gemini: {
        apiKey: getEnvVar('VITE_GEMINI_API_KEY') || getEnvVar('GEMINI_API_KEY'),
        baseURL: 'https://generativelanguage.googleapis.com/v1',
        model: 'gemini-pro',
        enabled: true
    },
    openai: {
        apiKey: getEnvVar('VITE_OPENAI_API_KEY') || getEnvVar('OPENAI_API_KEY'),
        baseURL: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo',
        enabled: false
    },
    simulation: {
        enabled: true,
        fallbackToSimulation: true
    }
};

// 환경 변수 가져오기 헬퍼 함수
function getEnvVar(name) {
    // 브라우저 환경에서는 import.meta.env를 사용
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[name];
    }
    
    // Node.js 환경에서는 process.env를 사용
    if (typeof process !== 'undefined' && process.env) {
        return process.env[name];
    }
    
    return undefined;
}

export function getActiveAPIConfig() {
    const provider = API_CONFIG.defaultProvider;
    if (provider === 'simulation') {
        return { simulationMode: true };
    }
    const config = API_CONFIG[provider];
    if (config && config.enabled && config.apiKey) {
        return {
            simulationMode: false,
            apiKey: config.apiKey,
            baseURL: config.baseURL,
            model: config.model,
            provider: provider
        };
    }
    if (API_CONFIG.simulation.fallbackToSimulation) {
        console.warn(`${provider} API가 설정되지 않았습니다. 시뮬레이션 모드로 대체합니다.`);
        return { simulationMode: true };
    }
    throw new Error(`${provider} API가 설정되지 않았습니다.`);
}
