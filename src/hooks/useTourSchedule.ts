import { useContext } from 'react';
import { TourScheduleContext } from '../context/tour-schedule-context-definition';

export const useTourSchedule = () => {
  const context = useContext(TourScheduleContext);
  if (!context) {
    throw new Error('useTourSchedule must be used within TourScheduleProvider');
  }
  return context;
};
