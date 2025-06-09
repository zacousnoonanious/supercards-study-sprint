
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-600">
        {/* Geometric shapes scattered in background */}
        <div className="absolute top-20 left-10 w-8 h-8 bg-pink-300 rounded-full opacity-70"></div>
        <div className="absolute top-32 right-20 w-6 h-6 bg-blue-300 transform rotate-45 opacity-60"></div>
        <div className="absolute top-40 left-1/4 w-4 h-4 bg-yellow-300 transform rotate-12 opacity-50"></div>
        <div className="absolute bottom-40 right-10 w-10 h-10 bg-purple-300 rounded-full opacity-60"></div>
        <div className="absolute bottom-60 left-16 w-5 h-5 bg-cyan-300 transform rotate-45 opacity-70"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-pink-300 transform rotate-12 opacity-50"></div>
        <div className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-blue-300 rounded-full opacity-40"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        {/* Main Heading */}
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
          Master your studies
          <br />
          with flashcards
        </h1>

        {/* CTA Button */}
        <Link to="/auth">
          <Button 
            size="lg" 
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started
          </Button>
        </Link>
      </div>

      {/* Cute Characters */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Yellow monster character */}
        <div className="absolute bottom-8 left-8 md:left-16">
          <div className="relative">
            {/* Monster body */}
            <div className="w-20 h-24 bg-yellow-400 rounded-t-full relative">
              {/* Eyes */}
              <div className="absolute top-4 left-3 w-4 h-4 bg-white rounded-full">
                <div className="w-2 h-2 bg-black rounded-full ml-1 mt-1"></div>
              </div>
              <div className="absolute top-4 right-3 w-4 h-4 bg-white rounded-full">
                <div className="w-2 h-2 bg-black rounded-full ml-1 mt-1"></div>
              </div>
              {/* Mouth */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-black rounded-full"></div>
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-red-500 rounded-full"></div>
              {/* Horns */}
              <div className="absolute -top-2 left-2 w-0 h-0 border-l-4 border-r-4 border-b-6 border-transparent border-b-purple-600"></div>
              <div className="absolute -top-2 right-2 w-0 h-0 border-l-4 border-r-4 border-b-6 border-transparent border-b-purple-600"></div>
              {/* Arms */}
              <div className="absolute top-10 -left-3 w-6 h-6 bg-yellow-400 rounded-full"></div>
              <div className="absolute top-10 -right-3 w-6 h-6 bg-yellow-400 rounded-full"></div>
            </div>
            {/* Floating papers */}
            <div className="absolute -top-8 -right-4 w-6 h-4 bg-white rounded transform rotate-12 shadow-sm"></div>
            <div className="absolute -top-12 right-2 w-4 h-3 bg-white rounded transform -rotate-6 shadow-sm"></div>
          </div>
        </div>

        {/* Purple character at desk */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          {/* Desk */}
          <div className="w-24 h-16 bg-purple-600 rounded-lg relative">
            {/* Desk legs */}
            <div className="absolute bottom-0 left-2 w-2 h-8 bg-purple-700"></div>
            <div className="absolute bottom-0 right-2 w-2 h-8 bg-purple-700"></div>
            {/* Paper on desk */}
            <div className="absolute top-2 left-4 w-6 h-4 bg-white rounded shadow-sm"></div>
          </div>
          {/* Purple character */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-20 bg-purple-500 rounded-t-full relative">
              {/* Eyes */}
              <div className="absolute top-4 left-2 w-4 h-4 bg-white rounded-full">
                <div className="w-2 h-2 bg-black rounded-full ml-1 mt-1"></div>
              </div>
              <div className="absolute top-4 right-2 w-4 h-4 bg-white rounded-full">
                <div className="w-2 h-2 bg-black rounded-full ml-1 mt-1"></div>
              </div>
              {/* Smile */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
              {/* Arms */}
              <div className="absolute top-12 -left-2 w-4 h-4 bg-purple-500 rounded-full"></div>
              <div className="absolute top-12 -right-2 w-4 h-4 bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Teal robot character */}
        <div className="absolute bottom-8 right-8 md:right-16">
          <div className="relative">
            {/* Robot body */}
            <div className="w-18 h-22 bg-teal-400 rounded-lg relative">
              {/* Helmet/head */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-teal-400 rounded-full">
                {/* Eyes */}
                <div className="absolute top-4 left-2 w-3 h-3 bg-black rounded-full"></div>
                <div className="absolute top-4 right-2 w-3 h-3 bg-black rounded-full"></div>
                {/* Smile */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-black rounded-full"></div>
                {/* Antennae */}
                <div className="absolute -top-2 left-1/3 w-1 h-3 bg-teal-600"></div>
                <div className="absolute -top-2 right-1/3 w-1 h-3 bg-teal-600"></div>
                <div className="absolute -top-3 left-1/3 w-2 h-2 bg-teal-600 rounded-full"></div>
                <div className="absolute -top-3 right-1/3 w-2 h-2 bg-teal-600 rounded-full"></div>
              </div>
              {/* Arms */}
              <div className="absolute top-4 -left-3 w-5 h-5 bg-teal-400 rounded-full"></div>
              <div className="absolute top-4 -right-3 w-5 h-5 bg-teal-400 rounded-full"></div>
            </div>
            {/* Paper with checkmark */}
            <div className="absolute top-2 -right-6 w-6 h-4 bg-white rounded shadow-sm">
              <div className="absolute top-1 left-2 w-2 h-1 bg-green-500 transform rotate-45"></div>
              <div className="absolute top-1.5 left-1 w-1 h-0.5 bg-green-500 transform -rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Owl character */}
        <div className="absolute top-40 right-12 md:right-24">
          <div className="relative">
            {/* Owl body */}
            <div className="w-16 h-20 bg-orange-400 rounded-t-full relative">
              {/* Eyes */}
              <div className="absolute top-3 left-1 w-6 h-6 bg-white rounded-full border-2 border-orange-600">
                <div className="w-3 h-3 bg-black rounded-full ml-1.5 mt-1.5"></div>
              </div>
              <div className="absolute top-3 right-1 w-6 h-6 bg-white rounded-full border-2 border-orange-600">
                <div className="w-3 h-3 bg-black rounded-full ml-1.5 mt-1.5"></div>
              </div>
              {/* Beak */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-3 border-transparent border-t-yellow-500"></div>
              {/* Belly pattern */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-orange-300 rounded-full">
                <div className="absolute top-1 left-1 w-1 h-1 bg-orange-600 rounded-full"></div>
                <div className="absolute top-3 left-2 w-1 h-1 bg-orange-600 rounded-full"></div>
                <div className="absolute top-2 right-1 w-1 h-1 bg-orange-600 rounded-full"></div>
              </div>
            </div>
            {/* Perch */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-3 bg-purple-600 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
