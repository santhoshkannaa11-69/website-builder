"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const auth_1 = require("../lib/auth");
const node_1 = require("better-auth/node");
const responses_1 = require("../utils/responses");
const protect = async (req, res, next) => {
    try {
        console.log('Auth: Checking session for:', req.originalUrl);
        const session = await auth_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers)
        });
        console.log('Auth: Session result:', session ? 'Found' : 'Not found');
        if (!session || !session?.user) {
            console.log('Auth: No session or user found');
            return (0, responses_1.sendError)(res, 'Unauthorized user', 401, "UNAUTHORIZED");
        }
        req.userId = session.user.id;
        console.log('Auth: Setting req.userId to:', req.userId);
        console.log('Auth: User ID set:', req.userId);
        next();
    }
    catch (error) {
        console.log('Auth: Error during authentication:', error);
        return (0, responses_1.sendError)(res, "Authentication failed", 401, "AUTH_FAILED");
    }
};
exports.protect = protect;
//# sourceMappingURL=auth.js.map