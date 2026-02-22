import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as { name: string; email: string; password: string };
        const { name, email, password } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ message: "miss" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: "exists" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({ data: { name, email, password: hashedPassword } });

        return NextResponse.json({ message: "ok" }, { status: 201 });
    } catch {
        return NextResponse.json({ message: "error" }, { status: 500 });
    }
}
