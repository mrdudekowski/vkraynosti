import { Navigate } from 'react-router-dom';
import { adminCalendarSeason } from './adminCalendarSeason';
import { ADMIN_PATHS } from './constants/routes';

const ToursPage = () => <Navigate to={ADMIN_PATHS.season(adminCalendarSeason())} replace />;

export default ToursPage;
