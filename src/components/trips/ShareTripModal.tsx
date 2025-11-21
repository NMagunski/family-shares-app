import React from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type ShareTripModalProps = {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
};

const ShareTripModal: React.FC<ShareTripModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
}) => {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch (err) {
      console.error(err);
      alert('Не успях да копирам линка. Копирай го ръчно.');
    }
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
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 420 }}>
        <Card>
          <h2 style={{ marginBottom: 8 }}>Сподели пътуването</h2>
          <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: 12 }}>
            Изпрати този линк на другите семейства. Когато го отворят, ще могат да се
            присъединят към пътуването.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Input
              value={shareUrl}
              readOnly
              onFocus={(e) => e.target.select()}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button type="button" variant="secondary" onClick={onClose}>
                Затвори
              </Button>
              <Button type="button" onClick={handleCopy}>
                Копирай линка
              </Button>
            </div>

            {copied && (
              <span style={{ fontSize: '0.85rem', color: '#16a34a' }}>
                ✅ Линкът е копиран в клипборда.
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ShareTripModal;
