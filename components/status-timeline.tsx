'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Circle, Search, Sparkles } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: 'searching' | 'matched' | 'resolved';
  type: 'lost' | 'found';
  className?: string;
}

export function StatusTimeline({
  currentStatus,
  type,
  className = '',
}: StatusTimelineProps) {
  const steps = [
    {
      id: 'submitted',
      title: 'Report Submitted',
      description: `Your ${type} phone report is now live`,
      icon: Circle,
      status: 'completed' as const,
    },
    {
      id: 'searching',
      title: 'Searching for Matches',
      description: 'Our system is looking for potential matches',
      icon: Search,
      status:
        currentStatus === 'searching'
          ? ('current' as const)
          : ('completed' as const),
    },
    {
      id: 'matched',
      title: 'Match Found',
      description: 'We found a potential match for your phone',
      icon: Sparkles,
      status:
        currentStatus === 'matched'
          ? ('current' as const)
          : currentStatus === 'resolved'
          ? ('completed' as const)
          : ('pending' as const),
    },
    {
      id: 'resolved',
      title: 'Case Resolved',
      description: 'Your phone has been successfully returned!',
      icon: CheckCircle,
      status:
        currentStatus === 'resolved'
          ? ('completed' as const)
          : ('pending' as const),
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-4 relative"
        >
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`absolute left-4 top-8 w-0.5 h-12 ${
                step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
              }`}
            />
          )}

          {/* Step Icon */}
          <div className="flex-shrink-0">
            {step.status === 'completed' ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
              >
                <CheckCircle className="w-5 h-5 text-white" />
              </motion.div>
            ) : step.status === 'current' ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
              >
                <step.icon className="w-5 h-5 text-primary-foreground animate-pulse" />
              </motion.div>
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center">
                <step.icon className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Step Content */}
          <div className="flex-1 min-w-0">
            <h4
              className={`font-medium ${
                step.status === 'completed'
                  ? 'text-green-600'
                  : step.status === 'current'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {step.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {step.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
