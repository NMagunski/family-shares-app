import React from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// 🆕 Lucide икони
import { UserPlus, X } from 'lucide-react';

type AddFamilyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

const AddFamilyModal: React.FC<AddFamilyModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="relative bg-eco-surface shadow-eco-soft p-5 rounded-2xl">
          
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Затвори"
            className="
              absolute right-3 top-3
              p-1.5 rounded-lg
              text-eco-text-muted hover:text-eco-accent
              hover:bg-eco-surface-soft transition
            "
          >
            <X className="h-5 w-5" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-eco-surface-soft border border-eco-border">
              <UserPlus className="h-5 w-5 text-eco-text" />
            </div>
            <h2 className="text-lg font-semibold text-eco-text">
              Добави семейство
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">

            <Input
              label="Име на семейството"
              placeholder="напр. Семейство Иванови"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="mt-1 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="whitespace-nowrap"
              >
                Отказ
              </Button>

              <Button type="submit" className="whitespace-nowrap">
                Добави
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddFamilyModal;
