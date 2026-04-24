import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project, Version } from "../types";
import api from "@/configs/axios";
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client";
import { getApiErrorMessage, statusCopy } from "@/lib/ui-messages";


const Preview = () => {

    const {data: session, isPending} = authClient.useSession()
    const { projectID, versionID } = useParams()
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(()=> {
        let isActive = true;

        const fetchCode = async () => {
            try {
                const { data } = await api.get(`/api/project/preview/${projectID}`)
                const versionCode = versionID
                    ? (data.project.versions as Version[]).find((version) => version.id === versionID)?.code
                    : undefined;

                if (!isActive) {
                    return;
                }

                setCode(versionCode || data.project.current_code || '');
            } catch (error: unknown) {
                if (isActive) {
                    toast.error(getApiErrorMessage(error, "Unable to load this preview right now."));
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        };

        if(!isPending && session?.user){
            void fetchCode()
        } else if (!isPending && !session?.user) {
            setLoading(false)
            toast(statusCopy.loginRequired)
            navigate("/")
        }

        return () => {
            isActive = false;
        };
    },[session?.user, isPending, projectID, versionID, navigate])

    if(loading){
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2Icon className="size-7 animate-spin text-indigo-200" />
            </div>
        )
    }

    if(!code){
        return (
            <div className="flex items-center justify-center h-screen text-white">
                Preview could not be loaded.
            </div>
        )
    }

    return (
        <div className="h-screen">
            <ProjectPreview project={{current_code: code} as Project} isGenerating={false} showEditorPanel={false} />
        </div>
    )
}

export default Preview
