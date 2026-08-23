'use client';

import {
  type CSSProperties,
  type ReactNode,
  useSyncExternalStore,
} from 'react';
import {
  motion,
  type HTMLMotionProps,
} from 'motion/react';
import styled from 'styled-components';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function reducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function useReducedMotion() {
  return useSyncExternalStore(subscribeToReducedMotion, reducedMotionSnapshot, () => false);
}

const RevealRoot = styled(motion.div)`
  will-change: opacity, transform;

  @media (prefers-reduced-motion: reduce) {
    opacity: 1 !important;
    transform: none !important;
    will-change: auto;
  }
`;

const RouteTransitionRoot = styled(motion.div)`
  min-height: 100%;

  @media (prefers-reduced-motion: reduce) {
    opacity: 1 !important;
    transform: none !important;
    will-change: auto;
  }
`;

type RevealProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  delay?: number;
  once?: boolean;
  threshold?: number;
};

export function Reveal({
  children,
  className,
  delay = 0,
  once = true,
  threshold = 0.15,
  style,
  ...props
}: RevealProps) {
  const motionStyle = {
    ...style,
    '--motion-delay': `${Math.max(0, delay)}ms`,
  } as CSSProperties;

  return (
    <RevealRoot
      className={className}
      data-motion-reveal="true"
      style={motionStyle}
      initial={{ opacity: 0, y: 32, scale: 0.992 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once, amount: threshold }}
      transition={{
        duration: 0.6,
        delay: Math.max(0, delay) / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...props}
    >
      {children}
    </RevealRoot>
  );
}

type RouteTransitionProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
};

export function RouteTransition({ children, className, ...props }: RouteTransitionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <RouteTransitionRoot
      className={className}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      suppressHydrationWarning
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              duration: 0.48,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      {...props}
    >
      {children}
    </RouteTransitionRoot>
  );
}
