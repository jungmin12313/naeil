
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateData() {
    const result = await prisma.place.updateMany({
        where: {
            district: null
        },
        data: {
            district: '북구',
            neighborhood: '용봉동'
        }
    });
    console.log(`Updated ${result.count} places.`);
}

updateData()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
