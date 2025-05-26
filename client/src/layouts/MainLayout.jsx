import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"

const MainLayout = () => {
  return (
    <div className='min-h-screen bg-gray-50 font-sans'>
        <Navbar/>
        <div className='relative px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 overflow-hidden'>
            <Outlet/>
        </div>
    </div>
  )
}

export default MainLayout