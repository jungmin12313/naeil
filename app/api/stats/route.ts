import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const neighborhood = searchParams.get('neighborhood');

    try {
        const whereClause: any = {};

        if (district && district !== '전체') {
            whereClause.district = district;
        }

        if (neighborhood && neighborhood !== '전체') {
            whereClause.neighborhood = neighborhood;
        }

        const totalPlaces = await prisma.place.count({
            where: whereClause
        });

        const greenPlaces = await prisma.place.count({
            where: {
                ...whereClause,
                grade: 'GREEN'
            }
        });

        // Issue count: simple approximation (e.g., non-green or specific issues)
        // For now, let's count places that are NOT green as having "potential issues" 
        // OR we can do a more complex query if needed. 
        // Let's count 'RED' + 'YELLOW' as issues for the dashboard summary.
        const issueCount = await prisma.place.count({
            where: {
                ...whereClause,
                grade: {
                    in: ['YELLOW', 'RED']
                }
            }
        });

        const accessibilityScore = totalPlaces > 0 ? Math.round((greenPlaces / totalPlaces) * 100) : 0;

        return NextResponse.json({
            totalPlaces,
            greenPlaces,
            issueCount,
            accessibilityScore
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
