import "dotenv/config";

let prisma: any;

// Initialize prisma client asynchronously
async function initializePrisma() {
    try {
        // Check if database URL is configured
        if (!process.env.DATABASE_URL) {
            console.warn("DATABASE_URL not found in environment variables. Using in-memory fallback.");
            prisma = createMockPrismaClient();
            return;
        }

        // Dynamic imports for ES modules
        const [{ PrismaPg }, { PrismaClient }] = await Promise.all([
            import("@prisma/adapter-pg"),
            import("../generated/prisma/client.js")
        ]);

        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        prisma = new PrismaClient({ adapter });
    } catch (error) {
        console.error("Failed to connect to database:", error);
        console.warn("Using mock prisma client for development.");
        prisma = createMockPrismaClient();
    }
}

// Initialize immediately
initializePrisma();

// Mock prisma client for development when database is not available
function createMockPrismaClient(): any {
    console.warn("Using mock database - projects will be stored in memory only!");
    
    // Simple in-memory storage for development
    const memoryStore: any = {
        users: [],
        projects: [],
        conversations: [],
        versions: [],
        transactions: []
    };
    
    return {
        user: {
            findUnique: async ({ where }: any) => memoryStore.users.find((u: any) => u.id === where.id || u.email === where.email),
            findMany: async () => memoryStore.users,
            create: async ({ data }: any) => {
                const user = { ...data, id: `user_${Date.now()}`, credits: data.credits || 50 };
                memoryStore.users.push(user);
                return user;
            },
            update: async ({ where, data }: any) => {
                const index = memoryStore.users.findIndex((u: any) => u.id === where.id);
                if (index !== -1) {
                    memoryStore.users[index] = { ...memoryStore.users[index], ...data };
                    return memoryStore.users[index];
                }
                throw new Error('User not found');
            }
        },
        websiteProject: {
            findUnique: async ({ where, include }: any) => {
                const project = memoryStore.projects.find((p: any) => p.id === where.id);
                if (project && include) {
                    const versions = memoryStore.versions.filter((v: any) => v.projectId === where.id);
                    const conversation = memoryStore.conversations.filter((c: any) => c.projectId === where.id);
                    console.log('Mock DB: Found project with', versions.length, 'versions');
                    return {
                        ...project,
                        conversation: conversation.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
                        versions: versions.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
                        user: memoryStore.users.find((u: any) => u.id === project.userId)
                    };
                }
                return project;
            },
            findMany: async ({ where }: any) => {
                if (where?.userId) {
                    return memoryStore.projects.filter((p: any) => p.userId === where.userId);
                }
                if (where?.isPublished) {
                    return memoryStore.projects.filter((p: any) => p.isPublished === true);
                }
                return memoryStore.projects;
            },
            create: async ({ data }: any) => {
                const project = { ...data, id: `project_${Date.now()}`, isPublished: false, current_code: '', current_version_index: '', createdAt: new Date(), updatedAt: new Date() };
                memoryStore.projects.push(project);
                console.log('Mock DB: Project created successfully');
                return project;
            },
            update: async ({ where, data }: any) => {
                const index = memoryStore.projects.findIndex((p: any) => p.id === where.id);
                if (index !== -1) {
                    console.log('Mock DB: Updating project', where.id, 'with data:', data);
                    memoryStore.projects[index] = { ...memoryStore.projects[index], ...data, updatedAt: new Date() };
                    console.log('Mock DB: Project updated successfully');
                    return memoryStore.projects[index];
                }
                console.log('Mock DB: Project not found for update:', where.id);
                throw new Error('Project not found');
            },
            delete: async ({ where }: any) => {
                const index = memoryStore.projects.findIndex((p: any) => p.id === where.id);
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
            create: async ({ data }: any) => {
                const conversation = { ...data, id: `conv_${Date.now()}`, timestamp: new Date() };
                memoryStore.conversations.push(conversation);
                return conversation;
            },
            createMany: async ({ data }: any) => {
                const conversations = data.map((d: any) => ({ ...d, id: `conv_${Date.now()}_${Math.random()}`, timestamp: new Date() }));
                memoryStore.conversations.push(...conversations);
                return { count: conversations.length };
            }
        },
        version: {
            create: async ({ data }: any) => {
                const version = { ...data, id: `ver_${Date.now()}`, timestamp: new Date() };
                memoryStore.versions.push(version);
                return version;
            }
        },
        transaction: {
            create: async ({ data }: any) => {
                const transaction = { ...data, id: `txn_${Date.now()}`, createdAt: new Date() };
                memoryStore.transactions.push(transaction);
                return transaction;
            }
        },
        $transaction: async (callback: any) => {
            // Simple mock transaction - just execute the callback
            return await callback({
                user: prisma.user,
                websiteProject: prisma.websiteProject,
                conversation: prisma.conversation,
                version: prisma.version
            });
        }
    } as any;
}

export default prisma;