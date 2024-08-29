import { useEffect, useCallback, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AutoLogout = () => {
  const { logout } = useAuth0();
  const timer = useRef(null);

  const startTimer = useCallback(() => {
    timer.current = setTimeout(() => {
      logout({ returnTo: window.location.origin });
    }, 60 * 60 * 1000); 
  }, [logout]);

  const resetTimer = useCallback(() => {
    clearTimeout(timer.current);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    const handleMouseMove = () => resetTimer();
    const handleKeyPress = () => resetTimer();

    startTimer();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keypress', handleKeyPress);

    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [resetTimer, startTimer]);

  return null;
}

export default AutoLogout;
