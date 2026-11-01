import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/features/auth/state/AuthContext';
import { useServices } from '@/services/ServicesContext';
import { cn } from '@/shared/lib/cn';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { buttonStyles } from '@/shared/ui/buttonStyles';
import { Spinner } from '@/shared/ui/Spinner';
import type { ChatMessage } from '../domain/assistant';
import { useAssistantChat } from '../state/useAssistantChat';

const SUGGESTIONS = ['Remeras de menos de 25', 'Busco un jean', 'Lo mejor valorado en Calzado'];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <li className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <p
        className={cn(
          'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed',
          isUser ? 'rounded-br-sm bg-violet-600 text-white' : 'rounded-bl-sm bg-zinc-100 text-zinc-800',
        )}
      >
        {message.content || <Spinner size="sm" className="text-zinc-400" />}
      </p>
    </li>
  );
}

function ChatPanel({ onClose }: { onClose(): void }) {
  const { assistant } = useServices();
  const { messages, status, error, send, reset } = useAssistantChat(assistant);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLUListElement>(null);
  const responding = status === 'responding';

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const submit = (text: string) => {
    if (responding) return;
    setDraft('');
    void send(text);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(draft);
  };

  return (
    <>
      <ul ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
        {messages.length === 0 && (
          <li className="flex flex-col gap-3 text-sm text-zinc-600">
            <p>Hola, soy tu asistente de moda. ¿Qué prenda estás buscando?</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => submit(suggestion)}
                  className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </li>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ul>
      {error && (
        <div className="px-4 pb-2">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-zinc-200 p-3">
        <label htmlFor="assistant-input" className="sr-only">Mensaje para el asistente</label>
        <input
          id="assistant-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escribe tu pregunta…"
          autoComplete="off"
          className="h-10 flex-1 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-500"
        />
        <Button type="submit" disabled={!draft.trim() || responding}>Enviar</Button>
      </form>
      <div className="flex justify-between border-t border-zinc-100 px-4 py-2 text-xs text-zinc-400">
        <button type="button" className="hover:text-zinc-700" onClick={reset} disabled={responding}>Nueva conversación</button>
        <button type="button" className="hover:text-zinc-700" onClick={onClose}>Cerrar</button>
      </div>
    </>
  );
}

export function AssistantWidget() {
  const { assistant } = useServices();
  const { status: authStatus, user } = useAuth();
  const [open, setOpen] = useState(false);
  const locked = assistant.requiresAuth && authStatus !== 'authenticated';

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <section
          aria-label="Asistente de compras"
          className="flex h-[32rem] max-h-[calc(100vh-7rem)] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-200"
        >
          <header className="flex items-center gap-3 bg-zinc-900 px-4 py-3 text-white">
            <span className="flex size-8 items-center justify-center rounded-full bg-yellow-300 text-sm font-bold text-zinc-900">IA</span>
            <div>
              <h2 className="text-sm font-semibold">Asistente de moda</h2>
              <p className="text-xs text-zinc-400">Prendas y outfits del catálogo</p>
            </div>
          </header>
          {locked ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-zinc-600">
              <p>Inicia sesión para conversar con el asistente.</p>
              <Link to="/login" className={buttonStyles({ size: 'sm' })} onClick={() => setOpen(false)}>Iniciar sesión</Link>
            </div>
          ) : (
            <ChatPanel key={user?.id ?? 'guest'} onClose={() => setOpen(false)} />
          )}
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente de compras'}
        className="flex size-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6" aria-hidden>
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" strokeLinejoin="round" />
          )}
        </svg>
      </button>
    </div>
  );
}
