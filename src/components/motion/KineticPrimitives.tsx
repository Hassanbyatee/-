import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

gsap.registerPlugin(ScrollTrigger);

const SETTLE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface SpotlightTiltCardProps {
  children: React.ReactNode;
  className?: string;
  enableTilt?: boolean;
  spotlightColor?: string;
}

/**
 * React Bits-inspired interactive card with GPU-only 3D micro-tilt and cursor-tracked radial spotlight.
 * Falls back gracefully on touch devices and prefers-reduced-motion.
 */
export const SpotlightTiltCard: React.FC<SpotlightTiltCardProps> = ({
  children,
  className = '',
  enableTilt = true,
  spotlightColor = 'rgba(7, 112, 227, 0.07)',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || prefersReduced) return;
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--spot-x', `${x}px`);
    el.style.setProperty('--spot-y', `${y}px`);

    if (enableTilt) {
      const rx = ((y / rect.height) - 0.5) * -4.5;
      const ry = ((x / rect.width) - 0.5) * 4.5;
      el.style.transform = `perspective(950px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-2px)`;
    }
  };

  const handleMouseEnter = () => {
    if (prefersReduced) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = '';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-[transform,box-shadow,border-color] duration-200 ease-out will-change-transform ${className}`}
    >
      {!prefersReduced && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(380px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${spotlightColor}, transparent 70%)`,
          }}
        />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * GSAP ScrollTrigger-powered counter with tabular-nums formatting and instant fallback under reduced motion.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const elRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(value);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced || value <= 0) {
      setDisplayValue(value);
      return;
    }

    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: value,
        duration: 1.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: elRef.current,
          start: 'top 92%',
          once: true,
        },
        onUpdate: () => {
          setDisplayValue(Math.round(obj.val));
        },
      });
    }, elRef);

    return () => ctx.revert();
  }, [value, prefersReduced]);

  return (
    <span ref={elRef} className={`tabular-nums ${className}`}>
      {prefix}
      {displayValue.toLocaleString('en-US')}
      {suffix}
    </span>
  );
};

/**
 * Hook for subtle GSAP ScrollTrigger staggered entrance animations on child cards/items.
 * Always clears transform/opacity after completion and leaves content visible when reduced motion is active.
 */
export function useGsapStaggerReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  itemSelector: string,
  deps: React.DependencyList = []
) {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>(itemSelector);
      if (targets.length === 0) return;

      gsap.fromTo(
        targets,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.06,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 88%',
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReduced, ...deps]);
}

interface PageTransitionProps {
  viewKey: string;
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ viewKey, children }) => {
  const prefersReduced = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={viewKey}
        initial={prefersReduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReduced ? undefined : { opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: SETTLE_EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

interface ModalBackdropProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const AnimatedModalShell: React.FC<ModalBackdropProps> = ({
  isOpen,
  onClose,
  children,
  maxWidthClass = 'max-w-lg',
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18, ease: SETTLE_EASE }}
          onClick={(e) => {
            if (e.target === e.currentTarget && onClose) onClose();
          }}
          className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-[3px] flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.24, ease: SETTLE_EASE }}
            className={`w-full ${maxWidthClass} my-8`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
