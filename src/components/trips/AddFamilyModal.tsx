import React from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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
        <Card className="bg-eco-surface shadow-eco-soft">
          <h2 className="mb-3 text-lg font-semibold text-eco-text">
            Добави семейство
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <Input
              label="Име на семейството"
              placeholder="напр. Семейство Иванови"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Отказ
              </Button>
              <Button type="submit">
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
