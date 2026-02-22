
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    const places = await prisma.place.findMany();
    console.log(JSON.stringify(places, null, 2));
}

checkData()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
