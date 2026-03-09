import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useModal } from '../../context/ModalContext';
import TeamMemberModal from '../modals/TeamMemberModal';
import TourConsultModal from '../modals/TourConsultModal';

const Layout = () => {
  const { modal } = useModal();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      {modal.type === 'teamMember' && modal.payload && (
        <TeamMemberModal member={modal.payload} />
      )}
      {modal.type === 'tourConsult' && (
        <TourConsultModal />
      )}
    </div>
  );
};

export default Layout;
