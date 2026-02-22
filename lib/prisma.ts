import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

export interface Env {
    DB: D1Database;
}

export const getPrisma = (env?: Env) => {
    if (env?.DB) {
        const adapter = new PrismaD1(env.DB);
        return new PrismaClient({ adapter });
    }
    return new PrismaClient();
};

// For backward compatibility with existing code that imports 'prisma'
export const prisma = new PrismaClient();
