import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useModal } from '../../context/ModalContext';
import { getToursBySeason } from '../../data/toursData';
import TourCard from '../shared/TourCard';
import { UI } from '../../constants/ui';
import { buildTourDetailPath } from '../../constants/routes';
import type { Season } from '../../types';

const SEASON_ORDER: Season[] = ['winter', 'spring', 'summer', 'fall'];

const TourConsultModal = () => {
  const { closeModal } = useModal();
  const navigate = useNavigate();
  const [activeSeason, setActiveSeason] = useState<Season>('winter');

  const tours = getToursBySeason(activeSeason);

  const handleTourClick = (season: string, tourId: string) => {
    navigate(buildTourDetailPath(season, tourId));
    closeModal();
  };

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 z-overlay"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Modal box */}
      <div
        className="fixed inset-0 z-modal flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label={UI.modal.consultTitle}
      >
        <div className="bg-white rounded-modal max-w-2xl w-full animate-scale-in flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="font-display text-2xl font-bold text-text-primary">
                {UI.modal.consultTitle}
              </h2>
              <p className="text-text-muted text-sm mt-1">{UI.modal.consultSub}</p>
            </div>
            <button
              onClick={closeModal}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-text-muted transition-all duration-hover ml-4 shrink-0"
              aria-label={UI.modal.close}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Season tabs */}
          <div className="flex border-b border-gray-100 px-6 shrink-0">
            {SEASON_ORDER.map(season => {
              const s = UI.seasons[season];
              return (
                <button
                  key={season}
                  onClick={() => setActiveSeason(season)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-hover -mb-px ${
                    activeSeason === season
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  {s.emoji} {s.label}
                </button>
              );
            })}
          </div>

          {/* Tours grid */}
          <div className="overflow-y-auto p-6 max-h-96">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tours.map(tour => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  compact
                  onClick={() => handleTourClick(tour.season, tour.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default TourConsultModal;
