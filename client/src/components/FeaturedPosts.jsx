import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FeaturedPosts = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Datos de ejemplo para el carrusel
  const slides = [
    {
      id: 1,
      title: "New Pediatric Wing Now Open",
      description: "Our state-of-the-art pediatric wing is now accepting patients, featuring the latest medical technology and child-friendly environments.",
      imageUrl: "https://readdy.ai/api/search-image?query=modern%20hospital%20pediatric%20wing%20with%20colorful%20walls%2C%20child-friendly%20environment%2C%20medical%20staff%20caring%20for%20children%2C%20bright%20and%20welcoming%20atmosphere%2C%20natural%20lighting%20through%20large%20windows%2C%20medical%20equipment&width=1200&height=600&seq=1&orientation=landscape",
    },
    {
      id: 2,
      title: "COVID-19 Vaccination for Children",
      description: "Learn about the latest guidelines and availability of COVID-19 vaccines for children ages 5 and up.",
      imageUrl: "https://readdy.ai/api/search-image?query=healthcare%20professional%20administering%20vaccine%20to%20a%20child%20with%20parent%20nearby%2C%20clean%20medical%20environment%2C%20gentle%20and%20caring%20interaction%2C%20soft%20lighting%2C%20medical%20facility%20with%20colorful%20details&width=1200&height=600&seq=2&orientation=landscape",
    },
    {
      id: 3,
      title: "Summer Safety Tips for Families",
      description: "Keep your children safe this summer with our comprehensive guide to water safety, sun protection, and outdoor activities.",
      imageUrl: "https://readdy.ai/api/search-image?query=family%20enjoying%20summer%20outdoors%20safely%2C%20children%20wearing%20sun%20hats%20and%20sunscreen%2C%20parents%20supervising%20water%20activities%2C%20bright%20sunny%20day%2C%20green%20park%20environment%2C%20safe%20play%20equipment&width=1200&height=600&seq=3&orientation=landscape",
    },
  ];

  // Cambiar automáticamente las diapositivas cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  // Función para cambiar manualmente la diapositiva
  const handleSlideChange = (index) => {
    setActiveSlide(index);
  };

  // Función para avanzar a la siguiente diapositiva al hacer clic en la imagen
  const handleImageClick = () => {
    setActiveSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  return (
    <div className="relative rounded-lg overflow-hidden shadow-md">
      {/* Carrusel */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden cursor-pointer" onClick={handleImageClick}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="relative h-full">
              {/* Imagen de fondo */}
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay con gradiente */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent"></div>
              
              {/* Contenido de texto */}
              <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16 text-white max-w-2xl">
                <h2 className="text-2xl md:text-4xl font-bold mb-4">{slide.title}</h2>
                <p className="text-sm md:text-base mb-6">{slide.description}</p>
                <Link 
                  to={`/post/${slide.id}`} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md inline-block w-fit"
                  onClick={(e) => e.stopPropagation()} // Evita que el clic en el botón active el cambio de diapositiva
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Indicadores de diapositivas */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              handleSlideChange(index);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === activeSlide ? 'bg-blue-600 w-6' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedPosts;