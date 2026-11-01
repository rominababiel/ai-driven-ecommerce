import { Link } from 'react-router';
import { buttonStyles } from '@/shared/ui/buttonStyles';
import { EmptyState } from '@/shared/ui/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      title="Página no encontrada"
      description="La página que buscas no existe o fue movida."
      action={<Link to="/" className={buttonStyles()}>Volver al inicio</Link>}
    />
  );
}
