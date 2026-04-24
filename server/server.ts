import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { stripeWebhook } from "./controllers/stripeWebhook";
import { auth, isOriginAllowed } from "./lib/auth";
import projectRouter from "./routes/projectRoutes";
import userRouter from "./routes/userRoutes";
import { sendError } from "./utils/responses";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(
    cors({
        origin: (origin, callback) => {
            if (isOriginAllowed(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
    }),
);

app.get("/", (_req, res) => res.send("OK"));
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", toNodeHandler(auth));
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        next(err);
        return;
    }

    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[server]", err);
    sendError(res, message);
});

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
