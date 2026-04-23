import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthView } from "@daveyplate/better-auth-ui";
import { useSession } from "../../lib/auth-client";

export default function AuthPage() {
    const { pathname } = useParams()
    const navigate = useNavigate()
    const { data: session, isPending } = useSession()
    const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking")
    const isSignOutRoute = pathname === "sign-out"

    useEffect(() => {
        if (session?.user && !isSignOutRoute) {
            navigate("/", { replace: true })
        }
    }, [isSignOutRoute, navigate, session])

    useEffect(() => {
        const controller = new AbortController()

        const checkServer = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASEURL}/`, {
                    signal: controller.signal,
                })
                setServerStatus(response.ok ? "online" : "offline")
            } catch {
                setServerStatus("offline")
            }
        }

        void checkServer()

        return () => controller.abort()
    }, [])

    if (isPending) {
        return (
            <main className="p-6 flex flex-col justify-center items-center h-[80vh] text-white">
                <div className="w-full max-w-md rounded-2xl border border-indigo-900/60 bg-black/20 p-8 text-center">
                    Checking your session...
                </div>
            </main>
        )
    }

    if (session?.user && !isSignOutRoute) {
        return (
            <main className="p-6 flex flex-col justify-center items-center h-[80vh] text-white">
                <div className="w-full max-w-md rounded-2xl border border-emerald-900/60 bg-emerald-500/10 p-8 text-center">
                    Signed in successfully. Redirecting...
                </div>
            </main>
        )
    }

    return (
        <main className="p-6 flex flex-col justify-center items-center h-[80vh]">
            {serverStatus === "offline" && (
                <div className="mb-4 w-full max-w-md rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                    Auth server is not running. Start the backend in the <code>server</code> folder with <code>npm run start</code>, then try sign-in or sign-up again.
                </div>
            )}
            <AuthView pathname={pathname} classNames={{base: 'bg-black/10 ring ring-indigo-900'}}/>
        </main>
    )
}
