
import React from 'react';
import { Star } from 'lucide-react';

export const Testimonials = () => {
  const testimonials = [
    { rating: 5, text: "SuperCards transformed how I study. The AI features are incredible!", author: "Sarah, Medical Student" },
    { rating: 5, text: "Perfect for our team training. The collaboration features are top-notch.", author: "Mike, Team Lead" },
    { rating: 5, text: "Love the offline support. I can study anywhere, anytime.", author: "Alex, Language Learner" }
  ];

  return (
    <div className="mb-16 text-center bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8 animate-fade-in">
      <h3 className="text-2xl font-bold mb-8">Trusted by learners worldwide</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="text-center">
            <div className="flex justify-center mb-2">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-2 italic">"{testimonial.text}"</p>
            <p className="font-medium">{testimonial.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
