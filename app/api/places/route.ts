import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gradePlace } from '@/lib/grading';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const places = await prisma.place.findMany({
            orderBy: { createdAt: 'desc' },
            include: { images: true } // Include multi-images
        });
        return NextResponse.json(places);
    } catch (error) {
        console.error('Failed to fetch places:', error);
        return NextResponse.json(
            { error: 'Failed to fetch places' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name, address, lat, lng,
            ramp, door, space,
            threshold, door_width,
            image_url, // Legacy or primary thumbnail
            images,    // New: Array of base64 strings
            has_restroom, has_parking,
            slope, ramp_slope, ramp_width, has_bell, bell_status,
            district, neighborhood
        } = body;

        // Numeric Parsing
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

        // Grading Logic
        let calculatedGrade = 'RED';
        let calculatedComment = '휠체어 진입이 어렵습니다.';

        if (ramp === '계단만') {
            calculatedGrade = 'RED';
            calculatedComment = '입구가 계단으로 되어있어 휠체어 진입이 불가능합니다.';
        } else {
            const { grade, comment } = gradePlace({
                ramp,
                door,
                space,
                threshold: thresholdVal ?? 0,
                door_width: doorWidthVal ?? 0
            });
            calculatedGrade = grade;
            calculatedComment = comment;
        }

        const session = await getServerSession(authOptions);
        const authorId = session?.user?.id;

        // Transaction to create Place + Images
        // Note: Prisma create supports nested writes
        const place = await prisma.place.create({
            data: {
                authorId,
                name,
                address,
                lat,
                lng,
                ramp,
                door,
                space,
                grade: calculatedGrade,
                comment: calculatedComment,
                threshold: thresholdVal as any,
                door_width: doorWidthVal as any,
                image_url: image_url || (images && images.length > 0 ? images[0] : null), // Fallback thumbnail
                has_restroom: Boolean(has_restroom),
                has_parking: Boolean(has_parking),
                slope: slopeVal,
                ramp_slope: rampSlopeVal as any,
                ramp_width: rampWidthVal as any,
                has_bell: Boolean(has_bell),
                bell_status: bell_status || null,
                district,
                neighborhood,
                // Nested create for images
                images: {
                    create: images?.map((url: string) => ({ url })) || []
                }
            },
            include: { images: true }
        });

        return NextResponse.json(place);
    } catch (error) {
        console.error('Failed to create place:', error);
        return NextResponse.json(
            { error: 'Failed to create place', details: String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        // ★ AUTH PROTECTION
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        // Optional: Check if user is author? For now, any logged-in user can delete (Community style)
        // or strictly author only. User said "logged in person can delete", usually implies anyone logged in 
        // OR only their own. Given "Community Mapping", often any contributor can edit, but let's just 
        // stick to "Logged In".

        await prisma.place.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete place:', error);
        return NextResponse.json(
            { error: 'Failed to delete place' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        // ★ AUTH PROTECTION
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const {
            id, name, address, lat, lng,
            ramp, door, space,
            threshold, door_width,
            image_url,
            images, // New array
            has_restroom, has_parking,
            slope, ramp_slope, ramp_width, has_bell, bell_status,
            district, neighborhood
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        // Numeric Parsing
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

        // Grade Logic
        let calculatedGrade = 'RED';
        let calculatedComment = '휠체어 진입이 어렵습니다.';

        if (ramp === '계단만') {
            calculatedGrade = 'RED';
            calculatedComment = '입구가 계단으로 되어있어 휠체어 진입이 불가능합니다.';
        } else {
            const { grade, comment } = gradePlace({
                ramp,
                door,
                space,
                threshold: thresholdVal ?? 0,
                door_width: doorWidthVal ?? 0
            });
            calculatedGrade = grade;
            calculatedComment = comment;
        }

        // Update with Nested Write (Delete All old images, Create New)
        // This effectively "Replaces" the image list
        const updateData: any = {
            name,
            address,
            lat,
            lng,
            ramp,
            door,
            space,
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
            district,
            neighborhood,
        };

        // If images array is provided, update relation
        if (images && Array.isArray(images)) {
            updateData.images = {
                deleteMany: {}, // Clear old
                create: images.map((url: string) => ({ url })) // Add new
            };
        }

        const place = await prisma.place.update({
            where: { id },
            data: updateData,
            include: { images: true }
        });

        return NextResponse.json(place);
    } catch (error) {
        console.error('Failed to update place:', error);
        return NextResponse.json(
            { error: 'Failed to update place', details: String(error) },
            { status: 500 }
        );
    }
}
