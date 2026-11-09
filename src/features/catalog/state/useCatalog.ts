import { useCallback } from 'react';
import { useServices } from '@/services/ServicesContext';
import { useAsync } from '@/shared/hooks/useAsync';

export function useCatalog() {
  const { products } = useServices();
  const load = useCallback(() => products.list(), [products]);
  return useAsync(load);
}
