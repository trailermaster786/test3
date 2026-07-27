import { BOTTLE_STATUSES } from './constants';

export type BottleStatus = keyof typeof BOTTLE_STATUSES;

const VALID_TRANSITIONS: Record<string, string[]> = {
  IN_FACTORY: ['LOADED_ON_TRUCK'],
  LOADED_ON_TRUCK: ['DELIVERED'],
  DELIVERED: ['COLLECTED'],
  COLLECTED: ['BACK_AT_FACTORY'],
  BACK_AT_FACTORY: ['LOADED_ON_TRUCK', 'FLAGGED_FOR_DESTRUCTION'],
  FLAGGED_FOR_DESTRUCTION: ['DESTROYED'],
};

export function canTransition(currentStatus: string, nextStatus: string): boolean {
  return VALID_TRANSITIONS[currentStatus]?.includes(nextStatus) || false;
}

export function getValidTransitions(currentStatus: string): string[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}

export function getNextStatus(currentStatus: string): string | null {
  const transitions: Record<string, string> = {
    IN_FACTORY: 'LOADED_ON_TRUCK',
    LOADED_ON_TRUCK: 'DELIVERED',
    DELIVERED: 'COLLECTED',
    COLLECTED: 'BACK_AT_FACTORY',
  };
  return transitions[currentStatus] || null;
}

export function shouldFlagForDestruction(refillCount: number, maxRefills: number): boolean {
  return refillCount >= maxRefills;
}

export function calculateDiscount(
  subtotal: number,
  promoType: string,
  promoValue: number,
  minOrder: number
): number {
  if (subtotal < minOrder) return 0;
  if (promoType === 'percentage') {
    return subtotal * (promoValue / 100);
  }
  return Math.min(promoValue, subtotal);
}

export function getStatusTimeline(status: string): { label: string; completed: boolean; current: boolean }[] {
  const steps = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'];
  const statusIndex = steps.indexOf(status);

  if (status === 'CANCELLED') {
    return [
      { label: 'Pending', completed: true, current: false },
      { label: 'Cancelled', completed: false, current: true },
    ];
  }

  return steps.map((step, index) => ({
    label: step.replace('_', ' '),
    completed: index < statusIndex,
    current: index === statusIndex,
  }));
}
