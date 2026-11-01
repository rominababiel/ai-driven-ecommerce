import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { toErrorMessage } from '@/shared/lib/errors';
import { EMAIL_PATTERN } from '@/shared/lib/validation';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/fields';
import { useAuth } from '../state/AuthContext';
import { AuthCard } from './AuthCard';

const MIN_PASSWORD_LENGTH = 8;

export function RegisterPage() {
  const { signUp, confirmSignUp, signIn } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'details' | 'confirm'>('details');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setSubmitting(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(toErrorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  };

  const completeRegistration = async () => {
    await signIn({ email, password });
    navigate('/', { replace: true });
  };

  const handleDetails = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) return setError('Ingresa un correo válido');
    if (password.length < MIN_PASSWORD_LENGTH) return setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
    void run(async () => {
      const { needsConfirmation } = await signUp({ email, password });
      if (needsConfirmation) setStep('confirm');
      else await completeRegistration();
    });
  };

  const handleConfirm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run(async () => {
      await confirmSignUp(email, code);
      await completeRegistration();
    });
  };

  if (step === 'confirm') {
    return (
      <AuthCard title="Confirma tu cuenta" subtitle={`Enviamos un código a ${email}`}>
        <form onSubmit={handleConfirm} className="flex flex-col gap-4">
          {error && <Alert tone="error">{error}</Alert>}
          <TextField label="Código de verificación" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="submit" size="lg" loading={submitting}>
            Confirmar
          </Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-violet-600 hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleDetails} className="flex flex-col gap-4" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <TextField label="Correo" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Contraseña" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" size="lg" loading={submitting}>
          Crear cuenta
        </Button>
      </form>
    </AuthCard>
  );
}
