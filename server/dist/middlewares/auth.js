import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { sendError } from "../utils/responses";
export const protect = async (req, res, next) => {
    try {
        console.log('Auth: Checking session for:', req.originalUrl);
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });
        console.log('Auth: Session result:', session ? 'Found' : 'Not found');
        if (!session || !session?.user) {
            console.log('Auth: No session or user found');
            return sendError(res, 'Unauthorized user', 401, "UNAUTHORIZED");
        }
        req.userId = session.user.id;
        console.log('Auth: Setting req.userId to:', req.userId);
        console.log('Auth: User ID set:', req.userId);
        next();
    }
    catch (error) {
        console.log('Auth: Error during authentication:', error);
        return sendError(res, "Authentication failed", 401, "AUTH_FAILED");
    }
};
