import { Outlet, useLocation } from 'react-router';
import { ShopUIProvider } from '@/app/shop/ShopUIProvider';
import { AssistantWidget } from '@/features/assistant/ui/AssistantWidget';
import { MiniCart } from '@/features/cart/ui/MiniCart';
import { ToastViewport } from '@/shared/ui/ToastViewport';
import { CheckoutHeader } from './CheckoutHeader';
import { Footer } from './Footer';
import { Header, PromoBar } from './Header';
import { MobileMenu } from './MobileMenu';

export function RootLayout() {
  const { pathname } = useLocation();
  const checkout = pathname.startsWith('/checkout');

  return (
    <ShopUIProvider>
      <div className="flex min-h-screen flex-col">
        {checkout ? (
          <CheckoutHeader />
        ) : (
          <>
            <PromoBar />
            <Header />
          </>
        )}
        <main className="flex-1">
          <Outlet />
        </main>
        {!checkout && <Footer />}
      </div>
      <MobileMenu />
      <MiniCart />
      {!checkout && <AssistantWidget />}
      <ToastViewport />
    </ShopUIProvider>
  );
}
