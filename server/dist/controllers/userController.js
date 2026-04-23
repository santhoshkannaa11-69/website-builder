import prisma from '../lib/prisma.js';
import { runAICompletion } from '../utils/ai.js';
import { sendError, sendSuccess } from '../utils/responses.js';
import Stripe from 'stripe';
const shouldEnhancePrompt = (prompt) => {
    const normalizedPrompt = prompt.trim();
    const wordCount = normalizedPrompt.split(/\s+/).filter(Boolean).length;
    return wordCount > 18 && normalizedPrompt.length > 80;
};
// Get User Credits
export const getUserCredits = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return sendError(res, 'Unauthorized', 401, "UNAUTHORIZED");
        }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        return sendSuccess(res, { credits: user?.credits ?? 0 });
    }
    catch (error) {
        console.log(error.code || error.message);
        return sendError(res, "Unable to fetch credits right now.");
    }
};
// Controller Function to create New Project
export const createUserProject = async (req, res) => {
    const userId = req.userId;
    try {
        const { initial_prompt } = req.body;
        if (!userId) {
            return sendError(res, 'Unauthorized', 401, "UNAUTHORIZED");
        }
        if (!initial_prompt) {
            return sendError(res, 'Initial prompt is required', 400, "VALIDATION_ERROR");
        }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (user && user.credits < 5) {
            return sendError(res, 'Add credits to create more projects', 403, "INSUFFICIENT_CREDITS");
        }
        const project = await prisma.$transaction(async (tx) => {
            const createdProject = await tx.websiteProject.create({
                data: {
                    name: initial_prompt.length > 50 ? initial_prompt.substring(0, 47) + '...' : initial_prompt,
                    initial_prompt,
                    userId
                }
            });
            await tx.user.update({
                where: { id: userId },
                data: {
                    totalCreation: { increment: 1 },
                    credits: { decrement: 5 }
                }
            });
            await tx.conversation.createMany({
                data: [
                    {
                        role: 'user',
                        content: initial_prompt,
                        projectId: createdProject.id
                    },
                    {
                        role: 'assistant',
                        content: 'Step 1/4: Received your prompt. Preparing your project...',
                        projectId: createdProject.id
                    }
                ]
            });
            return createdProject;
        });
        sendSuccess(res, { projectId: project.id });
        void (async () => {
            try {
                const shouldEnhance = shouldEnhancePrompt(initial_prompt);
                let enhancedPrompt = initial_prompt;
                if (shouldEnhance) {
                    await prisma.conversation.create({
                        data: {
                            role: 'assistant',
                            content: 'Step 2/4: Enhancing your prompt for better results...',
                            projectId: project.id
                        }
                    });
                    enhancedPrompt = await runAICompletion([
                        {
                            role: 'system',
                            content: `
                                You are a prompt enhancement specialist. Take the user's website request and expand it into a detailed, comprehensive prompt that will help create the best possible website.

                                Enhance this prompt by:
                                1. Adding specific design details (layout, color, scheme, typography)
                                2. Specifying key sections and features
                                3. Describing the user experience and interactions
                                4. Including modern web design best practices
                                5. Mentioning responsive but important elements

                                Return ONLY the enhanced prompt, nothing else. Make it detailed but concise (2-3 paragraphs max).
                                `
                        },
                        {
                            role: 'user',
                            content: initial_prompt
                        }
                    ], { retries: 2, timeoutMs: 60000 }) || initial_prompt;
                }
                await prisma.conversation.create({
                    data: {
                        role: 'assistant',
                        content: shouldEnhance
                            ? `Enhanced prompt: "${enhancedPrompt}"`
                            : `Step 2/4: Fast mode enabled, skipping enhancement and moving directly to generation.`,
                        projectId: project.id
                    }
                });
                await prisma.conversation.create({
                    data: {
                        role: 'assistant',
                        content: 'Step 3/4: Generating your website...',
                        projectId: project.id
                    }
                });
                const code = await runAICompletion([
                    {
                        role: 'system',
                        content: `
                            You are an expert web developer. Create a complete, production-ready, single-page website based on this request: "${enhancedPrompt}"

                            CRITICAL REQUIREMENTS:
                            - You MUST output valid HTML ONLY
                            - Use Tailwind CSS for ALL styling
                            - Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                            - Use Tailwind utility classes extensively for styling, animations, and responsiveness
                            - Make it fully functional and interactive with JavaScript in <script> tag before closing </body>
                            - Use modern, beautiful design with great UX using Tailwind classes
                            - Make it responsive using Tailwind responsive classes (sm:, md:, lg:, xl:)
                            - Use Tailwind animations and transitions (animate-*, transition-*)
                            - Include all necessary meta tags
                            - Use Google Fonts CDN if needed for custom fonts
                            - Use placeholder images from https://placehold.co/600x400
                            - Use Tailwind gradient classes fro beautiful backgrounds
                            - Make sure all buttons, cards, and components use Tailwind styling
                            
                            CRITICAL HARD RULES:
                            1. You MUST put ALL output ONLY into message.content.
                            2. You MUST NOT place anything in "reasoning", "analysis", "reasoning_details", or any hidden fields.
                            3. You MUST NOT include internal thoughts, explanations, analysis, comments or markdown.
                            4. Do NOT include markdown, explanations, notes, or code fences.

                            The HTML should be complete and ready to render as-is with Tailwind CSS.
                            `
                    },
                    {
                        role: 'user',
                        content: enhancedPrompt || ''
                    }
                ], { retries: 2, timeoutMs: 90000 }) || '';
                if (!code) {
                    await prisma.conversation.create({
                        data: {
                            role: 'assistant',
                            content: "Unable to generate the code right now. Please try again.",
                            projectId: project.id
                        }
                    });
                    await prisma.user.update({
                        where: { id: userId },
                        data: { credits: { increment: 5 } }
                    });
                    return;
                }
                await prisma.conversation.create({
                    data: {
                        role: 'assistant',
                        content: 'Step 4/4: Saving your website...',
                        projectId: project.id
                    }
                });
                const cleanedCode = code.replace(/```[a-z]*\n?/gi, '')
                    .replace(/```$/g, '')
                    .trim();
                const version = await prisma.version.create({
                    data: {
                        code: cleanedCode,
                        description: 'Initial version',
                        projectId: project.id
                    }
                });
                await prisma.websiteProject.update({
                    where: { id: project.id },
                    data: {
                        current_code: cleanedCode,
                        current_version_index: version.id
                    }
                });
                await prisma.conversation.create({
                    data: {
                        role: 'assistant',
                        content: "Done! I've created your website. You can now preview it and request any changes.",
                        projectId: project.id
                    }
                });
            }
            catch (backgroundError) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { credits: { increment: 5 } }
                }).catch(() => { });
                await prisma.conversation.create({
                    data: {
                        role: 'assistant',
                        content: "Website generation failed while processing. Credits were refunded. Please try again.",
                        projectId: project.id
                    }
                }).catch(() => { });
                console.log(backgroundError.code || backgroundError.message);
            }
        })();
    }
    catch (error) {
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            }).catch(() => { });
        }
        console.log(error.code || error.message);
        if (!res.headersSent) {
            return sendError(res, "Unable to start project generation right now.", 500, "PROJECT_CREATE_FAILED", true);
        }
    }
};
// Controller Function to Get A Single User Project
export const getUserProject = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return sendError(res, 'Unauthorized', 401, "UNAUTHORIZED");
        }
        const { projectId } = req.params;
        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: {
                conversation: {
                    orderBy: { timestamp: 'asc' }
                },
                versions: { orderBy: { timestamp: 'asc' } }
            }
        });
        return sendSuccess(res, { project });
    }
    catch (error) {
        console.log(error.code || error.message);
        return sendError(res, "Unable to load project right now.");
    }
};
// Controller Function to Get All Users Projects
export const getUserProjects = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return sendError(res, 'Unauthorized', 401, "UNAUTHORIZED");
        }
        const projects = await prisma.websiteProject.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });
        return sendSuccess(res, { projects });
    }
    catch (error) {
        console.log(error.code || error.message);
        return sendError(res, "Unable to load projects right now.");
    }
};
// Controller Function to Toggle Project Publish
export const togglePublish = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return sendError(res, 'Unauthorized', 401, "UNAUTHORIZED");
        }
        const { projectId } = req.params;
        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId }
        });
        if (!project) {
            return sendError(res, 'Project not found', 404, "NOT_FOUND");
        }
        await prisma.websiteProject.update({
            where: { id: projectId },
            data: { isPublished: !project.isPublished }
        });
        return sendSuccess(res, { message: project.isPublished ? 'Project unpublished' : 'Project published successfully' });
    }
    catch (error) {
        console.log(error.code || error.message);
        return sendError(res, "Unable to update publish status right now.");
    }
};
// Controller Function to Purchase Credits
export const purchaseCredits = async (req, res) => {
    try {
        const plans = {
            basic: { credits: 100, amount: 5 },
            pro: { credits: 400, amount: 19 },
            enterprise: { credits: 1000, amount: 49 },
        };
        const userId = req.userId;
        const { planId } = req.body;
        const origin = req.headers.origin;
        const plan = plans[planId];
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        const transaction = await prisma.transaction.create({
            data: {
                userId: userId,
                planId: req.body.planId,
                amount: plan.amount,
                credits: plan.credits
            }
        });
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/loading`,
            cancel_url: `${origin}`,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `AiWebSiteBuilder - ${plan.credits} credits`
                        },
                        unit_amount: Math.floor(transaction.amount) * 100
                    },
                    quantity: 1
                },
            ],
            mode: 'payment',
            metadata: {
                transactionId: transaction.id,
                appId: 'ai-website-builder'
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
        });
        res.json({ payment_link: session.url });
    }
    catch (error) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};
