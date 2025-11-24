import React from 'react';
import Button from '@/components/ui/Button';

type Props = {
  tripName: string;
  onAddFamily: () => void;
  onOpenLists: () => void;
  onOpenItinerary: () => void;
  onShare: () => void;
  onOpenSettings: () => void;
};

const TripHeader: React.FC<Props> = ({
  tripName,
  onAddFamily,
  onOpenLists,
  onOpenItinerary,
  onShare,
  onOpenSettings,
}) => {
  return (
    <div
      className="
        mb-5 md:mb-8 
        flex flex-col 
        items-center
        gap-3 md:gap-4
        text-center
      "
    >
      {/* Заглавие */}
      <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold text-eco-text">
        {tripName}
      </h1>

      {/* Бутони */}
      <div className="grid w-full gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
        <Button
          variant="primary"
          onClick={onAddFamily}
          className="w-full sm:w-auto whitespace-nowrap text-sm py-2"
        >
          + Добави семейство
        </Button>

        <Button
          variant="secondary"
          onClick={onOpenLists}
          className="w-full sm:w-auto whitespace-nowrap text-sm py-2"
        >
          📝 Списъци
        </Button>

        <Button
          variant="secondary"
          onClick={onOpenItinerary}
          className="w-full sm:w-auto whitespace-nowrap text-sm py-2"
        >
          🗓️ Програма
        </Button>

        <Button
          variant="secondary"
          onClick={onShare}
          className="w-full sm:w-auto whitespace-nowrap text-sm py-2"
        >
          🔗 Сподели
        </Button>

        <Button
          variant="secondary"
          onClick={onOpenSettings}
          className="w-full sm:w-auto whitespace-nowrap text-sm py-2"
        >
          ⚙️ Настройки
        </Button>
      </div>
    </div>
  );
};

export default TripHeader;
