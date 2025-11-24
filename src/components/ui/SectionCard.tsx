import React from 'react';
import Card from '@/components/ui/Card';

type SectionCardProps = {
  title: string;
  icon?: string;
  children: React.ReactNode;
};

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => {
  return (
    <Card
      className="
        mb-6 
        bg-eco-surface-soft/80 
        border border-eco-border 
        shadow-eco-soft
        p-3 sm:p-4 md:p-5
        rounded-2xl
      "
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-3 md:mb-4">
        {icon && (
          <div
            className="
              flex items-center justify-center
              w-10 h-10 md:w-11 md:h-11
              rounded-xl
              bg-eco-surface
              border border-eco-border
              text-xl
            "
          >
            {icon}
          </div>
        )}

        <h2
          className="
            text-base md:text-lg 
            font-semibold 
            text-eco-text
          "
        >
          {title}
        </h2>
      </div>

      {/* CONTENT */}
      <div className="text-sm md:text-base text-eco-text leading-relaxed">
        {children}
      </div>
    </Card>
  );
};

export default SectionCard;
