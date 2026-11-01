import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { configureAmplify } from '@/infrastructure/amplify/configure';
import { createServices } from '@/services/createServices';
import './index.css';

const services = createServices(configureAmplify() ? 'amplify' : 'local');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App services={services} />
  </StrictMode>,
);
