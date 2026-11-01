import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useServices } from '@/services/ServicesContext';
import { toErrorMessage } from '@/shared/lib/errors';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/fields';
import { DEMO_ACCOUNTS } from '../infrastructure/localAuthGateway';
import { useAuth } from '../state/AuthContext';
import { AuthCard } from './AuthCard';

export function LoginPage() {
  const { signIn } = useAuth();
  const { dataSource } = useServices();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signIn({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (cause) {
      setError(toErrorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Iniciar sesión"
      subtitle={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-violet-600 hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <TextField label="Correo" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Contraseña" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" size="lg" loading={submitting}>
          Entrar
        </Button>
      </form>

      {dataSource === 'local' && (
        <div className="mt-6 rounded-lg bg-zinc-50 p-4 text-xs text-zinc-600">
          <p className="mb-2 font-medium text-zinc-700">Cuentas demo (modo local)</p>
          <ul className="flex flex-col gap-1">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.id}>
                <button
                  type="button"
                  className="text-left hover:text-violet-700"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                >
                  <span className="font-mono">{account.email}</span> / <span className="font-mono">{account.password}</span> ({account.role})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AuthCard>
  );
}
