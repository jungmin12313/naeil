import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        const places = await prisma.place.findMany({
            where: { authorId: userId },
            orderBy: { createdAt: 'desc' }
        });

        const count = places.length;

        let level = 'Starter';
        let badge = '🌱';
        let nextLevelCount = 5;

        if (count >= 20) {
            level = 'Mapper';
            badge = '🏆';
            nextLevelCount = 0; // Max level
        } else if (count >= 5) {
            level = 'Explorer';
            badge = '🚀';
            nextLevelCount = 20;
        }

        return NextResponse.json({
            count,
            level,
            badge,
            nextLevelCount,
            places
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
