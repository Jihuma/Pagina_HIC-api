import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#64599a] text-white py-6">
      <div className="container mx-auto px-4">
        {/* Sección simplificada del footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo e información mínima */}
          <div className="flex items-center mb-4 md:mb-0">
            <img 
              src="/blanco-1.png" 
              alt="Hospital Infantil de Chihuahua" 
              className="h-12 mr-3" 
            />
          </div>
          
          {/* Redes sociales con estilo redondeado y animaciones */}
          <div className="flex space-x-3 bg-gray-700 rounded-full px-5 py-2">
            <a href="#" className="text-sm flex items-center justify-center w-6 h-6 transition-transform duration-300 hover:scale-110 hover:bg-[#3b5998] rounded-md">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-sm flex items-center justify-center w-6 h-6 transition-transform duration-300 hover:scale-110 hover:bg-[#1DA1F2] rounded-md">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-sm flex items-center justify-center w-6 h-6 transition-transform duration-300 hover:scale-110 hover:bg-[#FF0000] rounded-md">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="#" className="text-sm flex items-center justify-center w-6 h-6 transition-transform duration-300 hover:scale-110 hover:bg-[#E1306C] rounded-md">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Pie de página simplificado */}
      <div className="container mx-auto px-4 mt-4 pt-4 border-t bg-[#64599a]">
        <div className="text-center">
          <p className="text-sm">© 2023 Hospital Infantil. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;