import openai from "../configs/openai.js";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const runAICompletion = async (messages, options = {}) => {
    const model = options.model || "z-ai/glm-4.5-air:free";
    const retries = options.retries ?? 2;
    const timeoutMs = options.timeoutMs ?? 90000;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await Promise.race([
                openai.chat.completions.create({
                    model,
                    messages,
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("AI request timed out")), timeoutMs)),
            ]);
            const content = response?.choices?.[0]?.message?.content?.trim?.() || "";
            return content;
        }
        catch (error) {
            if (attempt === retries) {
                throw error;
            }
            const backoffMs = 800 * (attempt + 1);
            await sleep(backoffMs);
        }
    }
    return "";
};
