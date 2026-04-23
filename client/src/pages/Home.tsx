import React, { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import api from "@/configs/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate()
  
  // Use a try-catch to handle authentication errors
  let session, sessionLoading;
  try {
    const sessionData = authClient.useSession()
    session = sessionData.data
    sessionLoading = sessionData.isPending
  } catch (error) {
    console.error('Auth client error:', error)
    session = null
    sessionLoading = false
  }

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false)
    const promptSuggestions = [
      "Build a modern portfolio website for a frontend developer",
      "Create a SaaS landing page for an AI writing tool",
      "Design a restaurant website with menu and reservation section",
    ];

    const onSubmitHandler = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if(!session?.user){
          return toast.error('Please sign in to create a project')
        } else if(!input.trim()){
          return toast.error('Please enter a website prompt')
        }
        setLoading(true)
        const {data} = await api.post('/api/user/project', {initial_prompt: input});
        setLoading(false);
        navigate(`/projects/${data.projectId}`)
      } catch (error: unknown) {
        setLoading(false)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(errorMessage);
        console.log(error);
      }
    
  }

    if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="animate-spin size-8 text-white" />
      </div>
    )
  }

  return (
        
      <section className="flex flex-col items-center text-white text-sm pb-20 px-4 font-poppins">
          
        <a href="https://prebuiltui.com" className="flex items-center gap-2 border border-slate-700 rounded-full p-1 pr-3 text-sm mt-20">
          <span className="bg-indigo-600 text-xs px-3 py-1 rounded-full">NEW</span>
          <p className="flex items-center gap-2">
            <span>Try 30 days free trial option</span>
            <svg className="mt-px" width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m1 1 4 3.5L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </p>
        </a>

        <h1 className="text-center text-[40px] leading-[48px] md:text-6xl md:leading-[70px] mt-4 font-semibold max-w-3xl">
          Turn thoughts into websites instantly, with AI.
        </h1>

        <p className="text-center text-base max-w-md mt-2">
          Create, customize and publish website faster than ever with our AI Website Builder.
        </p>

        <form onSubmit={onSubmitHandler} className="bg-white/10 max-w-2xl w-full rounded-xl p-4 mt-10 border border-indigo-600/70 focus-within:ring-2 ring-indigo-500 transition-all">
          <textarea value={input} onChange={e => setInput(e.target.value)} className="bg-transparent outline-none text-gray-300 resize-none w-full" rows={4} placeholder="Describe the website you want to build (style, sections, audience, tone)..." required />
          <div className="flex flex-wrap gap-2 mt-3">
            {promptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInput(suggestion)}
                className="text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Average generation time: 30-90 seconds depending on complexity.</p>
          <button disabled={loading} className="ml-auto flex items-center gap-2 bg-gradient-to-r from-[#CB52D4] to-indigo-600 rounded-md px-4 py-2 disabled:opacity-70">
            {!loading ? 'Create with AI': (
                <>
                Starting project <Loader2Icon className='animate-spin size-4 text-white' />
                </>
            )}
            
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-16 md:gap-20 mx-auto mt-16">
          <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/framer.svg" alt="" />
          <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/huawei.svg" alt="" />
          <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/instagram.svg" alt="" />
          <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/microsoft.svg" alt="" />
          <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/walmart.svg" alt="" />
        </div>
      </section>

  )
}
    

export default Home
