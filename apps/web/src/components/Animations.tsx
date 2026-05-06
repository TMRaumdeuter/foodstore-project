'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

export function Toast({ message, isVisible, onClose, type = 'success' }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const bgColors = {
    success: 'linear-gradient(135deg, #10b981, #059669)',
    error: 'linear-gradient(135deg, #ef4444, #dc2626)',
    info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  };

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            position: 'fixed',
            top: 'calc(var(--header-height, 70px) + 16px)',
            right: '16px',
            zIndex: 10000,
            background: bgColors[type],
            color: '#fff',
            padding: '14px 24px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            maxWidth: '380px',
          }}
          onClick={onClose}
        >
          <span style={{ fontSize: '18px' }}>{icons[type]}</span>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Fly To Cart Animation ─── */
interface FlyToCartProps {
  startX: number;
  startY: number;
  image?: string;
  onComplete: () => void;
}

export function FlyToCartAnimation({ startX, startY, image, onComplete }: FlyToCartProps) {
  const cartIcon = document.querySelector('[data-cart-icon]');
  const endX = cartIcon ? cartIcon.getBoundingClientRect().left + 12 : window.innerWidth - 80;
  const endY = cartIcon ? cartIcon.getBoundingClientRect().top + 12 : 30;

  return (
    <motion.div
      initial={{
        position: 'fixed',
        left: startX,
        top: startY,
        width: 60,
        height: 60,
        zIndex: 9999,
        opacity: 1,
        scale: 1,
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        pointerEvents: 'none' as const,
      }}
      animate={{
        left: endX,
        top: endY,
        width: 24,
        height: 24,
        opacity: 0,
        scale: 0.3,
      }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={onComplete}
    >
      {image ? (
        <img
          src={image}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        '🍽️'
      )}
    </motion.div>
  );
}

/* ─── Staggered Children Container ─── */
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerContainer({ children, className, delay = 0 }: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Staggered Item ─── */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.96 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', damping: 20, stiffness: 260 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Fade In When Visible ─── */
export function FadeInView({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Scale on Hover Card ─── */
export function HoverCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Cart Badge Pop ─── */
export function CartBadge({ count }: { count: number }) {
  return (
    <AnimatePresence mode="popLayout">
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 400 }}
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            background: 'var(--color-primary, #e74c3c)',
            color: '#fff',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
