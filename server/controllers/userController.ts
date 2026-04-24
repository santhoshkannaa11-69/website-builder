import { Request, Response } from "express";
import Stripe from "stripe";
import prisma from "../lib/prisma";
import { runAICompletion } from "../utils/ai";
import { sendError, sendSuccess } from "../utils/responses";

const shouldEnhancePrompt = (prompt: string) => {
    const normalizedPrompt = prompt.trim();
    const wordCount = normalizedPrompt.split(/\s+/).filter(Boolean).length;
    return wordCount > 18 && normalizedPrompt.length > 80;
};

const cleanGeneratedCode = (code: string) =>
    code.replace(/```[a-z]*\n?/gi, "").replace(/```$/g, "").trim();

export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return sendError(res, "User not found", 404, "NOT_FOUND");
        }

        return sendSuccess(res, { credits: user.credits });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to fetch credits right now.";
        return sendError(res, `Unable to fetch credits right now: ${message}`);
    }
};

export const createUserProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { initial_prompt } = req.body as { initial_prompt?: string };

        if (!userId) {
            return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
        }

        if (!initial_prompt?.trim()) {
            return sendError(res, "Initial prompt is required", 400, "VALIDATION_ERROR");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return sendError(res, "User not found", 404, "NOT_FOUND");
        }

        if (user.credits < 5) {
            return sendError(res, "Add credits to create more projects", 403, "INSUFFICIENT_CREDITS");
        }

        const prompt = initial_prompt.trim();

        const project = await prisma.$transaction(async (tx: any) => {
            const createdProject = await tx.websiteProject.create({
                data: {
                    name: prompt.length > 50 ? `${prompt.slice(0, 47)}...` : prompt,
                    initial_prompt: prompt,
                    userId,
                },
            });

            await tx.user.update({
                where: { id: userId },
                data: {
                    totalCreation: { increment: 1 },
                    credits: { decrement: 5 },
                },
            });

            await tx.conversation.createMany({
                data: [
                    {
                        role: "user",
                        content: prompt,
                        projectId: createdProject.id,
                    },
                    {
                        role: "assistant",
                        content: "Step 1/4: Received your prompt. Preparing your project...",
                        projectId: createdProject.id,
                    },
                ],
            });

            return createdProject;
        });

        void (async () => {
            try {
                const shouldEnhance = shouldEnhancePrompt(prompt);
                let enhancedPrompt = prompt;

                if (shouldEnhance) {
                    await prisma.conversation.create({
                        data: {
                            role: "assistant",
                            content: "Step 2/4: Enhancing your prompt for better results...",
                            projectId: project.id,
                        },
                    });

                    enhancedPrompt =
                        (await runAICompletion(
                            [
                                {
                                    role: "system",
                                    content: `
                                You are a prompt enhancement specialist. Take the user's website request and expand it into a detailed, comprehensive prompt that will help create the best possible website.

                                Enhance this prompt by:
                                1. Adding specific design details (layout, color, scheme, typography)
                                2. Specifying key sections and features
                                3. Describing the user experience and interactions
                                4. Including modern web design best practices
                                5. Mentioning responsive but important elements

                                Return ONLY the enhanced prompt, nothing else. Make it detailed but concise (2-3 paragraphs max).
                                `,
                                },
                                {
                                    role: "user",
                                    content: prompt,
                                },
                            ],
                            { retries: 2, timeoutMs: 60000 },
                        )) || prompt;
                }

                await prisma.conversation.create({
                    data: {
                        role: "assistant",
                        content: shouldEnhance
                            ? `Enhanced prompt: "${enhancedPrompt}"`
                            : "Step 2/4: Fast mode enabled, skipping enhancement and moving directly to generation.",
                        projectId: project.id,
                    },
                });

                await prisma.conversation.create({
                    data: {
                        role: "assistant",
                        content: "Step 3/4: Generating your website...",
                        projectId: project.id,
                    },
                });

                const code = await runAICompletion(
                    [
                        {
                            role: "system",
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
                            - Use Tailwind gradient classes for beautiful backgrounds
                            - Make sure all buttons, cards, and components use Tailwind styling

                            CRITICAL HARD RULES:
                            1. You MUST put ALL output ONLY into message.content.
                            2. You MUST NOT place anything in "reasoning", "analysis", "reasoning_details", or any hidden fields.
                            3. You MUST NOT include internal thoughts, explanations, analysis, comments or markdown.
                            4. Do NOT include markdown, explanations, notes, or code fences.

                            The HTML should be complete and ready to render as-is with Tailwind CSS.
                            `,
                        },
                        {
                            role: "user",
                            content: enhancedPrompt,
                        },
                    ],
                    { retries: 2, timeoutMs: 90000 },
                );

                await prisma.conversation.create({
                    data: {
                        role: "assistant",
                        content: "Step 4/4: Saving your website...",
                        projectId: project.id,
                    },
                });

                const cleanedCode = cleanGeneratedCode(code);

                const version = await prisma.version.create({
                    data: {
                        code: cleanedCode,
                        description: "Initial version",
                        projectId: project.id,
                    },
                });

                await prisma.websiteProject.update({
                    where: { id: project.id },
                    data: {
                        current_code: cleanedCode,
                        current_version_index: version.id,
                    },
                });

                await prisma.conversation.create({
                    data: {
                        role: "assistant",
                        content: "Done! I've created your website. You can now preview it and request any changes.",
                        projectId: project.id,
                    },
                });
            } catch (backgroundError: unknown) {
                console.error("[createUserProject background]", backgroundError);
            }
        })();

        return sendSuccess(res, { projectId: project.id });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to start project generation right now.";
        return sendError(res, message, 500, "PROJECT_CREATE_FAILED", true);
    }
};

export const getUserProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params as { projectId: string };

        if (!userId) {
            return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
        }

        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId },
            include: {
                conversation: {
                    orderBy: { timestamp: "asc" },
                },
                versions: {
                    orderBy: { timestamp: "asc" },
                },
            },
        });

        if (!project) {
            return sendError(res, "Project not found", 404, "NOT_FOUND");
        }

        return sendSuccess(res, { project });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to load project right now.";
        return sendError(res, message);
    }
};

export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
        }

        const projects = await prisma.websiteProject.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
        });

        return sendSuccess(res, { projects });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to load projects right now.";
        return sendError(res, message);
    }
};

export const togglePublish = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params as { projectId: string };

        if (!userId) {
            return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
        }

        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId },
        });

        if (!project) {
            return sendError(res, "Project not found", 404, "NOT_FOUND");
        }

        await prisma.websiteProject.update({
            where: { id: project.id },
            data: {
                isPublished: !project.isPublished,
            },
        });

        return sendSuccess(res, {
            message: project.isPublished ? "Project unpublished" : "Project published successfully",
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to update publish status right now.";
        return sendError(res, message);
    }
};

export const purchaseCredits = async (req: Request, res: Response) => {
    try {
        const plans = {
            basic: { credits: 100, amount: 5 },
            pro: { credits: 400, amount: 19 },
            enterprise: { credits: 1000, amount: 49 },
        };

        const userId = req.userId;
        const { planId } = req.body as { planId?: keyof typeof plans };
        const requestOrigin = typeof req.headers.origin === "string" ? req.headers.origin : "";
        const origin = requestOrigin || "http://localhost:5173";

        if (!userId) {
            return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
        }

        if (!planId || !(planId in plans)) {
            return sendError(res, "Plan not found", 404, "NOT_FOUND");
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return sendError(res, "Stripe is not configured", 500, "STRIPE_NOT_CONFIGURED");
        }

        const plan = plans[planId];

        const transaction = await prisma.transaction.create({
            data: {
                userId,
                planId,
                amount: plan.amount,
                credits: plan.credits,
            },
        });

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/loading`,
            cancel_url: `${origin}`,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `AiWebSiteBuilder - ${plan.credits} credits`,
                        },
                        unit_amount: Math.floor(transaction.amount) * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            metadata: {
                transactionId: transaction.id,
                appId: "ai-website-builder",
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        });

        return sendSuccess(res, { payment_link: session.url });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to create checkout session.";
        return sendError(res, message);
    }
};
