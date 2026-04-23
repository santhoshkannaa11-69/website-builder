import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { sendError } from "../utils/responses.js";
export const protect = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });
        if (!session || !session?.user) {
            return sendError(res, 'Unauthorized user', 401, "UNAUTHORIZED");
        }
        req.userId = session.user.id;
        next();
    }
    catch (error) {
        console.log(error);
        return sendError(res, "Authentication failed", 401, "AUTH_FAILED");
    }
};
