    import { useParams } from "react-router-dom";
    import { Loader2Icon } from "lucide-react";
    import ProjectPreview from "../components/ProjectPreview";
    import type { Project } from "../types";
    import { useEffect, useState, useCallback } from "react";
    import api from "@/configs/axios";
    import { toast } from "sonner";




    const View = () => {

        const { projectID } = useParams();
        const [code, setCode] = useState('')
        const [loading, setLoading] = useState(true)

        const fetchCode = useCallback(async () => {
            try {
                const { data } = await api.get(`/api/project/published/${projectID}`);
                setCode(data.code)
                setLoading(false)
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                toast.error(errorMessage);
                console.log(error);
            }
        }, [projectID])

        useEffect(()=> {
            fetchCode()
        },[fetchCode])

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
                    Project preview could not be loaded.
                </div>
            )
        }

        return (
            <div className="h-screen">
                <ProjectPreview project={{current_code: code} as Project} isGenerating={false} showEditorPanel={false} />
            </div>
        )
    }

    export default View
