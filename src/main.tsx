import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider } from './context/ModalContext';
import { SeasonProvider } from './context/SeasonContext';
import ErrorBoundary from './components/errors/ErrorBoundary';
import { router } from './router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <SeasonProvider>
          <ModalProvider>
            <RouterProvider router={router} />
          </ModalProvider>
        </SeasonProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);
