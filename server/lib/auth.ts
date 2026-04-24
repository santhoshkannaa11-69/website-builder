import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

const normalizeOrigin = (origin: string) =>
    origin.trim().replace(/^['"]|['"]$/g, "").replace(/\/+$/, "");

const rawTrustedOrigins = process.env.TRUSTED_ORIGINS ?? "";
const isProduction = process.env.NODE_ENV === "production";
const baseURL = isProduction
    ? normalizeOrigin(process.env.BETTER_AUTH_URL || "https://web-wizard-liard.vercel.app")
    : "http://localhost:3000";

const trustedOrigins = Array.from(
    new Set(
        [
            ...rawTrustedOrigins
                .split(",")
                .map(normalizeOrigin)
                .filter(Boolean),
            baseURL,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
        ].filter(Boolean),
    ),
);

export const isOriginAllowed = (origin?: string | null) => {
    if (!origin) {
        return true;
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (trustedOrigins.includes(normalizedOrigin)) {
        return true;
    }

    return !isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);
};

export { baseURL, isProduction, trustedOrigins };

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    user: {
        deleteUser: { enabled: true },
    },
    trustedOrigins,
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET || "test-secret-key-for-development-only",
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: false,
        },
    },
    advanced: {
        cookies: {
            session_token: {
                name: "auth_session",
                attributes: {
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? "none" : "lax",
                    path: "/",
                },
            },
        },
    },
});
