
export const LEVELS = [
    { level: 1, minScore: 0, title: '초보 탐험가' },
    { level: 2, minScore: 100, title: '초보 탐험가 II' },
    { level: 3, minScore: 300, title: '초보 탐험가 III' },
    { level: 4, minScore: 600, title: '길동무' },
    { level: 5, minScore: 1000, title: '길동무 II' },
    { level: 6, minScore: 1500, title: '동네 보안관' },
    { level: 10, minScore: 5000, title: '내일의 장인' },
] as const;

export const POINTS = {
    REPORT: 50,
    UPDATE: 30,
    VALIDATE: 10,
    LOGIN: 5,
} as const;

export function calculateLevel(score: number) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (score >= LEVELS[i].minScore) {
            return LEVELS[i];
        }
    }
    return LEVELS[0];
}

export function getPointsForAction(action: keyof typeof POINTS) {
    return POINTS[action];
}
