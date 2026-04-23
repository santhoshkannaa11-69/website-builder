import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import { authClient } from "./lib/auth-client"
import { useNavigate, NavLink } from "react-router-dom"
import type React from "react"
import { toast as showToast } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate()

    const renderAuthToast = ({
        variant = "default",
        message,
    }: {
        variant?: "default" | "success" | "error" | "info" | "warning"
        message?: string
    }) => {
        const safeMessage = message ?? "Something went wrong."
        const friendlyMessage = /failed to fetch|network request failed/i.test(safeMessage)
            ? "Auth server is offline. Start the server on http://localhost:3000 and try again."
            : safeMessage

        if (variant === "default") {
            showToast(friendlyMessage)
            return
        }

        showToast[variant](friendlyMessage)
    }

    return (
        <AuthUIProvider
        authClient={authClient}
        redirectTo="/"
        navigate={navigate}
        toast={renderAuthToast}
        Link={(props)=> <NavLink {...props} to={props.href}/>}
        >
            {children}
        </AuthUIProvider>
    )
}
