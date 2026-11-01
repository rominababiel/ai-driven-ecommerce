import { createContext, useContext } from 'react';
import type { Services } from './services';

export const ServicesContext = createContext<Services | null>(null);

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('useServices debe usarse dentro de ServicesContext');
  return services;
}
