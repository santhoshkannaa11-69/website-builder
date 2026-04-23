import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project, Version } from "../types";
import api from "@/configs/axios";
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client";


const Preview = () => {

    const {data: session, isPending} = authClient.useSession()
    const { projectID, versionID } = useParams()
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCode = useCallback(async () => {
    try {
        const { data } = await api.get(`/api/project/preview/${projectID}`)
        setCode(data.project.current_code)
        if(versionID){
            data.project.versions.forEach((version: Version)=>{
                if(version.id === versionID){
                    setCode(version.code)
                }
            })
        } 
        setLoading(false)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(errorMessage);
        console.log(error);
         
    }
    }, [projectID, versionID])

    useEffect(()=> {
        if(!isPending && session?.user){
            fetchCode()
        }
    },[session?.user, isPending, fetchCode])

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
