
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const CardTypes = () => {
  const cardTypes = [
    { title: "Info Panels", desc: "Full-screen, theory-style cards for important concepts" },
    { title: "Quiz Cards", desc: "Must answer correctly before advancing; tracks points automatically" },
    { title: "Poll Cards", desc: "Collect opinions or quick feedback from learners" },
    { title: "Media Cards", desc: "Play audio or video clips before revealing content" }
  ];

  return (
    <div className="mb-20 animate-fade-in">
      <h3 className="text-3xl font-bold text-center mb-12">Multiple Card Types for Every Learning Style</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardTypes.map((type, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">{type.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{type.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
