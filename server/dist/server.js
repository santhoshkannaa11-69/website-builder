"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const node_1 = require("better-auth/node");
const auth_1 = require("./lib/auth");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const stripeWebhook_1 = require("./controllers/stripeWebhook");
const app = (0, express_1.default)();
const port = 3000;
const corsOptions = {
    origin: [
        'https://santhoshkannaa11-69.github.io',
        'https://santhoshkannaa11-69.github.io/website-builder',
        'http://localhost:3000',
        'https://web-wizard-liard.vercel.app',
        ...(process.env.TRUSTED_ORIGINS?.split(',') || [])
    ],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.post('/api/stripe', express_1.default.raw({ type: 'application/json' }), stripeWebhook_1.stripeWebhook);
app.all('/api/auth/{*any}', (0, node_1.toNodeHandler)(auth_1.auth));
app.use(express_1.default.json({ limit: '50mb' }));
// Debug middleware to track all API requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});
app.get('/', (req, res) => {
    res.send('Sever is Live!');
});
app.use('/api/user', userRoutes_1.default);
app.use('/api/project', projectRoutes_1.default);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map