import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from './constants/routes';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import WinterPage from './pages/seasons/WinterPage';
import SpringPage from './pages/seasons/SpringPage';
import SummerPage from './pages/seasons/SummerPage';
import FallPage from './pages/seasons/FallPage';
import TourDetailPage from './pages/TourDetailPage';
import SafetyPage from './pages/SafetyPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';

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
