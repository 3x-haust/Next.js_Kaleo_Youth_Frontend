'use client';

import { useEffect, useRef, useState } from 'react';
import { HeroVideo } from './home.styled';

type MotionState = 'pending' | 'playing' | 'paused';

export function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [motion, setMotion] = useState<MotionState>('pending');

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => {
      const video = videoRef.current;
      if (!video) return;
      if (preference.matches) {
        video.pause();
        setMotion('paused');
        return;
      }
      void video.play().then(
        () => setMotion('playing'),
        () => setMotion('paused'),
      );
    };

    syncPreference();
    preference.addEventListener('change', syncPreference);
    return () => preference.removeEventListener('change', syncPreference);
  }, []);

  return (
    <HeroVideo
      ref={videoRef}
      src="/videos/main.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      data-motion={motion}
    />
  );
}
