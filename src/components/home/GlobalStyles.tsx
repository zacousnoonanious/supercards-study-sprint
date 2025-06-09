
import React from 'react';

export const GlobalStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-15px); 
          }
        }
        
        @keyframes floatSlow {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-10px) rotate(2deg); 
          }
        }
        
        @keyframes floatCards {
          0%, 100% { 
            transform: translateY(0px) rotateY(0deg); 
          }
          25% { 
            transform: translateY(-8px) rotateY(5deg); 
          }
          50% { 
            transform: translateY(-12px) rotateY(0deg); 
          }
          75% { 
            transform: translateY(-8px) rotateY(-5deg); 
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: floatSlow 4s ease-in-out infinite;
        }
        
        .animate-float-cards {
          animation: floatCards 5s ease-in-out infinite;
        }
        
        .hover-scale {
          transition: transform 0.2s ease;
        }
        
        .hover-scale:hover {
          transform: scale(1.05);
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Parallax smooth scrolling */
        .parallax-element {
          will-change: transform;
          transform: translateZ(0);
        }
      `
    }} />
  );
};
