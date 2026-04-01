import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const rollback331 = [
            "cmmjpfy0d000byu7bi8c1oixb",
            "cmmjpffw7000ayu7bh8malfow",
            "cmmjpgfny000eyu7b1xbpobwm"
        ];
        
        const rollback3Ai = [
            "cmmjoblla0003yu7bu41f6jnu",
            "cmmzstl11000osxcff3i1l10q"
        ];

        const rollback30C = [
            "cmdrtqen4000z3vsw8n2ayp2a",
            "cmdqr8gn3000012lvioolu7iy",
            "cmdrn47op001zo0ng3amdm7oe"
        ];

        let totalRolledBack = 0;

        await prisma.$transaction([
            prisma.resume.updateMany({
                where: { id: { in: rollback331 } },
                data: { userId: "user_331QtZAoWl44VG3JhvDcR7wGvIs" }
            }),
            prisma.resume.updateMany({
                where: { id: { in: rollback3Ai } },
                data: { userId: "user_3AioEZHO2DEvZx2p5fIC9HOZmnw" }
            }),
            prisma.resume.updateMany({
                where: { id: { in: rollback30C } },
                data: { userId: "user_30CpOjHgr5UOvCMwLprBX1iE4rz" }
            })
        ]);

        return NextResponse.json({ success: true, message: "Rolled back the incorrect resumes!" });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
