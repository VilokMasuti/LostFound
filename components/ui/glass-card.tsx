/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

export interface GlassCardProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
  hover?: boolean;
  glow?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = true, glow = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={hover ? { y: -5, scale: 1.02 } : undefined}
        className={cn(
          'glass-card p-6 transition-all duration-300',
          hover && 'hover:shadow-2xl hover:shadow-primary/10',
          glow && 'glow-primary',
          className
        )}
        {...props}
      >
        <div className="relative z-10">
          {React.Children.toArray(children as React.ReactNode).filter(
            (child) =>
              typeof child !== 'object' ||
              child === null ||
              !('get' in child && typeof (child as any).get === 'function')
          )}
        </div>
        {glow && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-2xl" />
        )}
      </motion.div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

export { GlassCard };
