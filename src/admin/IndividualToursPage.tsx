import { Navigate } from 'react-router-dom';
import { ADMIN_PATHS } from './constants/routes';

const IndividualToursPage = () => <Navigate to={ADMIN_PATHS.tours} replace />;

export default IndividualToursPage;
