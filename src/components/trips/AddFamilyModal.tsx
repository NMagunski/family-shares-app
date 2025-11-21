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
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    }}
    onClick={onClose}
  >
    <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 400 }}>
      <Card className="modal">
        <h2 style={{ marginBottom: 8 }}>Добави семейство</h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <Input
            label="Име на семейството"
            placeholder="напр. Семейство Иванови"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Отказ
            </Button>
            <Button type="submit">Добави</Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
);
};

export default AddFamilyModal;
