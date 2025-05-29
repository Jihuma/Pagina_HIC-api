import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
// Cambia esta línea
import Search from "./Search";
// Por esta línea
import SearchExpanded from "./SearchExpanded";
import { Check } from 'lucide-react';

const SideMenu = () => {
  // Estado para el tamaño de la ventana
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  // Estado para el filtro seleccionado
  const [selectedFilter, setSelectedFilter] = useState('newest');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para manejar el cambio de filtro
  const handleFilterChange = (value) => {
    setSelectedFilter(value);
  };

  // Componente PuzzleCard modificado sin las bolitas
  const PuzzleCard = ({ children, pieceBg, pageBg, className }) => {
    return (
      <div className={`puzzle-piece relative ${pieceBg} rounded-lg p-4 shadow-md transition-all duration-300 hover:shadow-lg ${className}`}>
        {/* Contenido de la tarjeta */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  };

  // Datos para las categorías
  const categories = [
    {
      id: 1,
      title: "Child Health",
      icon: "fas fa-child",
      link: "/posts?cat=child-health",
      color: "bg-[#375D9D] text-white", // Pantone 7684
      hoverColor: "hover:bg-[#2A4A80]"
    },
    {
      id: 2,
      title: "Vaccination",
      icon: "fas fa-syringe",
      link: "/posts?cat=vaccination",
      color: "bg-[#77BC1F] text-white", // Pantone 368
      hoverColor: "hover:bg-[#65A01A]"
    },
    {
      id: 3,
      title: "Nutrition",
      icon: "fas fa-apple-alt",
      link: "/posts?cat=nutrition",
      color: "bg-[#E2231A] text-white", // Pantone 485
      hoverColor: "hover:bg-[#C01D15]"
    },
    {
      id: 4,
      title: "Safety Tips",
      icon: "fas fa-shield-alt",
      link: "/posts?cat=safety",
      color: "bg-[#FFD100] text-gray-800", // Pantone 109 (con texto oscuro para mejor contraste)
      hoverColor: "hover:bg-[#E5BC00]"
    },
    {
      id: 5,
      title: "Events",
      icon: "fas fa-calendar-alt",
      link: "/posts?cat=events",
      color: "bg-[#375D9D] text-white", // Pantone 7684 (repetido pero no consecutivo)
      hoverColor: "hover:bg-[#2A4A80]"
    }
  ];

  return (
    <div className='px-4 h-max sticky top-8'>
      {/* Barra de búsqueda con marco */}
      <div className="mt-12 mb-8">
        <div className="border-2 border-blue-200 rounded-lg p-1 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
          <div className="bg-gradient-to-r from-blue-50 to-white rounded-md">
            <SearchExpanded/>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-md p-5 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Filter</h2>
        
        <div className="flex flex-col gap-3 text-sm">
          {[
            { value: 'newest', label: 'Newest' },
            { value: 'popular', label: 'Most Popular' },
            { value: 'trending', label: 'Trending' },
            { value: 'oldest', label: 'Oldest' }
          ].map((filter) => (
            <label 
              key={filter.value} 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleFilterChange(filter.value)}
            >
              <div className="relative">
                <div 
                  className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all duration-300 ${
                    selectedFilter === filter.value 
                      ? 'bg-blue-800 border-blue-800' 
                      : 'border-blue-800 bg-white'
                  }`}
                >
                  {selectedFilter === filter.value && (
                    <Check 
                      size={16} 
                      className="text-white animate-scale-in" 
                      strokeWidth={3}
                    />
                  )}
                </div>
              </div>
              <span className={`transition-colors duration-200 ${selectedFilter === filter.value ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                {filter.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Categorías */}
      <div className="bg-white rounded-md p-5 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Categorías</h2>
        
        <div className="flex flex-col gap-4">
          {categories.map((category) => (
            <Link key={category.id} to={category.link} className="block transform transition-transform hover:-translate-y-1">
              <PuzzleCard 
                pieceBg={category.color} 
                pageBg="bg-white"
                className={`${category.hoverColor}`}
              >
                {/* Icono con animación */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center icon-coin-flip">
                    <i className={`${category.icon} text-sm`}></i>
                  </div>
                  
                  {/* Título */}
                  <h3 className="text-sm font-medium">{category.title}</h3>
                </div>
              </PuzzleCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Estilos CSS para la animación (eliminados los estilos de las pestañas) */}
      <style jsx>{`
        .puzzle-piece {
          position: relative;
        }
        
        /* Animación para los iconos */
        .icon-coin-flip {
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        
        .puzzle-piece:hover .icon-coin-flip {
          transform: rotateY(180deg);
          animation: coinFlip 1.5s infinite;
        }
        
        @keyframes coinFlip {
          0% {
            transform: rotateY(0);
          }
          50% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        @keyframes scale-in {
          0% { transform: scale(0); }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        /* Eliminar el contorno negro al hacer clic */
        input:focus, 
        input:focus-visible {
          outline: none !important;
          box-shadow: none !important;
          border-color: #e5e7eb !important;
        }
      `}</style>
    </div>
  );
};

export default SideMenu;