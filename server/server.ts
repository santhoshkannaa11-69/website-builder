import express, { Request,  Response, NextFunction } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import userRouter from './routes/userRoutes';
import projectRouter from './routes/projectRoutes';
import { stripeWebhook } from './controllers/stripeWebhook';
import prisma from './lib/prisma';

const app = express();

const port = 3000;

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://santhoshkannaa11-69.github.io',
        'https://santhoshkannaa11-69.github.io/website-builder',
        'https://web-wizard-liard.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}

app.use(cors(corsOptions))
app.use(express.json({limit: '50mb'}))
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhook)

app.use('/api/auth', toNodeHandler(auth));

// Debug middleware to track all API requests
app.use((req: Request, res: Response, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error occurred:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/user', userRouter);
app.use('/api/project', projectRouter)

// Wait for Prisma to initialize before starting the server
async function startServer() {
    // Wait a bit for Prisma to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if Prisma is ready
    if (!prisma || !prisma.websiteProject) {
        console.warn('Prisma not fully initialized, but starting server anyway...');
    } else {
        console.log('Prisma initialized successfully');
    }
    
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}

startServer();