import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
    SignedIn,
    SignedOut, 
    UserButton 
} from "@clerk/clerk-react";
import Search from "./Search";

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('es-ES', options);
    
    // Obtener la ubicación actual para verificar la ruta
    const location = useLocation();
    const isPostListPage = location.pathname === "/posts";

    return (
        <header className="bg-white shadow-md">
            {/* Top Bar */}
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="text-sm text-gray-600">
                        <span className="mr-4">{formattedDate}</span>
                    </div>
                    <div className="text-sm font-semibold text-red-600">
                        <i className="fas fa-phone-alt mr-2"></i>
                        Emergency: (800) 555-1234
                    </div>
                </div>
                
                {/* Main Header - Estructura reorganizada para móvil */}
                <div className="flex justify-between items-center py-4 relative">
                    {/* Mobile Menu Button - Ahora a la izquierda */}
                    <div className="md:hidden order-1">
                        <button 
                            onClick={() => setOpen(!open)} 
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            {open ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                    
                    {/* Logo - Centrado en móvil */}
                    <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center md:order-1 order-2 absolute md:relative left-1/2 md:left-0 transform -translate-x-1/2 md:transform-none">
                        <img 
                            src="/LogoOficial_HIC.png" 
                            alt="Hospital Infantil de Chihuahua" 
                            className="h-12 mr-2" 
                        />
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8 order-2">
                        <Link to="/" className="font-medium hover:text-blue-600">Home</Link>
                        <Link to="/news" className="font-medium hover:text-blue-600">News</Link>
                        <Link to="/health-tips" className="font-medium hover:text-blue-600">Health Tips</Link>
                        <Link to="/departments" className="font-medium hover:text-blue-600">Departments</Link>
                        <Link to="/contact" className="font-medium hover:text-blue-600">Contact</Link>
                    </nav>
                    
                    {/* Search and User - A la derecha en móvil */}
                    <div className="flex items-center space-x-4 order-3">
                        {!isPostListPage ? (
                            <div className="hidden lg:block">
                                <Search />
                            </div>
                        ) : (
                            <div className="hidden lg:block" style={{ width: '225px', height: '40px' }}></div>
                        )}
                        <SignedOut>
                            <Link to="/login">
                                <button className="py-2 px-4 rounded-3xl bg-blue-800 text-white">Login</button>
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>
                </div>
            </div>
            
            {/* Mobile Menu */}
            {open && (
                <div className="md:hidden bg-white border-t border-gray-100 py-4">
                    <div className="container mx-auto px-4 flex flex-col space-y-4">
                        <Link to="/" className="font-medium hover:text-blue-600">Home</Link>
                        <Link to="/news" className="font-medium hover:text-blue-600">News</Link>
                        <Link to="/health-tips" className="font-medium hover:text-blue-600">Health Tips</Link>
                        <Link to="/departments" className="font-medium hover:text-blue-600">Departments</Link>
                        <Link to="/contact" className="font-medium hover:text-blue-600">Contact</Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;