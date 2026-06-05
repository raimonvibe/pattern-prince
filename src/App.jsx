import { useEffect, useRef } from 'react';
import { createGame, destroyGame, refreshGameScale } from './game/createGame.js';

export default function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    try {
      createGame(parent);
    } catch (err) {
      console.error(err);
      parent.innerHTML =
        '<p style="color:#fff;font-family:monospace;padding:24px;text-align:center">Game failed to load</p>';
      return;
    }

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshGameScale, 80);
    };

    const onOrientation = () => setTimeout(onResize, 150);

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrientation);
    window.visualViewport?.addEventListener('resize', onResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrientation);
      window.visualViewport?.removeEventListener('resize', onResize);
      destroyGame();
    };
  }, []);

  return <div id="game-container" ref={containerRef} />;
}
