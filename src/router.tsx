import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from './constants/routes';
import Layout from './components/layout/Layout';
import Home from './pages/Home';

const WinterPage = lazy(() => import('./pages/seasons/WinterPage'));
const SpringPage = lazy(() => import('./pages/seasons/SpringPage'));
const SummerPage = lazy(() => import('./pages/seasons/SummerPage'));
const FallPage = lazy(() => import('./pages/seasons/FallPage'));
const TourDetailPage = lazy(() => import('./pages/TourDetailPage'));
const SafetyPage = lazy(() => import('./pages/SafetyPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export const router = createBrowserRouter(
  [
    {
      path: ROUTES.HOME,
      element: <Layout />,
      children: [
        { index: true,              element: <Home /> },
        { path: ROUTES.WINTER,      element: <WinterPage /> },
        { path: ROUTES.SPRING,      element: <SpringPage /> },
        { path: ROUTES.SUMMER,      element: <SummerPage /> },
        { path: ROUTES.FALL,        element: <FallPage /> },
        { path: ROUTES.TOUR_DETAIL, element: <TourDetailPage /> },
        { path: ROUTES.SAFETY,      element: <SafetyPage /> },
        { path: ROUTES.PRIVACY,     element: <PrivacyPage /> },
        { path: '*',                element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL }
);
