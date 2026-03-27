import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { SeasonNavMenuProvider } from '../../context/SeasonNavMenuProvider';
import Navbar from './Navbar';
import SeasonNavDock from './SeasonNavDock';
import Footer from './Footer';
import SeasonRouteSync from './SeasonRouteSync';
import ScrollToTopOnNavigate from './ScrollToTopOnNavigate';
import { useModal } from '../../context/useModal';
import TeamMemberModal from '../modals/TeamMemberModal';
import TourRequestModal from '../modals/TourRequestModal';
import RouteFallback from '../shared/RouteFallback';

const Layout = () => {
  const { modal } = useModal();

  return (
    <div className="min-h-screen flex flex-col">
      <SeasonRouteSync />
      <ScrollToTopOnNavigate />
      <SeasonNavMenuProvider>
        <Navbar />
        <SeasonNavDock />
      </SeasonNavMenuProvider>
      <main className="flex-1 pt-16">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {modal.type === 'teamMember' && (
        <TeamMemberModal member={modal.payload} />
      )}
      {modal.type === 'tourRequest' && (
        <TourRequestModal key={modal.payload.tourId} payload={modal.payload} />
      )}
    </div>
  );
};

export default Layout;
