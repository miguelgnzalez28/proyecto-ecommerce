import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page views or perform navigation-related tasks
    // This can be extended for analytics, etc.
    console.log('Navigation to:', location.pathname);
  }, [location]);

  return null;
}
