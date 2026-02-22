import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gradePlace } from '@/lib/grading';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const places = await prisma.place.findMany({
            orderBy: { createdAt: 'desc' },
            include: { images: true }
        });
        return NextResponse.json(places);
    } catch (error) {
        console.error('Failed to fetch places:', error);
        return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json() as any;
        const {
            name, address, lat, lng,
            ramp, door, space,
            threshold, door_width,
            image_url,
            images,
            has_restroom, has_parking,
            slope, ramp_slope, ramp_width, has_bell, bell_status,
            district, neighborhood
        } = body;

        const parseOptionalFloat = (val: any) => {
            if (val === null || val === '' || val === undefined) return null;
            const num = Number(val);
            return isNaN(num) ? null : num;
        };

        const thresholdVal = parseOptionalFloat(threshold);
        const doorWidthVal = parseOptionalFloat(door_width);
        const slopeVal = slope ? Number(slope) : 0;
        const rampSlopeVal = parseOptionalFloat(ramp_slope);
        const rampWidthVal = parseOptionalFloat(ramp_width);

        let calculatedGrade = 'RED';
        let calculatedComment = '휠체어 진입이 어렵습니다.';

        if (ramp === '계단만') {
            calculatedGrade = 'RED';
            calculatedComment = '입구가 계단으로 되어있어 휠체어 진입이 불가능합니다.';
        } else {
            const { grade, comment } = gradePlace({
                ramp, door, space,
                threshold: thresholdVal ?? 0,
                door_width: doorWidthVal ?? 0
            });
            calculatedGrade = grade;
            calculatedComment = comment;
        }

        const session = await getServerSession(authOptions);
        const authorId = session?.user?.id;

        const place = await prisma.place.create({
            data: {
                authorId, name, address, lat, lng, ramp, door, space,
                grade: calculatedGrade,
                comment: calculatedComment,
                threshold: thresholdVal as any,
                door_width: doorWidthVal as any,
                image_url: image_url || (images && images.length > 0 ? images[0] : null),
                has_restroom: Boolean(has_restroom),
                has_parking: Boolean(has_parking),
                slope: slopeVal,
                ramp_slope: rampSlopeVal as any,
                ramp_width: rampWidthVal as any,
                has_bell: Boolean(has_bell),
                bell_status: bell_status || null,
                district, neighborhood,
                images: {
                    create: images?.map((url: string) => ({ url })) || []
                }
            },
            include: { images: true }
        });

        return NextResponse.json(place);
    } catch (error) {
        console.error('Failed to create place:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        await prisma.place.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const body = await request.json() as any;
        const {
            id, name, address, lat, lng, ramp, door, space,
            threshold, door_width, image_url, images,
            has_restroom, has_parking, slope, ramp_slope, ramp_width,
            has_bell, bell_status, district, neighborhood
        } = body;

        const parseOptionalFloat = (val: any) => {
            if (val === null || val === '' || val === undefined) return null;
            return Number(val);
        };

        const thresholdVal = parseOptionalFloat(threshold);
        const doorWidthVal = parseOptionalFloat(door_width);
        const slopeVal = slope ? Number(slope) : 0;
        const rampSlopeVal = parseOptionalFloat(ramp_slope);
        const rampWidthVal = parseOptionalFloat(ramp_width);

        let calculatedGrade = 'RED';
        let calculatedComment = '휠체어 진입이 어렵습니다.';

        if (ramp === '계단만') {
            calculatedGrade = 'RED';
            calculatedComment = '입구가 계단으로 되어있어 휠체어 진입이 불가능합니다.';
        } else {
            const { grade, comment } = gradePlace({
                ramp, door, space,
                threshold: thresholdVal ?? 0,
                door_width: doorWidthVal ?? 0
            });
            calculatedGrade = grade;
            calculatedComment = comment;
        }

        const updateData: any = {
            name, address, lat, lng, ramp, door, space,
            grade: calculatedGrade,
            comment: calculatedComment,
            threshold: thresholdVal as any,
            door_width: doorWidthVal as any,
            image_url: image_url || (images && images.length > 0 ? images[0] : null),
            has_restroom: Boolean(has_restroom),
            has_parking: Boolean(has_parking),
            slope: slopeVal,
            ramp_slope: rampSlopeVal as any,
            ramp_width: rampWidthVal as any,
            has_bell: Boolean(has_bell),
            bell_status: bell_status || null,
            district, neighborhood,
        };

        if (images && Array.isArray(images)) {
            updateData.images = {
                deleteMany: {},
                create: images.map((url: string) => ({ url }))
            };
        }

        const place = await prisma.place.update({
            where: { id },
            data: updateData,
            include: { images: true }
        });

        return NextResponse.json(place);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
