'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Truck, Package, MapPin, XCircle } from 'lucide-react';

interface TimelineStep {
  status: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const ORDER_STEPS: TimelineStep[] = [
  { status: 'PENDING', label: 'Order Placed', icon: Package, description: 'Your order has been received' },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2, description: 'Order confirmed by admin' },
  { status: 'ASSIGNED', label: 'Driver Assigned', icon: Truck, description: 'A driver has been assigned' },
  { status: 'IN_TRANSIT', label: 'In Transit', icon: MapPin, description: 'Your order is on the way' },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2, description: 'Order delivered successfully' },
];

interface OrderTimelineProps {
  currentStatus: string;
  showLabels?: boolean;
  compact?: boolean;
}

export default function OrderTimeline({ currentStatus, showLabels = true, compact = false }: OrderTimelineProps) {
  const isCancelled = currentStatus === 'CANCELLED';
  const currentIndex = ORDER_STEPS.findIndex((step) => step.status === currentStatus);

  const getStepState = (stepIndex: number) => {
    if (isCancelled) return 'cancelled';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center gap-3 py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center"
        >
          <XCircle className="w-6 h-6 text-red-400" />
        </motion.div>
        <div>
          <p className="font-bold text-red-400">Order Cancelled</p>
          <p className="text-sm text-gray-500">This order has been cancelled</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${compact ? 'py-4' : 'py-6'}`}>
      {/* Horizontal Timeline for compact or vertical for full */}
      {compact ? (
        <CompactTimeline steps={ORDER_STEPS} getStepState={getStepState} />
      ) : (
        <FullTimeline steps={ORDER_STEPS} getStepState={getStepState} />
      )}
    </div>
  );
}

function CompactTimeline({ steps, getStepState }: { steps: TimelineStep[]; getStepState: (i: number) => string }) {
  const currentIndex = steps.findIndex((_, i) => getStepState(i) === 'current');

  return (
    <div className="relative">
      {/* Progress Line Background */}
      <div className="absolute top-5 left-5 right-5 h-1 bg-gray-700/50 rounded-full" />

      {/* Animated Progress Line */}
      <motion.div
        className="absolute top-5 left-5 h-1 rounded-full"
        style={{
          background: 'linear-gradient(90deg, #06b6d4, #0ea5e9, #3b82f6)',
        }}
        initial={{ width: '0%' }}
        animate={{
          width: currentIndex >= 0 ? `${(currentIndex / (steps.length - 1)) * 100}%` : '0%',
        }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />

      {/* Glowing dot at progress end */}
      {currentIndex >= 0 && (
        <motion.div
          className="absolute top-3.5 w-3 h-3 rounded-full bg-cyan-400"
          initial={{ left: '0%', opacity: 0 }}
          animate={{
            left: `calc(${(currentIndex / (steps.length - 1)) * 100}% + 10px)`,
            opacity: 1,
          }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.8), 0 0 40px rgba(6, 182, 212, 0.4)',
          }}
        />
      )}

      {/* Step Dots */}
      <div className="relative flex justify-between">
        {steps.map((step, i) => {
          const state = getStepState(i);
          return (
            <motion.div
              key={step.status}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  state === 'completed'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'
                    : state === 'current'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50'
                    : 'bg-gray-700/50 border-2 border-gray-600'
                }`}
                whileHover={{ scale: 1.15 }}
                animate={
                  state === 'current'
                    ? {
                        boxShadow: [
                          '0 0 0 0 rgba(6, 182, 212, 0.4)',
                          '0 0 0 12px rgba(6, 182, 212, 0)',
                          '0 0 0 0 rgba(6, 182, 212, 0)',
                        ],
                      }
                    : {}
                }
                transition={
                  state === 'current'
                    ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.3 }
                }
              >
                <step.icon
                  className={`w-5 h-5 ${
                    state === 'completed' || state === 'current' ? 'text-white' : 'text-gray-500'
                  }`}
                />
                {state === 'completed' && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-cyan-400/20"
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  />
                )}
              </motion.div>
              <span
                className={`text-xs mt-2 font-medium ${
                  state === 'current'
                    ? 'text-cyan-400'
                    : state === 'completed'
                    ? 'text-gray-300'
                    : 'text-gray-600'
                }`}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function FullTimeline({ steps, getStepState }: { steps: TimelineStep[]; getStepState: (i: number) => string }) {
  return (
    <div className="relative space-y-1">
      {steps.map((step, i) => {
        const state = getStepState(i);
        const isLast = i === steps.length - 1;

        return (
          <motion.div
            key={step.status}
            className="relative flex gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
          >
            {/* Dot and Line Column */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <motion.div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  state === 'completed'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'
                    : state === 'current'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50'
                    : 'bg-gray-700/50 border-2 border-gray-600'
                }`}
                animate={
                  state === 'current'
                    ? {
                        boxShadow: [
                          '0 0 0 0 rgba(6, 182, 212, 0.4)',
                          '0 0 0 12px rgba(6, 182, 212, 0)',
                          '0 0 0 0 rgba(6, 182, 212, 0)',
                        ],
                      }
                    : {}
                }
                transition={
                  state === 'current'
                    ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.3 }
                }
              >
                <step.icon
                  className={`w-5 h-5 ${
                    state === 'completed' || state === 'current' ? 'text-white' : 'text-gray-500'
                  }`}
                />
              </motion.div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="relative w-0.5 h-full min-h-[40px] bg-gray-700/50">
                  <motion.div
                    className="absolute top-0 left-0 w-full rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, #06b6d4, #0ea5e9)',
                    }}
                    initial={{ height: '0%' }}
                    animate={{
                      height: state === 'completed' ? '100%' : state === 'current' ? '50%' : '0%',
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 + 0.2 }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 pt-1 ${isLast ? 'pb-0' : ''}`}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.15 + 0.1 }}
              >
                <p
                  className={`font-bold ${
                    state === 'current'
                      ? 'text-cyan-400'
                      : state === 'completed'
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-sm ${
                    state === 'current'
                      ? 'text-gray-300'
                      : state === 'completed'
                      ? 'text-gray-400'
                      : 'text-gray-700'
                  }`}
                >
                  {step.description}
                </p>
                {state === 'current' && (
                  <motion.div
                    className="flex items-center gap-2 mt-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs text-cyan-400 font-medium">Current Status</span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
