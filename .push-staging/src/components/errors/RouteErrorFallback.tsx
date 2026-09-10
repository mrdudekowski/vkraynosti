import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import RecoverableErrorView from './RecoverableErrorView';

const reloadPage = () => {
  window.location.reload();
};

const RouteErrorFallback = () => {
  const routeError = useRouteError();

  useEffect(() => {
    console.error('Route error caught:', routeError);
  }, [routeError]);

  return <RecoverableErrorView onRetry={reloadPage} />;
};

export default RouteErrorFallback;
