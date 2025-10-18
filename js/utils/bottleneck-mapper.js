/**
 * TW 모델 병목 매퍼
 * 병목과 세그먼트 간의 매핑 및 관리
 */

/**
 * TW 병목 매퍼
 */
export class TWBottleneckMapper {
    constructor() {
        this.bottleneckMap = {
            'gi': {
                id: 'gi',
                name: '기',
                englishName: 'Setup',
                description: '서론 및 설정',
                color: '#4CAF50',
                segments: ['gi_1', 'gi_2']
            },
            'seung': {
                id: 'seung',
                name: '승',
                englishName: 'Confrontation',
                description: '갈등 및 대립',
                color: '#FF9800',
                segments: ['seung_1', 'seung_2']
            },
            'ten': {
                id: 'ten',
                name: '전',
                englishName: 'Climax',
                description: '절정 및 위기',
                color: '#F44336',
                segments: ['ten_1']
            },
            'ketsu': {
                id: 'ketsu',
                name: '결',
                englishName: 'Resolution',
                description: '결말 및 해결',
                color: '#2196F3',
                segments: ['ketsu_1']
            }
        };
        
        this.segmentMap = {
            'gi_1': { 
                id: 'gi_1', 
                name: '일상 소개', 
                description: '주인공의 일상 생활 소개',
                parentBottleneck: 'gi',
                order: 1
            },
            'gi_2': { 
                id: 'gi_2', 
                name: '사건 발생', 
                description: '중요한 사건이 발생',
                parentBottleneck: 'gi',
                order: 2
            },
            'seung_1': { 
                id: 'seung_1', 
                name: '갈등 시작', 
                description: '주요 갈등이 시작됨',
                parentBottleneck: 'seung',
                order: 1
            },
            'seung_2': { 
                id: 'seung_2', 
                name: '첫 실패', 
                description: '주인공이 첫 번째 실패를 겪음',
                parentBottleneck: 'seung',
                order: 2
            },
            'ten_1': { 
                id: 'ten_1', 
                name: '절정', 
                description: '가장 큰 위기 상황',
                parentBottleneck: 'ten',
                order: 1
            },
            'ketsu_1': { 
                id: 'ketsu_1', 
                name: '결말', 
                description: '모든 갈등의 해결',
                parentBottleneck: 'ketsu',
                order: 1
            }
        };
        
        this.bottleneckOrder = ['gi', 'seung', 'ten', 'ketsu'];
    }

    /**
     * 병목 정보 가져오기
     */
    getBottleneck(bottleneckId) {
        return this.bottleneckMap[bottleneckId];
    }

    /**
     * 모든 병목 정보 가져오기
     */
    getAllBottlenecks() {
        return { ...this.bottleneckMap };
    }

    /**
     * 세그먼트 정보 가져오기
     */
    getSegment(segmentId) {
        return this.segmentMap[segmentId];
    }

    /**
     * 모든 세그먼트 정보 가져오기
     */
    getAllSegments() {
        return { ...this.segmentMap };
    }

    /**
     * 다음 병목 가져오기
     */
    getNextBottleneck(currentBottleneck) {
        const currentIndex = this.bottleneckOrder.indexOf(currentBottleneck);
        
        if (currentIndex < this.bottleneckOrder.length - 1) {
            return this.bottleneckOrder[currentIndex + 1];
        }
        
        return null;
    }

    /**
     * 이전 병목 가져오기
     */
    getPreviousBottleneck(currentBottleneck) {
        const currentIndex = this.bottleneckOrder.indexOf(currentBottleneck);
        
        if (currentIndex > 0) {
            return this.bottleneckOrder[currentIndex - 1];
        }
        
        return null;
    }

    /**
     * 병목 순서 가져오기
     */
    getBottleneckOrder() {
        return [...this.bottleneckOrder];
    }

    /**
     * 병목 레이블 생성
     */
    getBottleneckLabel(bottleneckId) {
        const bottleneck = this.getBottleneck(bottleneckId);
        return bottleneck ? `${bottleneck.name}(${bottleneck.englishName})` : bottleneckId;
    }

    /**
     * 세그먼트 레이블 생성
     */
    getSegmentLabel(segmentId) {
        const segment = this.getSegment(segmentId);
        return segment ? segment.name : segmentId;
    }

    /**
     * 병목의 세그먼트들 가져오기
     */
    getBottleneckSegments(bottleneckId) {
        const bottleneck = this.getBottleneck(bottleneckId);
        if (!bottleneck) return [];
        
        return bottleneck.segments.map(segmentId => this.getSegment(segmentId));
    }

    /**
     * 세그먼트의 부모 병목 가져오기
     */
    getSegmentParentBottleneck(segmentId) {
        const segment = this.getSegment(segmentId);
        return segment ? segment.parentBottleneck : null;
    }

    /**
     * 병목의 다음 세그먼트 가져오기
     */
    getNextSegment(currentSegmentId) {
        const segment = this.getSegment(currentSegmentId);
        if (!segment) return null;
        
        const parentBottleneck = this.getBottleneck(segment.parentBottleneck);
        if (!parentBottleneck) return null;
        
        const currentIndex = parentBottleneck.segments.indexOf(currentSegmentId);
        
        if (currentIndex < parentBottleneck.segments.length - 1) {
            return parentBottleneck.segments[currentIndex + 1];
        }
        
        // 현재 병목의 마지막 세그먼트인 경우, 다음 병목의 첫 세그먼트 반환
        const nextBottleneck = this.getNextBottleneck(segment.parentBottleneck);
        if (nextBottleneck) {
            const nextBottleneckData = this.getBottleneck(nextBottleneck);
            return nextBottleneckData.segments[0];
        }
        
        return null;
    }

    /**
     * 세그먼트의 이전 세그먼트 가져오기
     */
    getPreviousSegment(currentSegmentId) {
        const segment = this.getSegment(currentSegmentId);
        if (!segment) return null;
        
        const parentBottleneck = this.getBottleneck(segment.parentBottleneck);
        if (!parentBottleneck) return null;
        
        const currentIndex = parentBottleneck.segments.indexOf(currentSegmentId);
        
        if (currentIndex > 0) {
            return parentBottleneck.segments[currentIndex - 1];
        }
        
        // 현재 병목의 첫 세그먼트인 경우, 이전 병목의 마지막 세그먼트 반환
        const previousBottleneck = this.getPreviousBottleneck(segment.parentBottleneck);
        if (previousBottleneck) {
            const previousBottleneckData = this.getBottleneck(previousBottleneck);
            const segments = previousBottleneckData.segments;
            return segments[segments.length - 1];
        }
        
        return null;
    }

    /**
     * 병목 진행률 계산
     */
    calculateBottleneckProgress(bottleneckId, completedSegments) {
        const bottleneck = this.getBottleneck(bottleneckId);
        if (!bottleneck) return 0;
        
        const totalSegments = bottleneck.segments.length;
        const completedCount = bottleneck.segments.filter(segmentId => 
            completedSegments.includes(segmentId)
        ).length;
        
        return totalSegments > 0 ? Math.round((completedCount / totalSegments) * 100) : 0;
    }

    /**
     * 전체 스토리 진행률 계산
     */
    calculateOverallProgress(completedSegments) {
        const totalSegments = Object.keys(this.segmentMap).length;
        const completedCount = completedSegments.length;
        
        return totalSegments > 0 ? Math.round((completedCount / totalSegments) * 100) : 0;
    }

    /**
     * 병목 경로 생성
     */
    createBottleneckPath(fromBottleneck, toBottleneck) {
        const fromIndex = this.bottleneckOrder.indexOf(fromBottleneck);
        const toIndex = this.bottleneckOrder.indexOf(toBottleneck);
        
        if (fromIndex === -1 || toIndex === -1) {
            return [];
        }
        
        if (fromIndex <= toIndex) {
            return this.bottleneckOrder.slice(fromIndex, toIndex + 1);
        } else {
            return this.bottleneckOrder.slice(toIndex, fromIndex + 1).reverse();
        }
    }

    /**
     * 세그먼트 경로 생성
     */
    createSegmentPath(fromSegment, toSegment) {
        const fromSegmentData = this.getSegment(fromSegment);
        const toSegmentData = this.getSegment(toSegment);
        
        if (!fromSegmentData || !toSegmentData) {
            return [];
        }
        
        // 같은 병목 내의 경로
        if (fromSegmentData.parentBottleneck === toSegmentData.parentBottleneck) {
            const parentBottleneck = this.getBottleneck(fromSegmentData.parentBottleneck);
            const fromIndex = parentBottleneck.segments.indexOf(fromSegment);
            const toIndex = parentBottleneck.segments.indexOf(toSegment);
            
            if (fromIndex <= toIndex) {
                return parentBottleneck.segments.slice(fromIndex, toIndex + 1);
            } else {
                return parentBottleneck.segments.slice(toIndex, fromIndex + 1).reverse();
            }
        }
        
        // 다른 병목 간의 경로
        const path = [];
        
        // 시작 세그먼트부터 병목 끝까지
        const fromBottleneck = this.getBottleneck(fromSegmentData.parentBottleneck);
        const fromIndex = fromBottleneck.segments.indexOf(fromSegment);
        path.push(...fromBottleneck.segments.slice(fromIndex));
        
        // 중간 병목들
        const fromBottleneckIndex = this.bottleneckOrder.indexOf(fromSegmentData.parentBottleneck);
        const toBottleneckIndex = this.bottleneckOrder.indexOf(toSegmentData.parentBottleneck);
        
        for (let i = fromBottleneckIndex + 1; i < toBottleneckIndex; i++) {
            const middleBottleneck = this.getBottleneck(this.bottleneckOrder[i]);
            path.push(...middleBottleneck.segments);
        }
        
        // 도착 병목의 시작부터 도착 세그먼트까지
        const toBottleneck = this.getBottleneck(toSegmentData.parentBottleneck);
        const toIndex = toBottleneck.segments.indexOf(toSegment);
        path.push(...toBottleneck.segments.slice(0, toIndex + 1));
        
        return path;
    }

    /**
     * 병목 유효성 검사
     */
    isValidBottleneck(bottleneckId) {
        return this.bottleneckMap.hasOwnProperty(bottleneckId);
    }

    /**
     * 세그먼트 유효성 검사
     */
    isValidSegment(segmentId) {
        return this.segmentMap.hasOwnProperty(segmentId);
    }

    /**
     * 병목과 세그먼트 관계 유효성 검사
     */
    isValidRelationship(bottleneckId, segmentId) {
        const bottleneck = this.getBottleneck(bottleneckId);
        const segment = this.getSegment(segmentId);
        
        if (!bottleneck || !segment) {
            return false;
        }
        
        return bottleneck.segments.includes(segmentId) && segment.parentBottleneck === bottleneckId;
    }

    /**
     * 병목 추가
     */
    addBottleneck(bottleneckData) {
        if (!bottleneckData.id || this.bottleneckMap[bottleneckData.id]) {
            return false;
        }
        
        this.bottleneckMap[bottleneckData.id] = bottleneckData;
        this.bottleneckOrder.push(bottleneckData.id);
        
        return true;
    }

    /**
     * 세그먼트 추가
     */
    addSegment(segmentData) {
        if (!segmentData.id || this.segmentMap[segmentData.id]) {
            return false;
        }
        
        if (!this.isValidBottleneck(segmentData.parentBottleneck)) {
            return false;
        }
        
        this.segmentMap[segmentData.id] = segmentData;
        this.bottleneckMap[segmentData.parentBottleneck].segments.push(segmentData.id);
        
        // 세그먼트 순서대로 정렬
        this.bottleneckMap[segmentData.parentBottleneck].segments.sort((a, b) => {
            const segmentA = this.getSegment(a);
            const segmentB = this.getSegment(b);
            return segmentA.order - segmentB.order;
        });
        
        return true;
    }

    /**
     * 병목 제거
     */
    removeBottleneck(bottleneckId) {
        if (!this.bottleneckMap[bottleneckId]) {
            return false;
        }
        
        // 연결된 세그먼트들 제거
        const bottleneck = this.bottleneckMap[bottleneckId];
        bottleneck.segments.forEach(segmentId => {
            delete this.segmentMap[segmentId];
        });
        
        delete this.bottleneckMap[bottleneckId];
        
        const index = this.bottleneckOrder.indexOf(bottleneckId);
        if (index !== -1) {
            this.bottleneckOrder.splice(index, 1);
        }
        
        return true;
    }

    /**
     * 세그먼트 제거
     */
    removeSegment(segmentId) {
        if (!this.segmentMap[segmentId]) {
            return false;
        }
        
        const segment = this.segmentMap[segmentId];
        const parentBottleneck = this.bottleneckMap[segment.parentBottleneck];
        
        // 부모 병목에서 세그먼트 제거
        const index = parentBottleneck.segments.indexOf(segmentId);
        if (index !== -1) {
            parentBottleneck.segments.splice(index, 1);
        }
        
        delete this.segmentMap[segmentId];
        
        return true;
    }

    /**
     * 병목 정보 업데이트
     */
    updateBottleneck(bottleneckId, updateData) {
        if (!this.bottleneckMap[bottleneckId]) {
            return false;
        }
        
        this.bottleneckMap[bottleneckId] = {
            ...this.bottleneckMap[bottleneckId],
            ...updateData
        };
        
        return true;
    }

    /**
     * 세그먼트 정보 업데이트
     */
    updateSegment(segmentId, updateData) {
        if (!this.segmentMap[segmentId]) {
            return false;
        }
        
        this.segmentMap[segmentId] = {
            ...this.segmentMap[segmentId],
            ...updateData
        };
        
        return true;
    }

    /**
     * 병목 통계 정보
     */
    getBottleneckStatistics() {
        const stats = {
            totalBottlenecks: this.bottleneckOrder.length,
            totalSegments: Object.keys(this.segmentMap).length,
            averageSegmentsPerBottleneck: 0,
            bottleneckDetails: {}
        };
        
        stats.averageSegmentsPerBottleneck = stats.totalSegments / stats.totalBottlenecks;
        
        this.bottleneckOrder.forEach(bottleneckId => {
            const bottleneck = this.getBottleneck(bottleneckId);
            stats.bottleneckDetails[bottleneckId] = {
                name: bottleneck.name,
                segmentCount: bottleneck.segments.length,
                color: bottleneck.color
            };
        });
        
        return stats;
    }

    /**
     * 병목-세그먼트 트리 구조 생성
     */
    createTreeStructure() {
        const tree = {};
        
        this.bottleneckOrder.forEach(bottleneckId => {
            const bottleneck = this.getBottleneck(bottleneckId);
            tree[bottleneckId] = {
                ...bottleneck,
                segments: {}
            };
            
            bottleneck.segments.forEach(segmentId => {
                const segment = this.getSegment(segmentId);
                tree[bottleneckId].segments[segmentId] = segment;
            });
        });
        
        return tree;
    }
}