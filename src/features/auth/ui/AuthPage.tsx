import { useState, type FormEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useShopUI } from '@/app/shop/ShopUIContext';
import { useServices } from '@/services/ServicesContext';
import { cn } from '@/shared/lib/cn';
import { toErrorMessage } from '@/shared/lib/errors';
import { EMAIL_PATTERN } from '@/shared/lib/validation';
import { Icon } from '@/shared/ui/Icon';
import { DEMO_ACCOUNTS } from '../infrastructure/localAuthGateway';
import { useAuth } from '../state/AuthContext';

type Mode = 'login' | 'register' | 'code' | 'forgot' | 'reset';

export interface AuthRedirectState {
  from?: string;
  question?: string;
}

const CODE_LENGTH = 6;

function passwordScore(password: string): number {
  return [password.length >= 8, /\d/.test(password), /[A-Z]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
}

function Field({ label, aside, children }: { label: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex justify-between text-[13px] font-medium">
        {label}
        {aside}
      </span>
      {children}
    </label>
  );
}

function CodeInput({ value, onChange, invalid }: { value: string; onChange(value: string): void; invalid: boolean }) {
  return (
    <label className="relative grid cursor-text grid-cols-6 gap-2">
      {Array.from({ length: CODE_LENGTH }, (_, index) => {
        const active = index === value.length;
        return (
          <span
            key={index}
            className={cn('grid h-[58px] place-items-center rounded-sm border bg-surface font-mono text-2xl font-medium', invalid ? 'border-[1.5px] border-danger' : active ? 'border-[1.5px] border-foreground shadow-[0_0_0_3px_oklch(0.19_0.01_60/0.12)]' : 'border-border-strong')}
          >
            {value[index] ?? ''}
          </span>
        );
      })}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={CODE_LENGTH}
        aria-label="Código de 6 dígitos"
        autoFocus
        className="absolute inset-0 w-full text-base opacity-0"
      />
    </label>
  );
}

function BackButton({ onClick }: { onClick(): void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-10 cursor-pointer items-center gap-1.5 self-start text-[13px] font-medium">
      <Icon name="arrow-left" />
      Volver
    </button>
  );
}

function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <span role="alert" className="flex items-center gap-1.5 text-[13px] font-medium text-danger">
      <Icon name="warning-circle" className="text-base" />
      {message}
    </span>
  );
}

export function AuthPage({ initialMode }: { initialMode: 'login' | 'register' }) {
  const { signIn, signUp, confirmSignUp, requestPasswordReset, confirmPasswordReset, signInWithGoogle } = useAuth();
  const { dataSource } = useServices();
  const { openChat } = useShopUI();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as AuthRedirectState | null) ?? {};
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const finish = () => {
    navigate(redirect.from ?? '/', { replace: true });
    if (redirect.question) openChat(redirect.question);
  };

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(toErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const login = (event: FormEvent, credentials = { email, password }) => {
    event.preventDefault();
    void run(async () => {
      await signIn(credentials);
      finish();
    });
  };

  const register = (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email)) return setError('Ingresá un email válido.');
    if (passwordScore(password) < 2) return setError('Mínimo 8 caracteres con un número.');
    void run(async () => {
      const { needsConfirmation } = await signUp({ email, password });
      if (needsConfirmation) {
        setCode('');
        setMode('code');
      } else {
        await signIn({ email, password });
        finish();
      }
    });
  };

  const verify = (event: FormEvent) => {
    event.preventDefault();
    if (code.length < CODE_LENGTH) return setError('Completá los 6 dígitos.');
    void run(async () => {
      await confirmSignUp(email, code);
      await signIn({ email, password });
      finish();
    });
  };

  const sendResetCode = (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email)) return setError('Ingresá un email válido.');
    void run(async () => {
      await requestPasswordReset(email);
      setCode('');
      setPassword('');
      setMode('reset');
    });
  };

  const resetPassword = (event: FormEvent) => {
    event.preventDefault();
    if (code.length < CODE_LENGTH) return setError('Completá los 6 dígitos.');
    if (passwordScore(password) < 2) return setError('Mínimo 8 caracteres con un número.');
    void run(async () => {
      await confirmPasswordReset(email, code, password);
      setPassword('');
      setNotice('Listo, ya podés ingresar con tu nueva contraseña.');
      setMode('login');
    });
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const googleButton = dataSource === 'amplify' && (
    <>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
      </div>
      <button type="button" disabled={busy} onClick={() => void run(signInWithGoogle)} className="btn h-12 rounded-xs border border-border-strong bg-surface text-sm">
        <Icon name="google-logo" className="text-lg" />
        Continuar con Google
      </button>
    </>
  );

  const score = passwordScore(password);
  const strengthMeter = (
    <>
      <div aria-hidden="true" className="grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((level) => (
          <span key={level} className={cn('h-[3px]', score >= level ? 'bg-success' : 'bg-border')} />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">Mínimo 8 caracteres con un número.</span>
    </>
  );
  const passwordInput = (
    <div className="field flex items-center justify-between pr-1.5 focus-within:border-foreground">
      <input
        type={showPassword ? 'text' : 'password'}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        className="min-w-0 flex-1 bg-transparent outline-none"
      />
      <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="grid size-10 cursor-pointer place-items-center">
        <Icon name={showPassword ? 'eye-slash' : 'eye'} className="text-lg" />
      </button>
    </div>
  );

  return (
    <section className="mx-auto flex max-w-[440px] flex-col gap-6 px-4 pt-10 pb-18">
      {(mode === 'login' || mode === 'register') && (
        <div role="tablist" className="grid grid-cols-2 border-b border-border">
          {(['login', 'register'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mode === tab}
              onClick={() => switchMode(tab)}
              className={cn('-mb-px h-12 cursor-pointer border-b-2 text-[13px] font-semibold tracking-[0.04em] uppercase', mode === tab ? 'border-foreground' : 'border-transparent')}
            >
              {tab === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          ))}
        </div>
      )}

      {redirect.question && (
        <div className="flex gap-2.5 bg-ai-soft px-3.5 py-3 text-[13px] leading-snug text-ai-soft-foreground">
          <Icon name="sparkle" fill className="flex-none text-lg" />
          Ingresá y el asistente sigue con tu pregunta.
        </div>
      )}

      {mode === 'login' && (
        <form onSubmit={login} className="flex flex-col gap-4">
          <h1 className="display text-[40px] leading-[0.9]">Hola de nuevo</h1>
          <Field label="Email">
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="field" />
          </Field>
          <Field
            label="Contraseña"
            aside={
              <button type="button" onClick={() => switchMode('forgot')} className="cursor-pointer text-[13px] font-medium underline underline-offset-2">
                ¿Olvidaste tu contraseña?
              </button>
            }
          >
            {passwordInput}
          </Field>
          {notice && (
            <span role="status" className="flex items-center gap-1.5 text-[13px] font-medium text-success">
              <Icon name="check-circle" className="text-base" />
              {notice}
            </span>
          )}
          <ErrorText message={error} />
          <button type="submit" disabled={busy} className="btn-primary">
            {busy && <Icon name="circle-notch" className="animate-spin" />}
            Ingresar
          </button>
          {googleButton}
          {dataSource === 'local' && (
            <>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                o probá con una cuenta demo
                <span className="h-px flex-1 bg-border" />
              </div>
              {DEMO_ACCOUNTS.filter((account) => account.role === 'customer').map((account) => (
                <button key={account.id} type="button" disabled={busy} onClick={(event) => login(event, { email: account.email, password: account.password })} className="btn h-12 rounded-xs border border-border-strong bg-surface text-sm">
                  <Icon name="user" className="text-lg" />
                  Entrar como cliente
                </button>
              ))}
            </>
          )}
        </form>
      )}

      {mode === 'register' && (
        <form onSubmit={register} className="flex flex-col gap-4">
          <h1 className="display text-[40px] leading-[0.9]">Sumate a Outfit</h1>
          <Field label="Email">
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="field" />
          </Field>
          <Field label="Contraseña">
            {passwordInput}
            {strengthMeter}
          </Field>
          <ErrorText message={error} />
          <button type="submit" disabled={busy} className="btn-primary">
            {busy && <Icon name="circle-notch" className="animate-spin" />}
            Crear cuenta
          </button>
          {googleButton}
        </form>
      )}

      {mode === 'code' && (
        <form onSubmit={verify} className="flex flex-col gap-4.5">
          <BackButton onClick={() => switchMode('register')} />
          <span className="grid size-14 place-items-center rounded-full bg-muted">
            <Icon name="envelope-simple" className="text-[26px]" />
          </span>
          <h1 className="display text-[40px] leading-[0.9]">Revisá tu mail</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Te mandamos un código de 6 dígitos a <b className="text-foreground">{email}</b>.
          </p>
          <CodeInput
            value={code}
            invalid={Boolean(error)}
            onChange={(value) => {
              setCode(value);
              setError(null);
            }}
          />
          <ErrorText message={error} />
          <button type="submit" disabled={busy} className="btn-primary">
            {busy && <Icon name="circle-notch" className="animate-spin" />}
            Verificar
          </button>
        </form>
      )}

      {mode === 'forgot' && (
        <form onSubmit={sendResetCode} className="flex flex-col gap-4">
          <BackButton onClick={() => switchMode('login')} />
          <h1 className="display text-[40px] leading-[0.9]">Recuperá tu contraseña</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">Te mandamos un código de 6 dígitos para crear una nueva.</p>
          <Field label="Email">
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus className="field" />
          </Field>
          <ErrorText message={error} />
          <button type="submit" disabled={busy} className="btn-primary">
            {busy && <Icon name="circle-notch" className="animate-spin" />}
            Enviar código
          </button>
        </form>
      )}

      {mode === 'reset' && (
        <form onSubmit={resetPassword} className="flex flex-col gap-4.5">
          <BackButton onClick={() => switchMode('forgot')} />
          <h1 className="display text-[40px] leading-[0.9]">Nueva contraseña</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Ingresá el código que mandamos a <b className="text-foreground">{email}</b> y elegí tu nueva contraseña.
          </p>
          <CodeInput
            value={code}
            invalid={false}
            onChange={(value) => {
              setCode(value);
              setError(null);
            }}
          />
          <Field label="Nueva contraseña">
            {passwordInput}
            {strengthMeter}
          </Field>
          <ErrorText message={error} />
          <button type="submit" disabled={busy} className="btn-primary">
            {busy && <Icon name="circle-notch" className="animate-spin" />}
            Guardar contraseña
          </button>
        </form>
      )}
    </section>
  );
}
