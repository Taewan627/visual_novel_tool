/**
 * TW 모델 파일 구조 관리자
 * 렌파이 프로젝트의 파일 구조를 생성하고 관리
 */

/**
 * TW 파일 구조 관리자
 */
export class TWFileStructure {
    constructor() {
        this.defaultDirectories = [
            'game',
            'game/script',
            'game/images',
            'game/images/bg',
            'game/images/characters',
            'game/images/gui',
            'game/audio',
            'game/audio/bgm',
            'game/audio/sfx'
        ];
        
        this.defaultFiles = {
            'README.md': this.generateReadmeTemplate(),
            `${this.getProjectName()}.rpy`: this.generateProjectFileTemplate()
        };
    }

    /**
     * 기본 파일 구조 생성
     */
    createBasicStructure(storyState) {
        const files = new Map();
        
        // README 파일
        const readme = this.generateReadme(storyState);
        files.set('README.md', readme);
        
        // 프로젝트 파일
        const projectFile = this.generateProjectFile(storyState);
        files.set(`${storyState.storyInfo.title || 'story'}.rpy`, projectFile);
        
        // 기본 이미지 파일 (더미)
        const guiImages = this.generateDummyGuiImages();
        guiImages.forEach((content, path) => {
            files.set(path, content);
        });
        
        // 기본 배경 이미지 (더미)
        const bgImages = this.generateDummyBackgroundImages();
        bgImages.forEach((content, path) => {
            files.set(path, content);
        });
        
        return files;
    }

    /**
     * README 파일 생성
     */
    generateReadme(storyState) {
        return `# ${storyState.storyInfo.title}

${storyState.storyInfo.description}

## TW 모델 기반 비주얼노벨

이 프로젝트는 병목 기반 스토리 제어 모델(TW 모델)을 사용하여 자동 생성된 비주얼노벨입니다.

### 스토리 구조

- **기(Setup)**: ${storyState.mainBottlenecks.gi.description}
- **승(Confrontation)**: ${storyState.mainBottlenecks.seung.description}
- **전(Climax)**: MVP 단계 이후 구현 예정
- **결(Resolution)**: MVP 단계 이후 구현 예정

### 설치 방법

1. 렌파이를 설치합니다.
2. 이 프로젝트 폴더를 렌파이 프로젝트 디렉토리에 복사합니다.
3. 렌파이에서 프로젝트를 열고 실행합니다.

### 제작 정보

- 버전: 1.0 (MVP)
- 제작 도구: 렌파이 비주얼노벨 템플릿 생성기
- 생성일: ${new Date().toLocaleDateString()}
`;
    }

    /**
     * 프로젝트 파일 생성
     */
    generateProjectFile(storyState) {
        return `# 렌파이 프로젝트 파일
build.name "${storyState.storyInfo.title}"
build.version "1.0"
build.author "TW Model Generator"
build.description "${storyState.storyInfo.description}"
`;
    }

    /**
     * 더미 GUI 이미지 파일 생성
     */
    generateDummyGuiImages() {
        const images = new Map();
        
        // 더미 GUI 이미지 파일들
        const guiImageFiles = [
            'textbox.png',
            'button.png',
            'choice.png',
            'nvl.png'
        ];
        
        guiImageFiles.forEach(filename => {
            images.set(`game/images/gui/${filename}`, this.generateDummyImage(filename));
        });
        
        return images;
    }

    /**
     * 더미 배경 이미지 파일 생성
     */
    generateDummyBackgroundImages() {
        const images = new Map();
        
        // 더미 배경 이미지 파일들
        const bgImageFiles = [
            'classroom.jpg',
            'ending.jpg',
            'placeholder.jpg'
        ];
        
        bgImageFiles.forEach(filename => {
            images.set(`game/images/bg/${filename}`, this.generateDummyImage(filename));
        });
        
        return images;
    }

    /**
     * 더미 이미지 내용 생성
     */
    generateDummyImage(filename) {
        // 실제로는 더미 이미지 데이터를 반환해야 함
        // 여기서는 간단한 텍스트로 대체
        return `# Dummy ${filename} image file
# 실제 프로젝트에서는 실제 이미지 파일이 필요합니다.
# 이 파일은 자동 생성된 더미 파일입니다.
`;
    }

    /**
     * 프로젝트 이름 가져오기
     */
    getProjectName() {
        return 'tw_story_project';
    }

    /**
     * 디렉토리 구조 생성
     */
    createDirectoryStructure() {
        const structure = {};
        
        this.defaultDirectories.forEach(dir => {
            const parts = dir.split('/');
            let current = structure;
            
            parts.forEach(part => {
                if (!current[part]) {
                    current[part] = {};
                }
                current = current[part];
            });
        });
        
        return structure;
    }

    /**
     * 파일 목록 생성
     */
    generateFileList() {
        const files = [];
        
        // 기본 파일들
        files.push('README.md');
        files.push(`${this.getProjectName()}.rpy`);
        
        // 스크립트 파일들
        files.push('game/script/script.rpy');
        files.push('game/script/characters.rpy');
        files.push('game/script/options.rpy');
        files.push('game/script/gui.rpy');
        
        // 병목별 스크립트 파일들
        files.push('game/script/story_gi.rpy');
        files.push('game/script/story_seung.rpy');
        files.push('game/script/story_ten.rpy');
        files.push('game/script/story_ketsu.rpy');
        
        // 이미지 파일들
        files.push('game/images/gui/textbox.png');
        files.push('game/images/gui/button.png');
        files.push('game/images/gui/choice.png');
        files.push('game/images/gui/nvl.png');
        
        files.push('game/images/bg/classroom.jpg');
        files.push('game/images/bg/ending.jpg');
        files.push('game/images/bg/placeholder.jpg');
        
        return files;
    }

    /**
     * 프로젝트 구조 검증
     */
    validateProjectStructure(files) {
        const errors = [];
        const warnings = [];
        
        // 필수 파일 검사
        const requiredFiles = [
            'game/script/script.rpy',
            'game/script/characters.rpy',
            'game/script/options.rpy',
            'game/script/gui.rpy'
        ];
        
        requiredFiles.forEach(file => {
            if (!files.has(file)) {
                errors.push(`필수 파일이 누락되었습니다: ${file}`);
            }
        });
        
        // 디렉토리 구조 검사
        const scriptFiles = Array.from(files.keys()).filter(file => file.startsWith('game/script/'));
        if (scriptFiles.length < 5) {
            warnings.push('스크립트 파일이 너무 적습니다.');
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * 파일 경로 정규화
     */
    normalizePath(path) {
        // 운영체제에 따른 경로 구분자 정규화
        return path.replace(/\\/g, '/');
    }

    /**
     * 파일 확장자 확인
     */
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    /**
     * 이미지 파일인지 확인
     */
    isImageFile(filename) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        const extension = this.getFileExtension(filename);
        return imageExtensions.includes(extension);
    }

    /**
     * 오디오 파일인지 확인
     */
    isAudioFile(filename) {
        const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
        const extension = this.getFileExtension(filename);
        return audioExtensions.includes(extension);
    }

    /**
     * 스크립트 파일인지 확인
     */
    isScriptFile(filename) {
        return this.getFileExtension(filename) === 'rpy';
    }

    /**
     * 파일 크기 포맷팅
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 파일 타입별 분류
     */
    categorizeFiles(files) {
        const categorized = {
            scripts: [],
            images: [],
            audio: [],
            other: []
        };
        
        files.forEach((content, path) => {
            if (this.isScriptFile(path)) {
                categorized.scripts.push({ path, content });
            } else if (this.isImageFile(path)) {
                categorized.images.push({ path, content });
            } else if (this.isAudioFile(path)) {
                categorized.audio.push({ path, content });
            } else {
                categorized.other.push({ path, content });
            }
        });
        
        return categorized;
    }

    /**
     * 프로젝트 요약 정보 생성
     */
    generateProjectSummary(files) {
        const categorized = this.categorizeFiles(files);
        
        return {
            totalFiles: files.size,
            scriptFiles: categorized.scripts.length,
            imageFiles: categorized.images.length,
            audioFiles: categorized.audio.length,
            otherFiles: categorized.other.length,
            directories: this.defaultDirectories.length
        };
    }

    /**
     * 파일 경로 생성
     */
    buildPath(...parts) {
        return this.normalizePath(parts.join('/'));
    }

    /**
     * 상대 경로 계산
     */
    getRelativePath(from, to) {
        const fromParts = from.split('/');
        const toParts = to.split('/');
        
        // 공통 부분 찾기
        let commonLength = 0;
        const minLength = Math.min(fromParts.length, toParts.length);
        
        for (let i = 0; i < minLength; i++) {
            if (fromParts[i] === toParts[i]) {
                commonLength++;
            } else {
                break;
            }
        }
        
        // 상위 디렉토리 이동
        const upCount = fromParts.length - commonLength - 1;
        const relativeParts = Array(upCount).fill('..');
        
        // 하위 디렉토리 이동
        const remainingParts = toParts.slice(commonLength);
        
        return [...relativeParts, ...remainingParts].join('/');
    }

    /**
     * 템플릿 파일 경로 생성
     */
    getTemplatePath(templateName) {
        return this.buildPath('templates', `${templateName}.template`);
    }

    /**
     * 리소스 파일 경로 생성
     */
    getResourcePath(resourceType, filename) {
        return this.buildPath('game', resourceType, filename);
    }

    /**
     * 스크립트 파일 경로 생성
     */
    getScriptPath(filename) {
        return this.buildPath('game', 'script', filename);
    }

    /**
     * 이미지 파일 경로 생성
     */
    getImagePath(category, filename) {
        return this.buildPath('game', 'images', category, filename);
    }

    /**
     * 오디오 파일 경로 생성
     */
    getAudioPath(category, filename) {
        return this.buildPath('game', 'audio', category, filename);
    }
}