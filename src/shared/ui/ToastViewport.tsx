import { useShopUI } from '@/app/shop/ShopUIContext';
import { Icon } from './Icon';

export function ToastViewport() {
  const { toast, dismissToast } = useShopUI();
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      className="fixed bottom-24 left-1/2 z-[60] flex w-max max-w-[calc(100%-32px)] -translate-x-1/2 animate-rise items-center gap-3 rounded-sm bg-inverse py-3 pr-3 pl-4 text-sm text-inverse-foreground shadow-2 lg:bottom-6"
    >
      <Icon name={toast.icon ?? 'check'} className="text-lg text-ai" />
      <span>{toast.text}</span>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.run();
            dismissToast();
          }}
          className="cursor-pointer p-1 text-[13px] font-semibold underline underline-offset-3"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}
