/**
 * TW 모델 렌파이 비주얼노벨 생성기 메인 애플리케이션
 */

import { TWStoryController } from './controllers/story-controller.js';
import { TWUIController } from './controllers/ui-controller.js';
import { TWStateManager } from './data/state-manager.js';

/**
 * 메인 애플리케이션 클래스
 */
class TWApp {
    constructor() {
        this.storyController = null;
        this.uiController = null;
        this.stateManager = null;
        this.isInitialized = false;
    }

    /**
     * 애플리케이션 초기화
     */
    async initialize() {
        try {
            this.showStatus('애플리케이션 초기화 중...', 'processing');

            // 상태 관리자 초기화
            this.stateManager = new TWStateManager();
            
            // 스토리 컨트롤러 초기화
            this.storyController = new TWStoryController(this.stateManager);
            
            // UI 컨트롤러 초기화
            this.uiController = new TWUIController(this.storyController, this.stateManager);
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 저장된 상태 로드 시도
            await this.loadSavedState();
            
            this.isInitialized = true;
            this.showStatus('애플리케이션이 준비되었습니다', 'ready');
            
            console.log('TW 애플리케이션이 성공적으로 초기화되었습니다');
            
        } catch (error) {
            console.error('애플리케이션 초기화 실패:', error);
            this.showStatus('애플리케이션 초기화 실패', 'error');
            this.showNotification('애플리케이션 초기화에 실패했습니다: ' + error.message, 'error');
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 저장 버튼
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveCurrentState();
        });

        // 불러오기 버튼
        document.getElementById('load-btn').addEventListener('click', () => {
            this.loadState();
        });

        // 내보내기 버튼
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportProject();
        });

        // 스토리 정보 편집 버튼
        document.getElementById('edit-story-info').addEventListener('click', () => {
            this.uiController.openStoryInfoModal();
        });

        // 모달 닫기 버튼들
        document.getElementById('close-story-info-modal').addEventListener('click', () => {
            this.uiController.closeStoryInfoModal();
        });

        document.getElementById('cancel-edit').addEventListener('click', () => {
            this.uiController.closeStoryInfoModal();
        });

        document.getElementById('save-edit').addEventListener('click', () => {
            this.uiController.saveStoryInfoFromModal();
        });

        // 모달 외부 클릭 시 닫기
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') {
                this.uiController.closeAllModals();
            }
        });

        // 스토리 정보 폼 제출
        document.getElementById('story-info-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStoryInfoSubmit(e);
        });

        // 편집 폼 제출
        document.getElementById('edit-story-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uiController.saveStoryInfoFromModal();
        });

        // 다음 단계 버튼
        document.getElementById('next-step-button').addEventListener('click', () => {
            this.uiController.moveToNextStep();
        });

        // 키보드 단축키
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // 페이지 언로드 시 자동 저장
        window.addEventListener('beforeunload', (e) => {
            if (this.stateManager && this.stateManager.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '저장되지 않은 변경사항이 있습니다. 정말 나가시겠습니까?';
                return e.returnValue;
            }
        });
    }

    /**
     * 스토리 정보 폼 제출 처리
     */
    async handleStoryInfoSubmit(event) {
        try {
            const formData = new FormData(event.target);
            const storyInfo = {
                title: formData.get('title'),
                protagonist: formData.get('protagonist'),
                theme: formData.get('theme'),
                description: formData.get('description')
            };

            // 유효성 검사
            if (!this.validateStoryInfo(storyInfo)) {
                return;
            }

            this.showStatus('스토리 초기화 중...', 'processing');

            // 스토리 초기화
            await this.storyController.initializeStory(storyInfo);
            
            // UI 업데이트
            this.uiController.hideStoryInfoSection();
            this.uiController.showQuestionSection();
            this.uiController.updateStoryInfoPanel();
            this.uiController.updateTimeline();
            
            // 첫 번째 질문 생성
            await this.generateFirstQuestion();
            
            this.showStatus('스토리가 시작되었습니다', 'ready');
            
        } catch (error) {
            console.error('스토리 정보 제출 실패:', error);
            this.showStatus('스토리 초기화 실패', 'error');
            this.showNotification('스토리 초기화에 실패했습니다: ' + error.message, 'error');
        }
    }

    /**
     * 스토리 정보 유효성 검사
     */
    validateStoryInfo(storyInfo) {
        if (!storyInfo.title || storyInfo.title.trim().length === 0) {
            this.showNotification('제목을 입력해주세요', 'warning');
            return false;
        }

        if (!storyInfo.protagonist || storyInfo.protagonist.trim().length === 0) {
            this.showNotification('주인공 이름을 입력해주세요', 'warning');
            return false;
        }

        if (!storyInfo.theme || storyInfo.theme.trim().length === 0) {
            this.showNotification('테마를 입력해주세요', 'warning');
            return false;
        }

        return true;
    }

    /**
     * 첫 번째 질문 생성
     */
    async generateFirstQuestion() {
        try {
            const context = {
                currentBottleneck: 'gi',
                currentSegment: 'gi_1',
                recentAnswers: []
            };

            const question = await this.storyController.generateQuestion(context);
            this.uiController.displayQuestion(question);
            
        } catch (error) {
            console.error('첫 번째 질문 생성 실패:', error);
            this.showNotification('질문 생성에 실패했습니다: ' + error.message, 'error');
        }
    }

    /**
     * 현재 상태 저장
     */
    async saveCurrentState() {
        try {
            this.showStatus('저장 중...', 'processing');
            
            const success = await this.stateManager.saveToLocalStorage();
            
            if (success) {
                this.showStatus('저장 완료', 'ready');
                this.updateLastSavedTime();
                this.showNotification('스토리가 저장되었습니다', 'success');
            } else {
                throw new Error('저장 실패');
            }
            
        } catch (error) {
            console.error('저장 실패:', error);
            this.showStatus('저장 실패', 'error');
            this.showNotification('저장에 실패했습니다: ' + error.message, 'error');
        }
    }

    /**
     * 상태 불러오기
     */
    async loadState() {
        try {
            this.showStatus('불러오는 중...', 'processing');
            
            const success = await this.stateManager.loadFromLocalStorage();
            
            if (success) {
                // UI 업데이트
                this.uiController.updateUIFromState();
                
                this.showStatus('불러오기 완료', 'ready');
                this.showNotification('스토리가 불러와졌습니다', 'success');
            } else {
                this.showNotification('저장된 스토리가 없습니다', 'info');
            }
            
        } catch (error) {
            console.error('불러오기 실패:', error);
            this.showStatus('불러오기 실패', 'error');
            this.showNotification('불러오기에 실패했습니다: ' + error.message, 'error');
        }
    }

    /**
     * 저장된 상태 로드
     */
    async loadSavedState() {
        try {
            const hasSavedState = await this.stateManager.loadFromLocalStorage();
            
            if (hasSavedState) {
                this.uiController.updateUIFromState();
                console.log('저장된 상태를 불러왔습니다');
            } else {
                console.log('저장된 상태가 없습니다');
            }
            
        } catch (error) {
            console.error('저장된 상태 로드 실패:', error);
        }
    }

    /**
     * 프로젝트 내보내기
     */
    async exportProject() {
        try {
            this.showStatus('내보내는 중...', 'processing');
            
            // RPY 파일 생성
            const projectFiles = await this.storyController.generateRPY();
            
            // ZIP 파일 다운로드
            await this.uiController.downloadProject(projectFiles);
            
            this.showStatus('내보내기 완료', 'ready');
            this.showNotification('프로젝트가 성공적으로 내보내기 되었습니다', 'success');
            
        } catch (error) {
            console.error('내보내기 실패:', error);
            this.showStatus('내보내기 실패', 'error');
            this.showNotification('내보내기에 실패했습니다: ' + error.message, 'error');
        }
    }

    /**
     * 키보드 단축키 처리
     */
    handleKeyboardShortcuts(event) {
        // Ctrl+S: 저장
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            this.saveCurrentState();
        }
        
        // Ctrl+O: 불러오기
        if (event.ctrlKey && event.key === 'o') {
            event.preventDefault();
            this.loadState();
        }
        
        // Ctrl+E: 내보내기
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            this.exportProject();
        }
        
        // Escape: 모달 닫기
        if (event.key === 'Escape') {
            this.uiController.closeAllModals();
        }
    }

    /**
     * 상태 표시 업데이트
     */
    showStatus(message, type = 'ready') {
        const statusElement = document.getElementById('app-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-value status-${type}`;
        }
    }

    /**
     * 마지막 저장 시간 업데이트
     */
    updateLastSavedTime() {
        const lastSavedElement = document.getElementById('last-saved');
        if (lastSavedElement) {
            const now = new Date();
            lastSavedElement.textContent = now.toLocaleTimeString();
        }
    }

    /**
     * 알림 표시
     */
    showNotification(message, type = 'info', duration = 5000) {
        // 알림 컨테이너가 없으면 생성
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 2000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(notificationContainer);
        }

        // 알림 요소 생성
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">${this.getNotificationTitle(type)}</div>
                <button class="notification-close">×</button>
            </div>
            <div class="notification-body">${message}</div>
        `;

        // 닫기 버튼 이벤트
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // 알림 추가
        notificationContainer.appendChild(notification);

        // 자동 제거
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }
    }

    /**
     * 알림 제목 가져오기
     */
    getNotificationTitle(type) {
        const titles = {
            'success': '성공',
            'error': '오류',
            'warning': '경고',
            'info': '정보'
        };
        return titles[type] || '알림';
    }
}

// 애플리케이션 인스턴스 생성 및 초기화
document.addEventListener('DOMContentLoaded', async () => {
    const app = new TWApp();
    
    // 전역 앱 인스턴스로 저장 (디버깅용)
    window.TWApp = app;
    
    // 애플리케이션 초기화
    await app.initialize();
});

// 에러 핸들링
window.addEventListener('error', (event) => {
    console.error('전역 오류:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('처리되지 않은 Promise 거부:', event.reason);
});