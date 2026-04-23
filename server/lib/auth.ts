import 'dotenv/config';
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

const trustedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://santhoshkannaa11-69.github.io',
    'https://santhoshkannaa11-69.github.io/website-builder',
    'https://web-wizard-liard.vercel.app',
    ...(process.env.TRUSTED_ORIGINS?.split(',') || [])
];

// Check if we're using mock database
const isMockDatabase = !process.env.DATABASE_URL;

// Create a mock adapter for development
const createMockAdapter = () => {
    console.log('Mock adapter: Creating mock adapter, isMockDatabase:', isMockDatabase, 'prisma ready:', !!prisma);
    
    // Create a simple in-memory adapter that doesn't depend on Prisma
    const memoryStore: any = {
        users: [],
        sessions: [],
        accounts: []
    };
    
    return {
        create: async ({ data }: any) => {
            console.log('Mock adapter: Creating user:', data.email);
            const user = { id: Math.random().toString(36), ...data, createdAt: new Date(), updatedAt: new Date() };
            memoryStore.users.push(user);
            return user;
        },
        findUnique: async ({ where }: any) => {
            console.log('Mock adapter: Finding user:', where);
            if (where.email) {
                return memoryStore.users.find((u: any) => u.email === where.email);
            }
            if (where.id) {
                return memoryStore.users.find((u: any) => u.id === where.id);
            }
            return null;
        },
        findMany: async () => {
            return memoryStore.users;
        },
        update: async ({ where, data }: any) => {
            console.log('Mock adapter: Updating user:', where, data);
            const userIndex = memoryStore.users.findIndex((u: any) => u.id === where.id);
            if (userIndex !== -1) {
                memoryStore.users[userIndex] = { ...memoryStore.users[userIndex], ...data, updatedAt: new Date() };
                return memoryStore.users[userIndex];
            }
            return null;
        },
        delete: async ({ where }: any) => {
            console.log('Mock adapter: Deleting user:', where);
            const userIndex = memoryStore.users.findIndex((u: any) => u.id === where.id);
            if (userIndex !== -1) {
                const deletedUser = memoryStore.users[userIndex];
                memoryStore.users.splice(userIndex, 1);
                return deletedUser;
            }
            return null;
        }
    };
};

// Log configuration before creating auth
console.log('Auth Config - DATABASE_URL:', !!process.env.DATABASE_URL);
console.log('Auth Config - prisma ready:', !!prisma);
console.log('Auth Config - NODE_ENV:', process.env.NODE_ENV);
console.log('Auth Config - trustedOrigins:', process.env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'] : trustedOrigins);

export const auth = betterAuth({
    database: process.env.NODE_ENV === 'production' && prisma ? prismaAdapter(prisma, {
        provider: "postgresql", 
    }) : undefined, // Only use database adapter in production when Prisma is ready
    emailAndPassword: { 
        enabled: true, 
        requireEmailVerification: false // Disable email verification for development
    }, 
    user: {
        deleteUser: {enabled: true}
    },
    trustedOrigins: process.env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'] : trustedOrigins, // Allow localhost origins in development
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    secret: process.env.BETTER_AUTH_SECRET || 'test-secret-key-for-development-only',
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
        }
    },
    advanced: {
        cookies: {
            session_token: {
                name: 'auth_session',
                attributes: {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    path: '/',
                }
            }
        }
    }
});
