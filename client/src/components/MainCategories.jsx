import { Link, useNavigate } from "react-router-dom"

// Componente PuzzleCard para crear tarjetas con forma de piezas de rompecabezas
const PuzzleCard = ({ children, pieceBg, pageBg, className, onClick }) => {
  return (
    <div 
      className={`puzzle-piece relative ${pieceBg} rounded-lg p-6 shadow-md transition-all duration-300 hover:shadow-lg ${className}`}
      onClick={onClick}
    >
      {/* Contenido de la tarjeta */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Pestañas de rompecabezas en los cuatro lados */}
      <div className={`puzzle-tab puzzle-tab-top ${pieceBg}`}></div>
      <div className={`puzzle-tab puzzle-tab-right ${pageBg}`}></div>
      <div className={`puzzle-tab puzzle-tab-bottom ${pieceBg}`}></div>
      <div className={`puzzle-tab puzzle-tab-left ${pageBg}`}></div>
    </div>
  );
};

const MainCategories = () => {
  const navigate = useNavigate();

  // Función para manejar el clic en una categoría
  const handleCategoryClick = (categoryLink) => {
    navigate(categoryLink);
    // Desplazar al inicio de la página
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Datos para las categorías
  const categories = [
    {
      id: 1,
      title: "Child Health",
      icon: "fas fa-child",
      description: "Latest updates on children's health issues and well-being",
      link: "/posts?cat=child-health",
      color: "bg-blue-600 text-white",
      hoverColor: "hover:bg-blue-700"
    },
    {
      id: 2,
      title: "Vaccination Updates",
      icon: "fas fa-syringe",
      description: "Information on new vaccines and immunization schedules",
      link: "/posts?cat=vaccination",
      color: "bg-green-600 text-white",
      hoverColor: "hover:bg-green-700"
    },
    {
      id: 3,
      title: "Nutrition",
      icon: "fas fa-apple-alt",
      description: "Healthy eating tips and dietary guidance for growing children",
      link: "/posts?cat=nutrition",
      color: "bg-orange-500 text-white",
      hoverColor: "hover:bg-orange-600"
    },
    {
      id: 4,
      title: "Safety Tips",
      icon: "fas fa-shield-alt",
      description: "Keeping your children safe at home and outdoors",
      link: "/posts?cat=safety",
      color: "bg-red-600 text-white",
      hoverColor: "hover:bg-red-700"
    },
    {
      id: 5,
      title: "Hospital Events",
      icon: "fas fa-calendar-alt",
      description: "Upcoming workshops, screenings, and community activities",
      link: "/posts?cat=events",
      color: "bg-purple-600 text-white",
      hoverColor: "hover:bg-purple-700"
    }
  ];

  return (
    <div className="my-12">
      {/* Título de la sección */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-800">Health Topics</h2>
        <p className="text-gray-600 mt-2">Stay informed on important children's health issues</p>
      </div>

      {/* Cuadrícula de categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-10 bg-gray-100 p-10 rounded-xl">
        {categories.map((category) => (
          <div key={category.id} className="block transform transition-transform hover:-translate-y-2">
            <PuzzleCard 
              pieceBg={category.color} 
              pageBg="bg-gray-100"
              className={`h-full ${category.hoverColor} cursor-pointer`}
              onClick={() => handleCategoryClick(category.link)}
            >
              {/* Icono grande con animación de moneda */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center icon-coin-flip">
                  <i className={`${category.icon} text-2xl`}></i>
                </div>
              </div>
              
              {/* Título */}
              <h3 className="text-lg font-semibold text-center mb-2">{category.title}</h3>
              
              {/* Descripción */}
              <p className="text-sm text-center opacity-90">{category.description}</p>
            </PuzzleCard>
          </div>
        ))}
      </div>
      
      {/* Estilos CSS para las piezas de rompecabezas y la animación de moneda */}
      <style jsx>{`
        .puzzle-piece {
          position: relative;
          overflow: visible;
        }
        
        .puzzle-tab {
          position: absolute;
          z-index: 5;
        }
        
        .puzzle-tab-top {
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        
        .puzzle-tab-right {
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        
        .puzzle-tab-bottom {
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        
        .puzzle-tab-left {
          left: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        
        /* Animación de moneda para los iconos */
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
      `}</style>
    </div>
  );
};

export default MainCategories;