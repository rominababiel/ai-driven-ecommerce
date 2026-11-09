import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useShopUI } from '@/app/shop/ShopUIContext';
import { useAddToCart } from '@/app/shop/useAddToCart';
import { useAuth } from '@/features/auth/state/AuthContext';
import type { AuthRedirectState } from '@/features/auth/ui/AuthPage';
import { useCart } from '@/features/cart/state/CartContext';
import type { Product } from '@/features/catalog/domain/product';
import { productBadge } from '@/features/catalog/ui/productBadge';
import { useCatalog } from '@/features/catalog/state/useCatalog';
import { useServices } from '@/services/ServicesContext';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/money';
import { normalizeText } from '@/shared/lib/text';
import { Icon } from '@/shared/ui/Icon';
import type { ChatMessage } from '../domain/assistant';
import { useAssistantChat } from '../state/useAssistantChat';

const SUGGESTIONS = [
  { text: 'Armame un look para salir a correr', icon: 'person-simple-run' },
  { text: '¿Qué me pongo para andar en bici?', icon: 'bicycle' },
  { text: 'Algo cómodo para caminar por la ciudad', icon: 'person-simple-walk' },
  { text: 'Mostrame lo que está en oferta', icon: 'percent' },
];
const FOLLOW_UPS = ['Más económico', 'En otro color', '¿Qué combina con esto?'];
const MAX_CARDS = 4;

function mentionedProducts(content: string, catalog: readonly Product[]): Product[] {
  const text = normalizeText(content);
  return catalog.filter((product) => text.includes(normalizeText(product.name))).slice(0, MAX_CARDS);
}

function ChatProductCard({ product }: { product: Product }) {
  const { items } = useCart();
  const addToCart = useAddToCart();
  const navigate = useNavigate();
  const { closeChat } = useShopUI();
  const inCart = items.some((item) => item.productId === product.id);
  const out = product.stock === 0;
  const badge = productBadge(product, true);

  return (
    <div className="flex w-[156px] flex-none flex-col overflow-hidden rounded-md border border-border bg-surface">
      <button
        type="button"
        aria-label={`Ver ${product.name}`}
        onClick={() => {
          closeChat();
          navigate(`/products/${product.id}`);
        }}
        className="relative aspect-[4/5] cursor-pointer bg-photo"
      >
        {product.imageUrl && <img src={product.imageUrl} alt="" className="size-full object-cover" />}
        {badge && <span className={cn('absolute top-1.5 left-1.5 border px-1.5 py-1 text-[9px] leading-none font-semibold tracking-[0.06em] uppercase', badge.className)}>{badge.label}</span>}
      </button>
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <span className="text-[11px] leading-tight font-semibold uppercase">{product.name}</span>
        <span className={cn('font-mono text-xs font-medium', product.compareAtPrice ? 'text-sale' : 'text-foreground')}>{formatPrice(product.price)}</span>
        <button
          type="button"
          disabled={out || inCart}
          onClick={() => addToCart(product, { size: 'M', reveal: 'toast' })}
          className={cn('btn mt-auto h-9 rounded-xs text-xs', out ? 'bg-border text-muted-foreground' : inCart ? 'bg-success text-white disabled:opacity-100' : 'bg-primary text-primary-foreground')}
        >
          <Icon name={out ? 'prohibit' : inCart ? 'check' : 'plus'} />
          {out ? 'Sin stock' : inCart ? 'Agregado' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}

function AssistantBubble({ message, streaming, catalog }: { message: ChatMessage; streaming: boolean; catalog: readonly Product[] }) {
  const cards = streaming ? [] : mentionedProducts(message.content, catalog);
  return (
    <div className="flex flex-col gap-2.5 self-stretch">
      <div className="max-w-[90%] self-start rounded-[16px_16px_16px_2px] bg-ai-soft px-3.5 py-2.5 text-sm leading-normal whitespace-pre-wrap">
        {message.content}
        {streaming && <span className="ml-0.5 inline-block h-[15px] w-0.5 animate-caret bg-ai-soft-foreground align-[-2px]" />}
      </div>
      {cards.length > 0 && (
        <div className="no-scrollbar flex animate-rise gap-2.5 overflow-x-auto pb-1">
          {cards.map((product) => (
            <ChatProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AssistantWidget() {
  const { assistant } = useServices();
  const { user } = useAuth();
  const { chatOpen, openChat, closeChat, registerAsker, panel } = useShopUI();
  const { messages, status, error, send, reset } = useAssistantChat(assistant);
  const { data: catalog } = useCatalog();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [draft, setDraft] = useState('');
  const [blockedQuestion, setBlockedQuestion] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const responding = status === 'responding';
  const needsLogin = assistant.requiresAuth && !user;
  const products = useMemo(() => catalog ?? [], [catalog]);
  const lastMessage = messages.at(-1);
  const thinking = responding && (!lastMessage || lastMessage.role === 'user' || lastMessage.content === '');

  const ask = (text: string) => {
    const question = text.trim();
    if (!question || responding) return;
    setDraft('');
    if (needsLogin) {
      setBlockedQuestion(question);
      return;
    }
    setBlockedQuestion(null);
    setLastQuestion(question);
    void send(question);
  };

  const askRef = useRef(ask);
  useEffect(() => {
    askRef.current = ask;
  });
  useEffect(() => {
    registerAsker((question) => askRef.current(question));
    return () => registerAsker(null);
  }, [registerAsker]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, blockedQuestion, error, thinking]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(draft);
  };

  const goLogin = () => {
    const state: AuthRedirectState = { from: pathname, question: blockedQuestion ?? undefined };
    closeChat();
    navigate('/login', { state });
  };

  const empty = messages.length === 0 && !blockedQuestion && !responding;
  const showFab = !chatOpen && panel === null;

  return (
    <>
      <div
        role="dialog"
        aria-label="Asistente de moda"
        aria-hidden={!chatOpen}
        inert={!chatOpen}
        className={cn(
          'fixed inset-0 z-50 flex flex-col overflow-hidden bg-surface shadow-3 transition-[transform,opacity] duration-500 ease-out sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(660px,calc(100%-48px))] sm:w-[400px] sm:rounded-lg sm:border sm:border-border',
          chatOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0 sm:translate-y-6 sm:scale-[.98]',
        )}
      >
        <div className="flex flex-none items-center justify-between border-b border-border py-3 pr-2 pl-4">
          <span className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-ai text-ai-foreground">
              <Icon name="sparkle" fill className="text-lg" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-bold">Asistente Outfit</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-success" />
                {thinking ? 'Pensando…' : responding ? 'Escribiendo…' : 'En línea'}
              </span>
            </span>
          </span>
          <div className="flex">
            <button
              type="button"
              onClick={() => {
                reset();
                setBlockedQuestion(null);
              }}
              aria-label="Nueva conversación"
              className="icon-btn"
            >
              <Icon name="note-pencil" className="text-xl" />
            </button>
            <button type="button" onClick={closeChat} aria-label="Cerrar asistente" className="icon-btn">
              <Icon name="x" className="text-[22px]" />
            </button>
          </div>
        </div>

        <div ref={listRef} aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {empty && (
            <div className="flex flex-col gap-4 pt-2">
              <span className="display text-[40px]">Hola. ¿Qué querés armar hoy?</span>
              <span className="text-sm leading-normal text-muted-foreground">Contame la ocasión, el clima o una prenda que ya tengas. Te muestro opciones con stock.</span>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.text}
                    type="button"
                    onClick={() => ask(suggestion.text)}
                    className="flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-left text-sm leading-tight font-medium hover:border-foreground"
                  >
                    <Icon name={suggestion.icon} className="text-lg text-ai-soft-foreground" />
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) =>
            message.role === 'user' ? (
              <div key={message.id} className="max-w-[82%] animate-rise self-end rounded-[16px_16px_2px_16px] bg-primary px-3.5 py-2.5 text-sm leading-snug text-primary-foreground">
                {message.content}
              </div>
            ) : message.content ? (
              <AssistantBubble key={message.id} message={message} streaming={responding && index === messages.length - 1} catalog={products} />
            ) : null,
          )}

          {thinking && (
            <div aria-label="Escribiendo" className="flex gap-1 self-start rounded-[16px_16px_16px_2px] bg-ai-soft px-4 py-3.5">
              {[0, 150, 300].map((delay) => (
                <span key={delay} className="size-1.5 animate-dot rounded-full bg-ai-soft-foreground" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
          )}

          {error && !responding && (
            <div role="alert" className="flex max-w-[90%] animate-rise flex-col gap-2.5 self-start rounded-[16px_16px_16px_2px] border border-border px-3.5 py-3">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-danger">
                <Icon name="warning-circle" className="text-[17px]" />
                No pude responder
              </span>
              <span className="text-[13px] leading-snug">{error}</span>
              {lastQuestion && (
                <button type="button" onClick={() => ask(lastQuestion)} className="btn h-9 self-start rounded-full border border-foreground px-3.5 text-[13px]">
                  <Icon name="arrow-clockwise" />
                  Reintentar
                </button>
              )}
            </div>
          )}

          {blockedQuestion && (
            <>
              <div className="max-w-[82%] self-end rounded-[16px_16px_2px_16px] bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">{blockedQuestion}</div>
              <div className="flex max-w-[90%] animate-rise flex-col gap-2.5 self-start rounded-[16px_16px_16px_2px] bg-ai-soft px-3.5 py-3">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ai-soft-foreground">
                  <Icon name="lock-simple" className="text-base" />
                  Iniciá sesión
                </span>
                <span className="text-[13px] leading-snug">Para usar el asistente necesitás una cuenta. Ingresá y te respondo al toque.</span>
                <button type="button" onClick={goLogin} className="btn h-9 self-start rounded-full bg-primary px-4 text-[13px] text-primary-foreground">
                  Ingresar
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-none flex-col gap-2 border-t border-border px-3 pt-2.5 pb-3">
          {messages.length > 0 && !responding && (
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {FOLLOW_UPS.map((followUp) => (
                <button key={followUp} type="button" onClick={() => ask(followUp)} className="h-[34px] flex-none cursor-pointer rounded-full border border-border px-3 text-xs font-medium">
                  {followUp}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={submit} className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribí tu consulta…"
              aria-label="Mensaje"
              className="h-[46px] min-w-0 flex-1 rounded-full border border-border-strong bg-background px-4 text-[15px] outline-none focus:border-foreground"
            />
            <button type="submit" aria-label="Enviar" disabled={responding || !draft.trim()} className="grid size-[46px] flex-none cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50">
              <Icon name="arrow-up" className="text-lg" />
            </button>
          </form>
          <span className="text-center font-mono text-[10px] text-muted-foreground">El asistente puede equivocarse. Revisá talle y stock antes de comprar.</span>
        </div>
      </div>

      {showFab && (
        <button
          type="button"
          onClick={() => openChat()}
          aria-label="Abrir asistente de moda"
          className={cn(
            'fixed right-4 z-30 flex h-14 min-w-14 cursor-pointer items-center justify-center gap-2 rounded-full bg-ai text-[15px] font-bold text-ai-foreground shadow-2 transition-transform duration-150 hover:-translate-y-0.5 hover:bg-ai-hover lg:right-6 lg:bottom-6 lg:pr-5.5 lg:pl-4.5',
            pathname.startsWith('/products/') ? 'bottom-[84px]' : 'bottom-4',
          )}
        >
          <Icon name="sparkle" fill className="text-[22px]" />
          <span className="hidden lg:inline">Asistente</span>
        </button>
      )}
    </>
  );
}
