import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useState, useEffect } from "react" // Importamos useState y useEffect

const MainLayout = () => {
  // Estado para detectar si se ha hecho scroll
  const [scrolled, setScrolled] = useState(false);

  // Efecto para detectar el scroll y actualizar el estado
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Limpieza del evento al desmontar el componente
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className='min-h-screen bg-gray-50 font-sans'>
        <Navbar/>
        <div 
          className={`relative px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 overflow-hidden transition-all duration-300 ${scrolled ? 'pt-16' : 'pt-24'}`}
        >
            <Outlet/>
        </div>
    </div>
  )
}

export default MainLayout