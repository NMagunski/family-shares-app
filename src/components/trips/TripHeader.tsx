import React from 'react';
import Button from '@/components/ui/Button';
import {
  UserPlus,
  ListTodo,
  CalendarDays,
  Share2,
  Settings,
  Wallet, // 🆕 за Лични разходи
} from 'lucide-react';

type TripHeaderProps = {
  tripName: string;
  onAddFamily: () => void;
  onOpenLists: () => void;
  onOpenItinerary: () => void;
  onShare: () => void;
  onOpenSettings: () => void;
  // 🆕 нов проп – по избор
  onOpenPersonalExpenses?: () => void;
};

const TripHeader: React.FC<TripHeaderProps> = ({
  tripName,
  onAddFamily,
  onOpenLists,
  onOpenItinerary,
  onShare,
  onOpenSettings,
  onOpenPersonalExpenses,
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
          className="w-full sm:w-auto whitespace-nowrap text-sm py-2 flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          Добави семейство
        </Button>

        <Button
          variant="secondary"
          onClick={onOpenLists}
          className="w-full sm:w-auto whitespace-nowrap text-sm py-2 flex items-center gap-1.5"
        >
          <ListTodo className="w-4 h-4" />
          Списъци
        </Button>

        <Button
          variant="secondary"
          onClick={onOpenItinerary}
          className="w-full sm:w-auto whitespace-nowrap text-sm py-2 flex items-center gap-1.5"
        >
          <CalendarDays className="w-4 h-4" />
          Програма
        </Button>

        {/* 🆕 Лични разходи – показва се само ако имаме проп */}
        {onOpenPersonalExpenses && (
          <Button
            variant="secondary"
            onClick={onOpenPersonalExpenses}
            className="w-full sm:w-auto whitespace-nowrap text-sm py-2 flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4" />
            Лични разходи
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={onShare}
          className="w-full sm:w-auto whitespace-nowrap text-sm py-2 flex items-center gap-1.5"
        >
          <Share2 className="w-4 h-4" />
          Сподели
        </Button>

        <Button
          variant="secondary"
          onClick={onOpenSettings}
          className="w-full sm:w-auto whitespace-nowrap text-sm py-2 flex items-center gap-1.5"
        >
          <Settings className="w-4 h-4" />
          Настройки
        </Button>
      </div>
    </div>
  );
};

export default TripHeader;
