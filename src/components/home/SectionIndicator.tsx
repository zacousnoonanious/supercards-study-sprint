
import React from 'react';

interface SectionIndicatorProps {
  sections: readonly string[];
  currentSection: string;
  onNavigate: (section: any) => void;
  isTransitioning: boolean;
}

export const SectionIndicator: React.FC<SectionIndicatorProps> = ({
  sections,
  currentSection,
  onNavigate,
  isTransitioning
}) => {
  return (
    <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40 space-y-4">
      {sections.map((section, index) => (
        <button
          key={section}
          onClick={() => onNavigate(section)}
          disabled={isTransitioning}
          className={`
            block w-3 h-3 rounded-full transition-all duration-300
            ${currentSection === section
              ? 'bg-purple-600 scale-125 shadow-lg'
              : 'bg-purple-300 hover:bg-purple-400'
            }
            ${isTransitioning ? 'opacity-50' : 'opacity-100'}
          `}
          title={section.charAt(0).toUpperCase() + section.slice(1)}
        />
      ))}
    </div>
  );
};
