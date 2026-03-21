import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Не восстанавливать позицию скролла при F5 — иначе страница открывается внизу (у подвала).
if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider } from './context/ModalContext';
import { SeasonProvider } from './context/SeasonContext';
import ErrorBoundary from './components/errors/ErrorBoundary';
import { router } from './router';
import './bootstrap-fonts';
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
