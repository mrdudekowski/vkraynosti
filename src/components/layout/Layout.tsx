import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SeasonRouteSync from './SeasonRouteSync';
import { useModal } from '../../context/ModalContext';
import TeamMemberModal from '../modals/TeamMemberModal';

const Layout = () => {
  const { modal } = useModal();

  return (
    <div className="min-h-screen flex flex-col">
      <SeasonRouteSync />
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      {modal.type === 'teamMember' && modal.payload && (
        <TeamMemberModal member={modal.payload} />
      )}
    </div>
  );
};

export default Layout;
