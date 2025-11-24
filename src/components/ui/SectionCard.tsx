import React from 'react';
import Card from '@/components/ui/Card';

type SectionCardProps = {
  title: string;
  icon?: string;
  children: React.ReactNode;
};

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => {
  return (
    <Card className="mb-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-eco-surface-soft border border-eco-border text-lg">
              {icon}
            </span>
          )}
          <h2 className="text-base md:text-lg font-semibold text-eco-text">
            {title}
          </h2>
        </div>
      </div>

      <div className="text-sm md:text-base text-eco-text">
        {children}
      </div>
    </Card>
  );
};

export default SectionCard;
