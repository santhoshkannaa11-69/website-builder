import prisma from '../lib/prisma.js';
import { runAICompletion } from '../utils/ai.js';
import { sendError, sendSuccess } from '../utils/responses.js';
const shouldEnhancePrompt = (prompt) => {
    const normalizedPrompt = prompt.trim();
    const wordCount = normalizedPrompt.split(/\s+/).filter(Boolean).length;
    return wordCount > 18 && normalizedPrompt.length > 80;
};
// Controller Function to Make Revision
export const makeRevison = async (req, res) => {
    const userId = req.userId;
    const { projectId } = req.params;
    try {
        const { message } = req.body;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!userId || !user) {
            return sendError(res, 'Unauthorized', 401, "UNAUTHORIZED");
        }
        if (user.credits < 5) {
            return sendError(res, 'Add more credits to make changes', 403, "INSUFFICIENT_CREDITS");
        }
        if (!message || message.trim() === '') {
            return sendError(res, 'Please enter a valid prompt', 400, "VALIDATION_ERROR");
        }
        const currentProject = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: { versions: true }
        });
        if (!currentProject) {
            return sendError(res, 'Project not found', 404, "NOT_FOUND");
        }
        await prisma.$transaction(async (tx) => {
            await tx.conversation.create({
                data: {
                    role: 'user',
                    content: message,
                    projectId
                }
            });
            await tx.user.update({
                where: { id: userId },
                data: { credits: { decrement: 5 } }
            });
            await tx.conversation.create({
                data: {
                    role: 'assistant',
                    content: 'Step 1/4: Understanding your revision request...',
                    projectId
                }
            });
        });
        sendSuccess(res, {
            message: 'Revision started',
            projectId
        });
        void (async () => {
            try {
                const shouldEnhance = shouldEnhancePrompt(message);
                let enhancedPrompt = message.trim();
                if (shouldEnhance) {
                    await prisma.conversation.create({
                        data: {
                            role: 'assistant',
                            content: 'Step 2/4: Enhancing your prompt for better results...',
                            projectId
                        }
                    });
                    enhancedPrompt = await runAICompletion([
                        {
                            role: 'system',
                            content: `
                                You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

                                Enhance this by:
                                1. Being specific about what elements to change
                                2. Mentioning design details (colors, spacing, sizes)
                                3. Clarifying the desired outcome
                                4. Using clear technical terms
                            
                                Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).
                                `
                        },
                        {
                            role: 'user',
                            content: `User's request: "${message}"`
                        }
                    ], { retries: 2, timeoutMs: 60000 }) || message.trim();
                }
                await prisma.conversation.create({
                    data: {
                        role: 'assistant',
                        content: shouldEnhance
                            ? `Enhanced prompt: "${enhancedPrompt}"`
                            : `Step 2/4: Fast mode enabled, skipping enhancement and moving directly to code generation.`,
                        projectId
                    }
                });
                await prisma.conversation.create({
                    data: {
                        role: 'assistant',
                        content: 'Step 3/4: Generating updated website code...',
                        projectId
                    }
                });
                const code = await runAICompletion([
                    {
                        role: 'system',
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
                            `
                    },
                    {
                        role: 'user',
                        content: `Here is the current website code: "${currentProject.current_code}" The user wants this change: "${enhancedPrompt}"`
                    }
                ], { retries: 2, timeoutMs: 90000 }) || '';
                if (!code) {
                    await prisma.conversation.create({
                        data: {
                            role: 'assistant',
                            content: "Unable to generate the code, please try again",
                            projectId
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
                        content: 'Step 4/4: Saving your new version...',
                        projectId
                    }
                });
                const cleanedCode = code.replace(/```[a-z]*\n?/gi, '')
                    .replace(/```$/g, '')
                    .trim();
                const version = await prisma.version.create({
                    data: {
                        code: cleanedCode,
                        description: 'changes made',
                        projectId
                    }
                });
                await prisma.websiteProject.update({
                    where: { id: projectId },
                    data: {
                        current_code: cleanedCode,
                        current_version_index: version.id
                    }
                });
                await prisma.conversation.create({
                    data: {
                        role: 'assistant',
                        content: "Done! I've made the changes to your website. You can now preview it.",
                        projectId
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
                        content: "Revision failed while processing. Credits were refunded. Please try again.",
                        projectId
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
            });
        }
        if (projectId) {
            await prisma.conversation.create({
                data: {
                    role: 'assistant',
                    content: 'I could not apply that revision right now. Please try again.',
                    projectId
                }
            }).catch(() => { });
        }
        console.log(error.code || error.message);
        return sendError(res, "Unable to start revision right now.", 500, "REVISION_START_FAILED", true);
    }
};
// Controller Function to rollback to a specific version
export const rollbackToVersion = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return sendError(res, 'Unauthorized', 401, "UNAUTHORIZED");
        }
        const { projectId, versionId } = req.params;
        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: { versions: true }
        });
        if (!project) {
            return sendError(res, 'Project not found', 404, "NOT_FOUND");
        }
        const version = project.versions.find((version) => version.id === versionId);
        if (!version) {
            return sendError(res, 'Version not found', 404, "NOT_FOUND");
        }
        await prisma.websiteProject.update({
            where: { id: projectId, userId },
            data: {
                current_code: version.code,
                current_version_index: version.id
            }
        });
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I've rolled back your website to the selected version. You can now preview it.",
                projectId
            }
        });
        return sendSuccess(res, { message: 'Version rolled back' });
    }
    catch (error) {
        console.log(error.code || error.message);
        return sendError(res, "Unable to rollback version right now.");
    }
};
// Controller Function to Delete a Project
export const deleteProject = async (req, res) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params;
        await prisma.websiteProject.delete({
            where: { id: projectId, userId },
        });
        return sendSuccess(res, { message: 'Project deleted successfully' });
    }
    catch (error) {
        console.log(error.code || error.message);
        return sendError(res, "Unable to delete project right now.");
    }
};
// Controller for getting project code for preview
export const getProjectPreview = async (req, res) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params;
        if (!userId) {
            return sendError(res, 'Unauthorized', 401, "UNAUTHORIZED");
        }
        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId },
            include: { versions: true }
        });
        if (!project) {
            return sendError(res, 'Project not found', 404, "NOT_FOUND");
        }
        return sendSuccess(res, { project });
    }
    catch (error) {
        console.log(error.code || error.message);
        return sendError(res, "Unable to load preview right now.");
    }
};
// Get published projects
export const getPublishedProjects = async (req, res) => {
    try {
        const projects = await prisma.websiteProject.findMany({
            where: { isPublished: true },
            include: { user: true }
        });
        return sendSuccess(res, { projects });
    }
    catch (error) {
        console.log(error.code || error.message);
        return sendError(res, "Unable to load published projects right now.");
    }
};
// Get a single project by Id
export const getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId },
        });
        if (!project || project.isPublished === false || !project?.current_code) {
            return sendError(res, 'Project not found', 404, "NOT_FOUND");
        }
        return sendSuccess(res, { code: project.current_code });
    }
    catch (error) {
        console.log(error.code || error.message);
        return sendError(res, "Unable to load project code right now.");
    }
};
// Controller to save project code
export const saveProjectCode = async (req, res) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params;
        const { code } = req.body;
        if (!userId) {
            return sendError(res, 'Unauthorized', 401, "UNAUTHORIZED");
        }
        if (!code) {
            return sendError(res, 'Code is required', 400, "VALIDATION_ERROR");
        }
        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId }
        });
        if (!project) {
            return sendError(res, 'Project not found', 404, "NOT_FOUND");
        }
        await prisma.websiteProject.update({
            where: { id: projectId },
            data: { current_code: code, current_version_index: '' }
        });
        return sendSuccess(res, { message: 'Project saved successfully' });
    }
    catch (error) {
        console.log(error.code || error.message);
        return sendError(res, "Unable to save project right now.");
    }
};
