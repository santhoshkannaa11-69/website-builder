import { Request, Response } from "express";
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

const findOwnedProject = (projectId: string, userId: string) =>
    prisma.websiteProject.findFirst({
        where: { id: projectId, userId },
        include: {
            versions: {
                orderBy: { timestamp: "asc" },
            },
        },
    });

export const makeRevison = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params as { projectId: string };
        const { message } = req.body as { message?: string };

        if (!userId) {
            return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
        }

        if (!message?.trim()) {
            return sendError(res, "Please enter a valid prompt", 400, "VALIDATION_ERROR");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return sendError(res, "User not found", 404, "NOT_FOUND");
        }

        if (user.credits < 5) {
            return sendError(
                res,
                "You don't have enough credits to make revisions. Please add more credits to continue.",
                403,
                "INSUFFICIENT_CREDITS",
            );
        }

        const currentProject = await findOwnedProject(projectId, userId);

        if (!currentProject) {
            return sendError(res, "Project not found", 404, "NOT_FOUND");
        }

        const prompt = message.trim();

        await prisma.$transaction(async (tx: any) => {
            await tx.conversation.create({
                data: {
                    role: "user",
                    content: prompt,
                    projectId,
                },
            });

            await tx.user.update({
                where: { id: userId },
                data: { credits: { decrement: 5 } },
            });

            await tx.conversation.create({
                data: {
                    role: "assistant",
                    content: "Step 1/4: Understanding your revision request...",
                    projectId,
                },
            });
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
                            projectId,
                        },
                    });

                    enhancedPrompt =
                        (await runAICompletion(
                            [
                                {
                                    role: "system",
                                    content: `
                                You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

                                Enhance this by:
                                1. Being specific about what elements to change
                                2. Mentioning design details (colors, spacing, sizes)
                                3. Clarifying the desired outcome
                                4. Using clear technical terms

                                Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).
                                `,
                                },
                                {
                                    role: "user",
                                    content: `User's request: "${prompt}"`,
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
                            : "Step 2/4: Fast mode enabled, skipping enhancement and moving directly to code generation.",
                        projectId,
                    },
                });

                await prisma.conversation.create({
                    data: {
                        role: "assistant",
                        content: "Step 3/4: Generating updated website code...",
                        projectId,
                    },
                });

                const code = await runAICompletion(
                    [
                        {
                            role: "system",
                            content: `
                            You are an expert web developer.

                            CRITICAL REQUIREMENTS:
                            - Return ONLY the complete updated HTML code with the requested changes.
                            - Use Tailwind CSS for ALL styling (NO custom CSS).
                            - Use Tailwind utility classes for all styling changes.
                            - Include all JavaScript in <script> tags before closing </body>
                            - Make sure it's a complete, standalone HTML document with Tailwind CSS
                            - Return the HTML Code Only, nothing else

                            Apply the requested changes while maintaining the Tailwind CSS styling approach.
                            `,
                        },
                        {
                            role: "user",
                            content: `Here is the current website code: "${currentProject.current_code || ""}" The user wants this change: "${enhancedPrompt}"`,
                        },
                    ],
                    { retries: 2, timeoutMs: 90000 },
                );

                await prisma.conversation.create({
                    data: {
                        role: "assistant",
                        content: "Step 4/4: Saving your new version...",
                        projectId,
                    },
                });

                const cleanedCode = cleanGeneratedCode(code);

                const version = await prisma.version.create({
                    data: {
                        code: cleanedCode,
                        description: "changes made",
                        projectId,
                    },
                });

                await prisma.websiteProject.update({
                    where: { id: projectId },
                    data: {
                        current_code: cleanedCode,
                        current_version_index: version.id,
                    },
                });

                await prisma.conversation.create({
                    data: {
                        role: "assistant",
                        content: "Done! I've made the changes to your website. You can now preview it.",
                        projectId,
                    },
                });
            } catch (backgroundError: unknown) {
                console.error("[makeRevision background]", backgroundError);
                await prisma.conversation
                    .create({
                        data: {
                            role: "assistant",
                            content: "I could not apply that revision right now. Please try again.",
                            projectId,
                        },
                    })
                    .catch(() => undefined);
            }
        })();

        return sendSuccess(res, {
            message: "Revision started",
            projectId,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to start revision right now.";
        return sendError(res, message, 500, "REVISION_START_FAILED", true);
    }
};

export const rollbackToVersion = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { projectId, versionId } = req.params as { projectId: string; versionId: string };

        if (!userId) {
            return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
        }

        const project = await findOwnedProject(projectId, userId);

        if (!project) {
            return sendError(res, "Project not found", 404, "NOT_FOUND");
        }

        const version = project.versions.find((item) => item.id === versionId);

        if (!version) {
            return sendError(res, "Version not found", 404, "NOT_FOUND");
        }

        await prisma.websiteProject.update({
            where: { id: projectId },
            data: {
                current_code: version.code,
                current_version_index: version.id,
            },
        });

        await prisma.conversation.create({
            data: {
                role: "assistant",
                content: "I've rolled back your website to the selected version. You can now preview it.",
                projectId,
            },
        });

        return sendSuccess(res, { message: "Version rolled back successfully" });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to rollback version right now.";
        return sendError(res, message);
    }
};

export const deleteProject = async (req: Request, res: Response) => {
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

        await prisma.websiteProject.delete({
            where: { id: projectId },
        });

        return sendSuccess(res, { message: "Project deleted successfully" });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to delete project right now.";
        return sendError(res, message);
    }
};

export const getProjectPreview = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params as { projectId: string };

        if (!userId) {
            return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
        }

        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId },
            include: {
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
        const message = error instanceof Error ? error.message : "Unable to load preview right now.";
        return sendError(res, message);
    }
};

export const getPublishedProjects = async (_req: Request, res: Response) => {
    try {
        const projects = await prisma.websiteProject.findMany({
            where: { isPublished: true },
            include: {
                user: true,
            },
            orderBy: { updatedAt: "desc" },
        });

        return sendSuccess(res, { projects });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to load published projects right now.";
        return sendError(res, message);
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params as { projectId: string };

        const project = await prisma.websiteProject.findFirst({
            where: {
                id: projectId,
                isPublished: true,
            },
            select: {
                current_code: true,
            },
        });

        if (!project?.current_code) {
            return sendError(res, "Project not found", 404, "NOT_FOUND");
        }

        return sendSuccess(res, { code: project.current_code });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to load project code right now.";
        return sendError(res, message);
    }
};

export const saveProjectCode = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params as { projectId: string };
        const { code } = req.body as { code?: string };

        if (!userId) {
            return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
        }

        if (!code?.trim()) {
            return sendError(res, "Code is required", 400, "VALIDATION_ERROR");
        }

        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId },
        });

        if (!project) {
            return sendError(res, "Project not found", 404, "NOT_FOUND");
        }

        await prisma.websiteProject.update({
            where: { id: projectId },
            data: {
                current_code: code,
                current_version_index: "",
            },
        });

        return sendSuccess(res, { message: "Project saved successfully" });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to save project right now.";
        return sendError(res, message);
    }
};
