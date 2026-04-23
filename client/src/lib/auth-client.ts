import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_BASEURL || 'https://web-wizard-liard.vercel.app',
    fetchOptions: {credentials: 'include'},
})

export const { signIn, signUp, useSession } = authClient;