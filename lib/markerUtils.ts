import { Report } from '@prisma/client';

export type MarkerType = 'GLOW' | 'ALPHA' | 'NORMAL' | 'QUEST';

export interface MarkerConfig {
    type: MarkerType;
    opacity: number;
    zIndex: number;
    iconUrl?: string;
    hasPulse?: boolean;
}

export function getMarkerType(report: Report): MarkerConfig {
    const now = new Date();
    const updatedAt = new Date(report.updatedAt);
    const diffHours = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);

    // 1. GLOW: Updated within 48 hours
    if (diffHours <= 48) {
        return {
            type: 'GLOW',
            opacity: 1.0,
            zIndex: 1000,
            hasPulse: true
        };
    }

    // 2. ALPHA: Older than 30 days (720 hours)
    if (diffHours >= 720) {
        return {
            type: 'ALPHA',
            opacity: 0.5,
            zIndex: 10,
            hasPulse: false
        };
    }

    // 3. NORMAL
    return {
        type: 'NORMAL',
        opacity: 1.0,
        zIndex: 100,
        hasPulse: false
    };
}
