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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{ maxWidth: 420, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <h2 style={{ marginBottom: 12 }}>Редакция на семейство</h2>
          <p style={{ fontSize: '0.9rem', marginBottom: 12 }}>
            Промени името на това семейство.
          </p>
          <div style={{ marginBottom: 12 }}>
            <Input
              label="Име на семейство"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: 8,
            }}
          >
            <Button
              type="button"
              onClick={onClose}
              style={{ backgroundColor: '#e5e7eb', color: '#111827' }}
            >
              Отказ
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!name.trim()) return;
                onSave(name.trim());
              }}
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
