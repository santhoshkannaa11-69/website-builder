import { createAuthClient } from "better-auth/react"
import { apiBaseUrl } from "@/configs/api-base"

export const authClient = createAuthClient({
    baseURL: apiBaseUrl,
    fetchOptions: {credentials: 'include'},
})

export const { signIn, signUp, useSession } = authClient;
