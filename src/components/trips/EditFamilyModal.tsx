import React from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type EditFamilyModalProps = {
  isOpen: boolean;
  initialName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
};

const EditFamilyModal: React.FC<EditFamilyModalProps> = ({
  isOpen,
  initialName,
  onClose,
  onSave,
}) => {
  const [name, setName] = React.useState(initialName);

  React.useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-6 bg-eco-surface rounded-2xl border border-eco-border shadow-eco-soft">
          <h2 className="text-lg font-semibold text-eco-text mb-3">
            Редакция на семейство
          </h2>

          <p className="text-sm text-eco-text-muted mb-4">
            Промени името на това семейство.
          </p>

          <Input
            label="Име на семейство"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Отказ
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
            >
              Запази
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EditFamilyModal;
