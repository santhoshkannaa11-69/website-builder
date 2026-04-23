
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Projects from "./pages/Projects";
import MyProjects from "./pages/Myprojects";
import Preview from "./pages/Preview";
import Community from "./pages/Community";
import View from "./pages/View";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/auth/AuthPage";
import { Toaster } from "sonner";
import Settings from "./pages/Settings";
import Loading from "./pages/Loading";

const App = () => {

  const { pathname } = useLocation()

  const hidenavbar = pathname.startsWith('/projects/') && pathname !== '/projects'
                      || pathname.startsWith('/view')
                      || pathname.startsWith('/preview')

  return (
    <div>
      <Toaster position="top-center" richColors />
      {!hidenavbar && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/pricing' element={<Pricing />} />
        <Route path='/projects/:projectID' element={<Projects />} />
        <Route path='/projects' element={<MyProjects />} />
        <Route path='/preview/:projectID' element={<Preview />} />
        <Route path='/preview/:projectID/:versionID' element={<Preview />} />
        <Route path='/community' element={<Community />} />
        <Route path='/view/:projectID' element={<View />} />
        <Route path="/auth/:pathname" element={<AuthPage />} />
        <Route path="/account/settings" element={<Settings />} />
        <Route path="/loading" element={<Loading   />} />
      </Routes>
    </div>
  )
}

export default App
