import { format } from 'date-fns';

/** Локальная календарная дата → ISO `YYYY-MM-DD`. */
export const toIsoDate = (date: Date): string => format(date, 'yyyy-MM-dd');
