
import React from 'react';
import { Star } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export const Testimonials = () => {
  const { t } = useI18n();
  const testimonials = [
    { rating: 5, key: "sarah" },
    { rating: 5, key: "mike" },
    { rating: 5, key: "alex" }
  ];

  return (
    <div className="mb-16 text-center bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8 animate-fade-in">
      <h3 className="text-2xl font-bold mb-8">{t('home.testimonials.title')}</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="text-center">
            <div className="flex justify-center mb-2">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-2 italic">"{t(`home.testimonials.${testimonial.key}.text`)}"</p>
            <p className="font-medium">{t(`home.testimonials.${testimonial.key}.author`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
