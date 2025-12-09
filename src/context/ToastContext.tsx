import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

type Toast = {
  id: number;
  message: string;
};

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Глобален toast контейнер */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center">
        <div className="space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="
                pointer-events-auto
                rounded-2xl 
                bg-emerald-500 
                px-4 
                py-2 
                text-sm 
                font-medium 
                text-white 
                shadow-lg
              "
            >
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};
