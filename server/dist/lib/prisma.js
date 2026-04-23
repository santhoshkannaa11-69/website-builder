import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
let prisma;
// Check if database URL is configured
if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not found in environment variables. Using in-memory fallback.");
    // Create a mock prisma client for development
    prisma = createMockPrismaClient();
}
else {
    try {
        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        prisma = new PrismaClient({ adapter });
    }
    catch (error) {
        console.error("Failed to connect to database:", error);
        console.warn("Using mock prisma client for development.");
        prisma = createMockPrismaClient();
    }
}
// Mock prisma client for development when database is not available
function createMockPrismaClient() {
    console.warn("Using mock database - projects will be stored in memory only!");
    // Simple in-memory storage for development
    const memoryStore = {
        users: [],
        projects: [],
        conversations: [],
        versions: [],
        transactions: []
    };
    return {
        user: {
            findUnique: async ({ where }) => memoryStore.users.find((u) => u.id === where.id || u.email === where.email),
            findMany: async () => memoryStore.users,
            create: async ({ data }) => {
                const user = { ...data, id: `user_${Date.now()}`, credits: data.credits || 50 };
                memoryStore.users.push(user);
                return user;
            },
            update: async ({ where, data }) => {
                const index = memoryStore.users.findIndex((u) => u.id === where.id);
                if (index !== -1) {
                    memoryStore.users[index] = { ...memoryStore.users[index], ...data };
                    return memoryStore.users[index];
                }
                throw new Error('User not found');
            }
        },
        websiteProject: {
            findUnique: async ({ where, include }) => {
                const project = memoryStore.projects.find((p) => p.id === where.id);
                if (project && include) {
                    const versions = memoryStore.versions.filter((v) => v.projectId === where.id);
                    const conversation = memoryStore.conversations.filter((c) => c.projectId === where.id);
                    console.log('Mock DB: Found project with', versions.length, 'versions');
                    return {
                        ...project,
                        conversation: conversation.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
                        versions: versions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
                        user: memoryStore.users.find((u) => u.id === project.userId)
                    };
                }
                return project;
            },
            findMany: async ({ where }) => {
                if (where?.userId) {
                    return memoryStore.projects.filter((p) => p.userId === where.userId);
                }
                if (where?.isPublished) {
                    return memoryStore.projects.filter((p) => p.isPublished === true);
                }
                return memoryStore.projects;
            },
            create: async ({ data }) => {
                const project = { ...data, id: `project_${Date.now()}`, isPublished: false, current_code: '', current_version_index: '', createdAt: new Date(), updatedAt: new Date() };
                memoryStore.projects.push(project);
                console.log('Mock DB: Project created successfully');
                return project;
            },
            update: async ({ where, data }) => {
                const index = memoryStore.projects.findIndex((p) => p.id === where.id);
                if (index !== -1) {
                    console.log('Mock DB: Updating project', where.id, 'with data:', data);
                    memoryStore.projects[index] = { ...memoryStore.projects[index], ...data, updatedAt: new Date() };
                    console.log('Mock DB: Project updated successfully');
                    return memoryStore.projects[index];
                }
                console.log('Mock DB: Project not found for update:', where.id);
                throw new Error('Project not found');
            },
            delete: async ({ where }) => {
                const index = memoryStore.projects.findIndex((p) => p.id === where.id);
                if (index !== -1) {
                    const deleted = memoryStore.projects[index];
                    memoryStore.projects.splice(index, 1);
                    console.log('Mock DB: Project deleted successfully');
                    return deleted;
                }
                throw new Error('Project not found');
            }
        },
        conversation: {
            create: async ({ data }) => {
                const conversation = { ...data, id: `conv_${Date.now()}`, timestamp: new Date() };
                memoryStore.conversations.push(conversation);
                return conversation;
            },
            createMany: async ({ data }) => {
                const conversations = data.map((d) => ({ ...d, id: `conv_${Date.now()}_${Math.random()}`, timestamp: new Date() }));
                memoryStore.conversations.push(...conversations);
                return { count: conversations.length };
            }
        },
        version: {
            create: async ({ data }) => {
                const version = { ...data, id: `ver_${Date.now()}`, timestamp: new Date() };
                memoryStore.versions.push(version);
                return version;
            }
        },
        transaction: {
            create: async ({ data }) => {
                const transaction = { ...data, id: `txn_${Date.now()}`, createdAt: new Date() };
                memoryStore.transactions.push(transaction);
                return transaction;
            }
        },
        $transaction: async (callback) => {
            // Simple mock transaction - just execute the callback
            return await callback({
                user: prisma.user,
                websiteProject: prisma.websiteProject,
                conversation: prisma.conversation,
                version: prisma.version
            });
        }
    };
}
export default prisma;
//# sourceMappingURL=prisma.js.map