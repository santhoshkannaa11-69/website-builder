export interface User {
    id: string;
    email: string;
    fullName?: string;
    imageUrl?: string;
    name?: string;
    image?: string;
    credits?: number;
}

export type MessageRole = "user" | "assistant";

export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: string;
    projectId?: string;
}

export interface Version {
    id: string;
    timestamp: string;
    code: string;
    description?: string;
    projectId?: string;
}

export interface PreviewElementStyles {
    padding: string;
    margin: string;
    backgroundColor: string;
    color: string;
    fontSize: string;
}

export interface PreviewElement {
    tagName: string;
    className: string;
    text: string;
    styles: PreviewElementStyles;
}

export interface PreviewElementUpdate {
    text?: string;
    className?: string;
    styles?: Partial<PreviewElementStyles>;
}

export interface Project {
    id: string;
    name: string;
    initial_prompt: string;
    current_code: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    user?: User;
    isPublished?: boolean;
    versionId?: string;
    conversation: Message[];
    versions: Version[];
    current_version_index: string;
}
