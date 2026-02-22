import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3Upload';
import { calculateLevel, getPointsForAction } from '@/lib/gamification';

// Helper to determine status based on step height/slope (Simple Logic for Phase 1)
function determineStatus(stepHeight: number, slopeType: string) {
    if (stepHeight <= 2.0) return 'ACCESSIBLE';
    if (slopeType === 'FLAT' || slopeType === 'MODERATE') return 'ACCESSIBLE';
    if (slopeType === 'STEEP') return 'CONDITIONAL';
    return 'INACCESSIBLE';
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // 1. Extract Data
        const photo1 = formData.get('photo1') as File;
        const photo2 = formData.get('photo2') as File;
        const dataJson = formData.get('data') as string;

        if (!dataJson) {
            return NextResponse.json({ error: 'Missing data payload' }, { status: 400 });
        }

        const data = JSON.parse(dataJson);

        // 2. Upload Photos (Parallel)
        const [photoUrl1, photoUrl2] = await Promise.all([
            uploadToS3(photo1, 'entrance'),
            uploadToS3(photo2, 'step_detail')
        ]);

        // 3. Determine Status
        const status = determineStatus(data.stepHeightCm || 0, data.slopeType || 'FLAT');

        // 4. Create Report in Transaction with Gamification Update
        const result = await prisma.$transaction(async (tx) => {
            // A. Create Report
            const report = await tx.report.create({
                data: {
                    placeId: data.placeId || `temp_${Date.now()}`,
                    placeName: data.placeName,
                    userId: data.userId,
                    latitude: Number(data.latitude),
                    longitude: Number(data.longitude),
                    district: data.district,
                    neighborhood: data.neighborhood,
                    address: data.address || '',
                    status: status,
                    stepHeightCm: Number(data.stepHeightCm),
                    slopeType: data.slopeType,
                    photoUrl1,
                    photoUrl2,
                    userMemo: data.userMemo
                }
            });

            // B. Update User Points
            const points = getPointsForAction('REPORT');
            const user = await tx.user.findUnique({ where: { id: data.userId } });

            if (!user) throw new Error('User not found');

            const newIndex = (user.naeilIndex || 0) + points;
            const newLevelObj = calculateLevel(newIndex);

            const updatedUser = await tx.user.update({
                where: { id: data.userId },
                data: {
                    naeilIndex: newIndex,
                    level: newLevelObj.level, // Store level number
                    // Could also store 'title' if we add a field for it
                }
            });

            return { report, updatedUser, pointsAwarded: points, newLevel: newLevelObj };
        });

        return NextResponse.json({
            success: true,
            reportId: result.report.id,
            pointsAwarded: result.pointsAwarded,
            newLevel: result.newLevel.level,
            newTitle: result.newLevel.title,
            totalPoints: result.updatedUser.naeilIndex
        });

    } catch (error) {
        console.error('Report API Error:', error);
        return NextResponse.json(
            { error: 'Failed to create report' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const district = searchParams.get('district');
    const neighborhood = searchParams.get('neighborhood');

    // Filter by District/Neighborhood if provided
    const whereClause: any = {};
    if (district) whereClause.district = district;
    if (neighborhood) whereClause.neighborhood = neighborhood;

    const reports = await prisma.report.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 100
    });

    return NextResponse.json(reports);
}
