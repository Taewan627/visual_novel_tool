/**
 * TW 모델 흐름 컨트롤러
 * 스토리 흐름을 제어하고 병목 간 이동을 관리
 */

/**
 * TW 흐름 컨트롤러
 */
export class TWFlowController {
    constructor() {
        this.bottleneckOrder = ['gi', 'seung', 'ten', 'ketsu'];
        this.currentPosition = { bottleneck: null, segment: null, node: null };
        this.segmentMap = {
            'gi': ['gi_1', 'gi_2'],
            'seung': ['seung_1', 'seung_2'],
            'ten': ['ten_1'],
            'ketsu': ['ketsu_1']
        };
    }

    /**
     * 현재 위치 설정
     */
    setCurrentPosition(bottleneck, segment) {
        this.currentPosition.bottleneck = bottleneck;
        this.currentPosition.segment = segment;
        this.currentPosition.node = null;
    }

    /**
     * 현재 위치 가져오기
     */
    getCurrentPosition() {
        return { ...this.currentPosition };
    }

    /**
     * 다음으로 이동
     */
    moveToNext() {
        // 현재 세그먼트의 다음 노드로 이동
        return this.moveToNextInSegment();
    }

    /**
     * 세그먼트 내에서 다음으로 이동
     */
    moveToNextInSegment() {
        // 현재 세그먼트의 다음 세그먼트로 이동
        return this.moveToNextSegment();
    }

    /**
     * 다음 세그먼트로 이동
     */
    moveToNextSegment() {
        const nextSegment = this.findNextSegment();
        
        if (nextSegment) {
            this.currentPosition.segment = nextSegment.id;
            this.currentPosition.node = null;
            return { type: 'segment', data: nextSegment };
        } else {
            return this.moveToNextBottleneck();
        }
    }

    /**
     * 다음 병목으로 이동
     */
    moveToNextBottleneck() {
        const currentIndex = this.bottleneckOrder.indexOf(this.currentPosition.bottleneck);
        
        if (currentIndex < this.bottleneckOrder.length - 1) {
            const nextBottleneck = this.bottleneckOrder[currentIndex + 1];
            this.currentPosition.bottleneck = nextBottleneck;
            
            // 다음 병목의 첫 세그먼트로 이동
            const firstSegment = this.getFirstSegmentOfBottleneck(nextBottleneck);
            this.currentPosition.segment = firstSegment.id;
            this.currentPosition.node = null;
            
            return { type: 'bottleneck', data: { bottleneck: nextBottleneck, segment: firstSegment } };
        } else {
            return { type: 'completed', message: '모든 스토리가 완료되었습니다.' };
        }
    }

    /**
     * 특정 병목으로 수렴 (선택 노드용)
     */
    convergeToBottleneck(bottleneckId) {
        const targetIndex = this.bottleneckOrder.indexOf(bottleneckId);
        
        if (targetIndex !== -1) {
            this.currentPosition.bottleneck = bottleneckId;
            const firstSegment = this.getFirstSegmentOfBottleneck(bottleneckId);
            this.currentPosition.segment = firstSegment.id;
            this.currentPosition.node = null;
            
            return { type: 'converged', data: { bottleneck: bottleneckId, segment: firstSegment } };
        } else {
            throw new Error(`유효하지 않은 병목 ID: ${bottleneckId}`);
        }
    }

    /**
     * 병목의 첫 세그먼트 찾기
     */
    getFirstSegmentOfBottleneck(bottleneckId) {
        const segments = this.segmentMap[bottleneckId];
        if (segments && segments.length > 0) {
            return {
                id: segments[0],
                name: this.getSegmentDisplayName(segments[0]),
                parentBottleneck: bottleneckId
            };
        }
        
        // 기본값 반환
        return {
            id: `${bottleneckId}_1`,
            name: '첫 번째 세그먼트',
            parentBottleneck: bottleneckId
        };
    }

    /**
     * 다음 세그먼트 찾기
     */
    findNextSegment() {
        if (!this.currentPosition.bottleneck || !this.currentPosition.segment) {
            return null;
        }
        
        const currentSegments = this.segmentMap[this.currentPosition.bottleneck];
        if (!currentSegments) {
            return null;
        }
        
        const currentIndex = currentSegments.indexOf(this.currentPosition.segment);
        
        if (currentIndex < currentSegments.length - 1) {
            const nextSegmentId = currentSegments[currentIndex + 1];
            return {
                id: nextSegmentId,
                name: this.getSegmentDisplayName(nextSegmentId),
                parentBottleneck: this.currentPosition.bottleneck
            };
        }
        
        return null;
    }

    /**
     * 현재 병목이 완료되었는지 확인
     */
    isCurrentBottleneckCompleted(completedSegments) {
        if (!this.currentPosition.bottleneck) return false;
        
        const bottleneckSegments = this.segmentMap[this.currentPosition.bottleneck] || [];
        
        // 현재 병목의 모든 세그먼트가 완료되었는지 확인
        return bottleneckSegments.every(segmentId => 
            completedSegments.includes(segmentId)
        );
    }

    /**
     * 다음 병목으로 이동 가능한지 확인
     */
    canMoveToNextBottleneck(completedSegments) {
        return this.isCurrentBottleneckCompleted(completedSegments);
    }

    /**
     * 특정 병목으로 이동 가능한지 확인
     */
    canMoveToBottleneck(bottleneckId, completedSegments) {
        const targetIndex = this.bottleneckOrder.indexOf(bottleneckId);
        const currentIndex = this.bottleneckOrder.indexOf(this.currentPosition.bottleneck);
        
        // 다음 병목으로만 이동 가능
        if (targetIndex !== currentIndex + 1) {
            return false;
        }
        
        // 현재 병목이 완료되었는지 확인
        return this.isCurrentBottleneckCompleted(completedSegments);
    }

    /**
     * 스토리 진행률 계산
     */
    calculateProgress(completedSegments, completedBottlenecks) {
        const totalSegments = Object.values(this.segmentMap).reduce((total, segments) => {
            return total + segments.length;
        }, 0);
        
        const totalBottlenecks = this.bottleneckOrder.length;
        
        // 세그먼트 진행률 (70% 가중치)
        const segmentProgress = (completedSegments.length / totalSegments) * 0.7;
        
        // 병목 진행률 (30% 가중치)
        const bottleneckProgress = (completedBottlenecks.length / totalBottlenecks) * 0.3;
        
        return Math.round((segmentProgress + bottleneckProgress) * 100);
    }

    /**
     * 현재 위치의 경로 가져오기
     */
    getCurrentPath() {
        const path = [];
        
        // 현재까지의 병목 경로
        const currentIndex = this.bottleneckOrder.indexOf(this.currentPosition.bottleneck);
        
        for (let i = 0; i <= currentIndex; i++) {
            const bottleneckId = this.bottleneckOrder[i];
            const bottleneckSegments = this.segmentMap[bottleneckId] || [];
            
            path.push({
                type: 'bottleneck',
                id: bottleneckId,
                name: this.getBottleneckDisplayName(bottleneckId),
                segments: bottleneckSegments.map(segmentId => ({
                    id: segmentId,
                    name: this.getSegmentDisplayName(segmentId),
                    isCurrent: segmentId === this.currentPosition.segment
                }))
            });
        }
        
        return path;
    }

    /**
     * 남은 스토리 경로 가져오기
     */
    getRemainingPath() {
        const path = [];
        const currentIndex = this.bottleneckOrder.indexOf(this.currentPosition.bottleneck);
        
        // 다음 병목부터 끝까지
        for (let i = currentIndex + 1; i < this.bottleneckOrder.length; i++) {
            const bottleneckId = this.bottleneckOrder[i];
            const bottleneckSegments = this.segmentMap[bottleneckId] || [];
            
            path.push({
                type: 'bottleneck',
                id: bottleneckId,
                name: this.getBottleneckDisplayName(bottleneckId),
                segments: bottleneckSegments.map(segmentId => ({
                    id: segmentId,
                    name: this.getSegmentDisplayName(segmentId)
                }))
            });
        }
        
        return path;
    }

    /**
     * 위치 재설정
     */
    reset() {
        this.currentPosition = { bottleneck: null, segment: null, node: null };
    }

    /**
     * 특정 위치로 점프 (디버깅용)
     */
    jumpToPosition(bottleneckId, segmentId) {
        if (this.bottleneckOrder.includes(bottleneckId)) {
            this.currentPosition.bottleneck = bottleneckId;
            
            const bottleneckSegments = this.segmentMap[bottleneckId] || [];
            if (segmentId && bottleneckSegments.includes(segmentId)) {
                this.currentPosition.segment = segmentId;
            } else {
                this.currentPosition.segment = bottleneckSegments[0];
            }
            
            this.currentPosition.node = null;
            
            return true;
        }
        
        return false;
    }

    /**
     * 병목 표시 이름 가져오기
     */
    getBottleneckDisplayName(bottleneckId) {
        const names = {
            'gi': '기',
            'seung': '승',
            'ten': '전',
            'ketsu': '결'
        };
        return names[bottleneckId] || bottleneckId;
    }

    /**
     * 세그먼트 표시 이름 가져오기
     */
    getSegmentDisplayName(segmentId) {
        const names = {
            'gi_1': '일상 소개',
            'gi_2': '사건 발생',
            'seung_1': '갈등 시작',
            'seung_2': '첫 실패',
            'ten_1': '절정',
            'ketsu_1': '결말'
        };
        return names[segmentId] || segmentId;
    }

    /**
     * 병목 순서 가져오기
     */
    getBottleneckOrder() {
        return [...this.bottleneckOrder];
    }

    /**
     * 세그먼트 맵 가져오기
     */
    getSegmentMap() {
        return { ...this.segmentMap };
    }

    /**
     * 현재 상태 정보 가져오기
     */
    getStateInfo() {
        return {
            currentPosition: this.getCurrentPosition(),
            currentPath: this.getCurrentPath(),
            remainingPath: this.getRemainingPath(),
            bottleneckOrder: this.getBottleneckOrder(),
            segmentMap: this.getSegmentMap()
        };
    }
}