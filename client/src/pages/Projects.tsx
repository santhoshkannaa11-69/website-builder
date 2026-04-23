import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Project } from "../types";
import { ArrowBigDownDashIcon, EyeIcon, EyeOffIcon, FullscreenIcon, LaptopIcon, Loader2Icon, MessageSquareCodeIcon, SaveIcon, SmartphoneIcon, TabletIcon, XIcon } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ProjectPreview, { type ProjectPreviewRef } from "../components/ProjectPreview";
import api from "@/configs/axios";
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client";
import { getApiErrorMessage, statusCopy } from "@/lib/ui-messages";

const Projects = () => {

    const {projectID} = useParams()
    const navigate = useNavigate()
    const {data: session, isPending} = authClient.useSession()

    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)

    const [isGenerating, setIsGenerating] = useState(true)
    const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>("desktop")

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const previewRef = useRef<ProjectPreviewRef>(null)

    const isTerminalAssistantStatus = (status?: string) => {
        const content = status?.toLowerCase() || "";
        return (
            content.includes("done!") ||
            content.includes("you can now preview it") ||
            content.includes("failed") ||
            content.includes("unable to generate") ||
            content.includes("credits were refunded")
        );
    }

    const fetchProject = useCallback(async () => {
        try {
            const { data } = await api.get(`/api/user/project/${projectID}`)
            const fetchedProject = data.project as Project
            setProject(fetchedProject)

            const latestAssistantStatus = fetchedProject.conversation
                ?.filter((message) => message.role === "assistant")
                .at(-1)?.content;

            const hasCode = Boolean(fetchedProject.current_code);
            const reachedTerminalState = isTerminalAssistantStatus(latestAssistantStatus);
            setIsGenerating(!hasCode && !reachedTerminalState)
            setLoading(false)
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Unable to load project right now"));
            console.log(error);
        }
    }, [projectID])

    const saveProject = async () => {
        if(!previewRef.current) return;
        const code = previewRef.current.getCode();
        if(!code) return;
        setIsSaving(true);
        try {
            const { data } = await api.post(`/api/project/save/${projectID}`, {code});
            toast.success(data.message)
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error(errorMessage);
            console.log(error);
        } finally {
            setIsSaving(false);
        }
    }
    
      // download code (index.html)
    const downloadCode = () => {
        const code = previewRef.current?.getCode() || project?.current_code;
        if(!code){
            if(isGenerating){
                return
            }
            return
        }
        const element = document.createElement('a');
        const file = new Blob([code], {type: "text/html"});
        const url = URL.createObjectURL(file);
        element.href = url
        element.download = "index.html"
        document.body.appendChild(element)
        element.click();
        element.remove();
        URL.revokeObjectURL(url);
    }
    
    const togglePublish = async () => {
        try {
            const { data } = await api.post(`/api/user/publish-toggle/${projectID}`);
            toast.success(data.message)
            setProject((prev) => prev ? ({...prev, isPublished: !prev.isPublished}) : null)
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error(errorMessage);
            console.log(error);
        }
    }

    useEffect(()=> {
        if(session?.user){
            fetchProject();
        } else if(!isPending && !session?.user) {
            navigate("/")
            toast(statusCopy.loginRequired) 
        }
    },[session?.user, isPending, fetchProject, navigate])


    useEffect(()=> {
       if(project && (!project.current_code || isGenerating)) {
        const intervalId = setInterval(fetchProject, 2000);
        return ()=> clearInterval(intervalId)
       }
    },[project, fetchProject, isGenerating])

    if(loading){
        return (
            <>
            <div className="flex items-center justify-center h-screen">
                <Loader2Icon className="size-7 animate-spin text-violet-200" />
            </div>
            </>
        )
    }

    const latestAssistantStatus = project?.conversation
        ?.filter((message) => message.role === "assistant")
        .at(-1)?.content;

    return project ? (
        <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
            {isGenerating && (
                <div className="px-4 py-2 text-sm bg-indigo-500/15 border-b border-indigo-500/30 flex items-center gap-2">
                    <Loader2Icon className="size-4 animate-spin text-indigo-300" />
                    <span>{latestAssistantStatus || statusCopy.generationInProgress}</span>
                </div>
            )}
            {/* Builder Navbar */}
            <div className="flex max-sm:flex-col sm:items-center gap-4 px-4 py-2 no-scrollbar">
                {/* Left */}
                <div className="flex items-center gap-2 sm:min-w-90 text-nowrap">
                    <img src="/favicon.svg" alt="logo"
                    className="h-6 cursor-pointer"
                    onClick={()=> navigate('/')} />
                    <div className="max-w-64 sm:max-w-xs">
                        <p className="text-sm text-medium capitalize truncate">{project.name}</p>
                        <p className="text-xs text-gray-400 -mt-0.5">Previewing last saved version</p>
                    </div>
                    <div className="sm:hidden flex-1 flex justify-end">
                        {isMenuOpen ? <MessageSquareCodeIcon onClick={()=> setIsMenuOpen(false)} className="size-6 cursor-pointer" />
                        : <XIcon onClick={()=> setIsMenuOpen(true)} className="size-6 cursor-pointer" />}
                    </div>
                </div>
                {/* Middle */}
                <div className="hidden sm:flex gap-2 bg-gray-950 p-1.5 rounded-md">
                    <SmartphoneIcon onClick={()=> setDevice('phone')} 
                    className={`size-6 p-1 rounded cursor-pointer ${device === 'phone' ? "bg-gray-700" : ""}`} />

                    <TabletIcon onClick={()=> setDevice('tablet')} 
                    className={`size-6 p-1 rounded cursor-pointer ${device === 'tablet' ? "bg-gray-700" : ""}`} />

                    <LaptopIcon onClick={()=> setDevice('desktop')} 
                    className={`size-6 p-1 rounded cursor-pointer ${device === 'desktop' ? "bg-gray-700" : ""}`} />
                </div>
                {/* Right */}
                <div className="flex items-center justify-end gap-3 flex-1 text-xs sm:text-sm">
                    <button onClick={saveProject} disabled={isSaving} className="max-sm:hidden bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors border border-gray-700">
                        {isSaving ? <Loader2Icon className="animate-spin" size={16} /> :
                        <SaveIcon size={16} />} Save
                    </button>
                    <Link className="flex items-center gap-2 px-4 py-1 rounded sm:rounded-sm border border-gray-700 hover:border-gray-500 transition-colors" target="_blank" to={`/preview/${projectID}`}>
                        <FullscreenIcon size={16} /> Preview
                    </Link>
                    <button onClick={downloadCode} className="bg-linear-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors">
                        <ArrowBigDownDashIcon size={16} /> Download
                    </button>
                    <button onClick={togglePublish} className="bg-linear-to-br from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors">
                        {project.isPublished ?
                        <EyeOffIcon size={16} /> : <EyeIcon size={16} />
                        }
                        {project.isPublished ? "Unpublish" : "Publish"}
                    </button>
                </div>
            </div>
            <div className="flex-1 flex overflow-auto">
                <Sidebar isMenuOpen={isMenuOpen} project={project} setProject={setProject} isGenerating={isGenerating} setIsGenerating={setIsGenerating} />
                <div className="flex-1 p-2 pl-0">
                    <ProjectPreview ref={previewRef} project={project} isGenerating={isGenerating} aiStatus={latestAssistantStatus} device={device}/>
                    
                </div>
            </div>
        </div>
    )
    : (
        <div className="flex items-center justify-center h-screen">
            <p className="text-2xl font-medium text-gray-200">
                Unable to load project!
            </p>
        </div>
    )
}

export default Projects
