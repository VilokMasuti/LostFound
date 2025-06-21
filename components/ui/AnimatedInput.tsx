'use client';

import type React from 'react';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { forwardRef, useState } from 'react';

export interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, type, label, icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    return (
      <div className="relative">
        <motion.div
          className="relative"
          initial={false}
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-xl glass border-2 border-transparent bg-transparent px-4 py-3 text-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:glow-primary disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-12',
              className
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              setHasValue(e.target.value.length > 0);
            }}
            {...props}
          />

          {icon && (
            <motion.div
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              animate={{
                color: isFocused
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--muted-foreground))',
                scale: isFocused ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}

          {label && (
            <motion.label
              className="absolute left-4 text-sm text-muted-foreground pointer-events-none"
              animate={{
                y: isFocused || hasValue ? -32 : 12,
                scale: isFocused || hasValue ? 0.85 : 1,
                color: isFocused
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--muted-foreground))',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {label}
            </motion.label>
          )}
        </motion.div>
      </div>
    );
  }
);
AnimatedInput.displayName = 'AnimatedInput';

export { AnimatedInput };
