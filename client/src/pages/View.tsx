    import { useParams } from "react-router-dom";
    import { Loader2Icon } from "lucide-react";
    import ProjectPreview from "../components/ProjectPreview";
    import type { Project } from "../types";
    import { useEffect, useState } from "react";
    import api from "@/configs/axios";
    import { toast } from "sonner";
    import { getApiErrorMessage } from "@/lib/ui-messages";




    const View = () => {

        const { projectID } = useParams();
        const [code, setCode] = useState('')
        const [loading, setLoading] = useState(true)

        useEffect(()=> {
            let isActive = true;

            const fetchCode = async () => {
                try {
                    const { data } = await api.get(`/api/project/published/${projectID}`);

                    if (!isActive) {
                        return;
                    }

                    setCode(data.code)
                } catch (error: unknown) {
                    if (isActive) {
                        toast.error(getApiErrorMessage(error, "Unable to load this project preview right now."));
                    }
                } finally {
                    if (isActive) {
                        setLoading(false)
                    }
                }
            };

            void fetchCode()

            return () => {
                isActive = false;
            };
        },[projectID])

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
