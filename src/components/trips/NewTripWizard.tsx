import React from 'react';
import type { Trip } from '@/types/trip';
import Button from '@/components/ui/Button';
import { Palmtree, Plane, Luggage, X } from 'lucide-react';

type TripType = Trip['type'];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (type: TripType, name: string) => Promise<void> | void;
};

const tripTypeOptions: { type: TripType; label: string; description: string; icon: React.ElementType }[] = [
  {
    type: 'beach',
    label: 'Море',
    description: 'Идеално за морски почивки, къмпинги и плажни уикенди.',
    icon: Palmtree,
  },
  {
    type: 'flight',
    label: 'Екскурзия',
    description: 'Пътувания в чужбина, city break-и и полети.',
    icon: Plane,
  },
  {
    type: 'other',
    label: 'Друго',
    description: 'Разходи за вили, приятелски срещи, общи пътувания и др.',
    icon: Luggage,
  },
];

const NewTripWizard: React.FC<Props> = ({ isOpen, onClose, onCreateTrip }) => {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [selectedType, setSelectedType] = React.useState<TripType | null>(null);
  const [name, setName] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // reset state when модалът се отваря/затваря
  React.useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedType(null);
      setName('');
      setSubmitting(false);
    }
  }, [isOpen]);

  // затваряне с ESC
  React.useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedOption = tripTypeOptions.find((o) => o.type === selectedType) || null;
  const canGoNext = step === 1 ? !!selectedType : !!name.trim();

  async function handleNext() {
    if (step === 1) {
      if (!selectedType) return;
      setStep(2);
      return;
    }

    // стъпка 2 → създаване
    if (!selectedType || !name.trim()) return;
    try {
      setSubmitting(true);
      await onCreateTrip(selectedType, name.trim());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="
          relative w-full max-w-lg 
          rounded-3xl bg-eco-surface 
          p-5 sm:p-6 
          shadow-2xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-eco-surface-soft/80 p-1.5 text-eco-text-muted hover:text-eco-text hover:bg-eco-surface-soft transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
            НОВО ПЪТУВАНЕ
          </p>
          <h2 className="mt-1 text-lg sm:text-xl font-semibold text-eco-text">
            {step === 1 ? 'Избери вид пътуване' : 'Име на пътуването'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-eco-text-muted">
            {step === 1
              ? 'Това помага по-добре да организираш пътуванията и иконките им.'
              : 'Дай име, по което лесно ще разпознаваш това пътуване (напр. „Море 2026“).'}
          </p>
        </div>

        {/* Step content */}
        {step === 1 ? (
          <div className="space-y-2">
            {tripTypeOptions.map((opt) => {
              const Icon = opt.icon;
              const active = selectedType === opt.type;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setSelectedType(opt.type)}
                  className={`
                    flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition
                    ${active
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-eco-border bg-eco-surface-soft hover:border-emerald-500/70 hover:bg-eco-surface-soft/80'}
                  `}
                >
                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center rounded-2xl text-emerald-400
                      ${active ? 'bg-emerald-500/15' : 'bg-eco-surface'}
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-eco-text">{opt.label}</p>
                    <p className="text-xs text-eco-text-muted">{opt.description}</p>
                  </div>
                  {active && (
                    <span className="text-xs font-semibold text-emerald-400">
                      Избрано
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {selectedOption && (
              <div className="flex items-center gap-3 rounded-2xl bg-eco-surface-soft px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-eco-surface text-emerald-400">
                  <selectedOption.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-eco-text-muted">Вид пътуване</p>
                  <p className="text-sm font-semibold text-eco-text">
                    {selectedOption.label}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-eco-text-muted">
                Име на пътуването
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Напр. Море 2026, Нова година в Родопите..."
                className="
                  w-full rounded-xl border border-eco-border 
                  bg-eco-surface-soft px-3 py-2 text-sm text-eco-text
                  placeholder:text-eco-text-muted
                  focus:outline-none focus:ring-2 focus:ring-emerald-500
                "
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Footer / Actions */}
        <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-eco-text-muted">
            Стъпка {step} от 2
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={step === 1 ? onClose : () => setStep(1)}
              className="rounded-xl border border-eco-border bg-transparent px-3 py-1.5 text-xs font-medium text-eco-text-muted hover:bg-eco-surface-soft transition"
            >
              {step === 1 ? 'Отказ' : 'Назад'}
            </button>
            <Button
              type="button"
              disabled={!canGoNext || submitting}
              onClick={handleNext}
              className="px-4 py-1.5 text-xs sm:text-sm"
            >
              {step === 1 ? 'Напред' : submitting ? 'Създаване...' : 'Създай пътуване'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTripWizard;
