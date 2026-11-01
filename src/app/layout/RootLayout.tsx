import { Outlet } from 'react-router';
import { AssistantWidget } from '@/features/assistant/ui/AssistantWidget';
import { Header } from './Header';

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500">
        AI Driven E-Commerce · React + AWS Amplify
      </footer>
      <AssistantWidget />
    </div>
  );
}
