import { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import prisma from "../lib/prisma";
import { sendError } from "../utils/responses";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const headers = fromNodeHeaders(req.headers);
        const session = await auth.api.getSession({ headers });

        if (!session?.user?.id) {
            return sendError(res, "Please sign in to continue.", 401, "UNAUTHORIZED");
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return sendError(res, "Account not found. Please sign in again.", 401, "USER_NOT_FOUND");
        }

        req.userId = user.id;
        next();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Authentication failed";
        return sendError(res, message, 401, "AUTH_FAILED");
    }
};
