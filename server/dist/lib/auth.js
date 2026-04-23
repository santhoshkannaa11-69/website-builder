"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
require("dotenv/config");
const better_auth_1 = require("better-auth");
const prisma_1 = require("better-auth/adapters/prisma");
const prisma_2 = __importDefault(require("./prisma"));
const trustedOrigins = [
    'https://santhoshkannaa11-69.github.io',
    'https://santhoshkannaa11-69.github.io/website-builder',
    'https://web-wizard-liard.vercel.app',
    ...(process.env.TRUSTED_ORIGINS?.split(',') || [])
];
// Check if we're using mock database
const isMockDatabase = !process.env.DATABASE_URL;
exports.auth = (0, better_auth_1.betterAuth)({
    database: isMockDatabase ? undefined : (0, prisma_1.prismaAdapter)(prisma_2.default, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        deleteUser: { enabled: true }
    },
    trustedOrigins,
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
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
//# sourceMappingURL=auth.js.map