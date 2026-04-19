// ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  // Get the current location object from React Router
  const { pathname } = useLocation();

  // Use useEffect to run this code whenever the pathname changes (a navigation occurs)
  useEffect(() => {
    // Scroll to the top-left corner of the window
    window.scrollTo(0, 0);
    // Alternatively, for a smooth scroll effect:
    // window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]); // This dependency array ensures the effect runs only when pathname changes

  // This component doesn't render anything, it just manages a side effect
  return null;
}
