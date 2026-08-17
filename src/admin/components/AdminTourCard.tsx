import { Link } from 'react-router-dom';
import PlaceholderImage from '../../components/shared/PlaceholderImage';
import { IMAGES } from '../../constants/images';
import type { AdminTourListItem } from '../api';
import { adminTourVisibility } from '../adminTourVisibility';
import { ADMIN_PATHS } from '../constants/routes';
import { ADMIN_UI } from '../constants/ui';
import AdminBadge from './AdminBadge';

type AdminTourCardProps = {
  tour: AdminTourListItem;
};

const AdminTourCard = ({ tour }: AdminTourCardProps) => {
  const visibility = adminTourVisibility(tour);
  return (
    <Link
      to={ADMIN_PATHS.tour(tour.id)}
      className="card-base flex h-full w-full max-h-tour-card max-w-tour-card flex-col justify-self-center no-underline text-inherit"
    >
      <div className="h-48 overflow-hidden rounded-t-card">
        <PlaceholderImage
          src={tour.imageUrl ?? IMAGES.tours.placeholder}
          alt=""
          className="h-full w-full"
          imgClassName="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-card-p">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 font-heading text-card leading-tight text-text-primary">
            {tour.title}
          </h3>
          <AdminBadge tone={visibility === 'on_site' ? 'success' : 'neutral'}>
            {ADMIN_UI.tourVisibility[visibility]}
          </AdminBadge>
        </div>
      </div>
    </Link>
  );
};

export default AdminTourCard;
