import { lazy, Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { SeasonNavMenuProvider } from '../../context/SeasonNavMenuProvider';
import {
  HomeNavbarChromeProvider,
} from '../../context/HomeNavbarChromeContext';
import { useHomeNavbarChrome } from '../../context/useHomeNavbarChrome';
import Navbar from './Navbar';
import SeasonNavDock from './SeasonNavDock';
import Footer from './Footer';
import SeasonRouteSync from './SeasonRouteSync';
import ScrollToTopOnNavigate from './ScrollToTopOnNavigate';
import ScrollRestoration from './ScrollRestoration';
import { useModal } from '../../context/useModal';
import RouteFallback from '../shared/RouteFallback';
import ModalLazyChunkFallback from '../shared/ModalLazyChunkFallback';

const TeamMemberModal = lazy(() => import('../modals/TeamMemberModal'));
const TourRequestModal = lazy(() => import('../modals/TourRequestModal'));

function LayoutChrome() {
  const { pathname } = useLocation();
  const { resetHomeNavbarChrome } = useHomeNavbarChrome();

  useEffect(() => {
    if (pathname !== ROUTES.HOME) {
      resetHomeNavbarChrome();
    }
  }, [pathname, resetHomeNavbarChrome]);

  return (
    <>
      <Navbar />
      <SeasonNavDock />
      <LayoutMain />
      <Footer />
    </>
  );
}

function LayoutMain() {
  const { pathname } = useLocation();
  const { snap } = useHomeNavbarChrome();
  /** Главная: оверлей под навбаром только при десктопных воротах; на мобильном — `pt-16` как на внутренних страницах. */
  const mainPad =
    pathname === ROUTES.HOME
      ? snap.homeFlushWithViewportTop
        ? 'pt-0'
        : snap.mainUsesNavbarTopPadding
          ? 'pt-16'
          : 'pt-0'
      : snap.mainUsesNavbarTopPadding
        ? 'pt-16'
        : 'pt-0';
  /** Чёрный фон старта только при десктопных воротах; на мобильной главной — без полосы «gate» под навбаром. */
  const mainHomeStartBg =
    pathname === ROUTES.HOME && snap.homeFlushWithViewportTop ? 'bg-home-gate-start-screen' : '';

  return (
    <main className={`flex-1 ${mainPad} ${mainHomeStartBg}`.trim()}>
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
    </main>
  );
}

const Layout = () => {
  const { modal } = useModal();

  return (
    <div className="min-h-screen flex flex-col">
      <SeasonRouteSync />
      <ScrollToTopOnNavigate />
      <ScrollRestoration />
      <SeasonNavMenuProvider>
        <HomeNavbarChromeProvider>
          <LayoutChrome />
        </HomeNavbarChromeProvider>
      </SeasonNavMenuProvider>
      {modal.type === 'teamMember' && (
        <Suspense fallback={<ModalLazyChunkFallback />}>
          <TeamMemberModal member={modal.payload} />
        </Suspense>
      )}
      {modal.type === 'tourRequest' && (
        <Suspense fallback={<ModalLazyChunkFallback />}>
          <TourRequestModal key={modal.payload.tourId} payload={modal.payload} />
        </Suspense>
      )}
    </div>
  );
};

export default Layout;
