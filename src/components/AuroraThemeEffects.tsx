
import React from 'react';

export const AuroraThemeEffects = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        {/* Floating gradient orbs with parallax movement */}
        <div 
          className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse parallax-element"
          style={{ 
            animationDelay: '0s', 
            animationDuration: '6s',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        ></div>
        <div 
          className="absolute top-40 right-32 w-96 h-96 bg-accent/8 rounded-full blur-3xl animate-pulse parallax-element"
          style={{ 
            animationDelay: '2s', 
            animationDuration: '8s',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        ></div>
        <div 
          className="absolute bottom-32 left-32 w-80 h-80 bg-secondary/12 rounded-full blur-3xl animate-pulse parallax-element"
          style={{ 
            animationDelay: '1s', 
            animationDuration: '7s',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        ></div>
        <div 
          className="absolute bottom-20 right-20 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse parallax-element"
          style={{ 
            animationDelay: '3s', 
            animationDuration: '5s',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 w-56 h-56 bg-accent/6 rounded-full blur-3xl animate-pulse parallax-element"
          style={{ 
            animationDelay: '4s', 
            animationDuration: '9s',
            transform: 'translate(-50%, -50%) translateZ(0)',
            willChange: 'transform'
          }}
        ></div>
        
        {/* Additional smaller orbs for depth */}
        <div 
          className="absolute top-60 right-60 w-40 h-40 bg-primary/6 rounded-full blur-2xl animate-pulse parallax-element"
          style={{ 
            animationDelay: '1.5s', 
            animationDuration: '4s',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        ></div>
        <div 
          className="absolute bottom-60 left-60 w-48 h-48 bg-accent/7 rounded-full blur-2xl animate-pulse parallax-element"
          style={{ 
            animationDelay: '2.5s', 
            animationDuration: '6s',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        ></div>
      </div>
    </div>
  );
};
