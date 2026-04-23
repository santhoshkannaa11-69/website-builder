import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import userRouter from './routes/userRoutes';
import projectRouter from './routes/projectRoutes';
import { stripeWebhook } from './controllers/stripeWebhook';
const app = express();
const port = 3000;
const corsOptions = {
    origin: [
        'https://santhoshkannaa11-69.github.io',
        'http://localhost:3000',
        ...(process.env.TRUSTED_ORIGINS?.split(',') || [])
    ],
    credentials: true,
};
app.use(cors(corsOptions));
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhook);
app.all('/api/auth/{*any}', toNodeHandler(auth));
app.use(express.json({ limit: '50mb' }));
// Debug middleware to track all API requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});
app.get('/', (req, res) => {
    res.send('Sever is Live!');
});
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
