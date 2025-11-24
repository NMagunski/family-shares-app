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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="bg-eco-surface border border-eco-border rounded-2xl shadow-eco-soft p-6">
          <h2 className="mb-2 text-lg font-semibold text-eco-text">
            Сподели пътуването
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-eco-text-muted">
            Изпрати този линк на другите семейства. Когато го отворят, ще могат
            да се присъединят към пътуването.
          </p>

          <div className="flex flex-col gap-3">
            <Input
              value={shareUrl}
              readOnly
              onFocus={(e) => e.target.select()}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Затвори
              </Button>
              <Button
                type="button"
                onClick={handleCopy}
              >
                Копирай линка
              </Button>
            </div>

            {copied && (
              <span className="text-xs text-eco-accent mt-1">
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
