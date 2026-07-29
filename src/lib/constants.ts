export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  ASSIGNED: 'ASSIGNED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export const BOTTLE_STATUSES = {
  IN_FACTORY: 'IN_FACTORY',
  LOADED_ON_TRUCK: 'LOADED_ON_TRUCK',
  DELIVERED: 'DELIVERED',
  COLLECTED: 'COLLECTED',
  BACK_AT_FACTORY: 'BACK_AT_FACTORY',
  FLAGGED_FOR_DESTRUCTION: 'FLAGGED_FOR_DESTRUCTION',
  DESTROYED: 'DESTROYED',
} as const;

export const BOTTLE_EVENT_TYPES = {
  GENERATED: 'GENERATED',
  LOADED: 'LOADED',
  DELIVERED: 'DELIVERED',
  COLLECTED: 'COLLECTED',
  RETURNED: 'RETURNED',
  DESTROYED: 'DESTROYED',
  SCANNED: 'SCANNED',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  ASSIGNED: 'Assigned',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  ASSIGNED: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  IN_TRANSIT: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  DELIVERED: 'bg-green-500/20 text-green-300 border border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-300 border border-red-500/30',
};

export const BOTTLE_STATUS_LABELS: Record<string, string> = {
  IN_FACTORY: 'In Factory',
  LOADED_ON_TRUCK: 'Loaded on Truck',
  DELIVERED: 'Delivered',
  COLLECTED: 'Collected',
  BACK_AT_FACTORY: 'Back at Factory',
  FLAGGED_FOR_DESTRUCTION: 'Flagged for Destruction',
  DESTROYED: 'Destroyed',
};

export const BOTTLE_STATUS_COLORS: Record<string, string> = {
  IN_FACTORY: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
  LOADED_ON_TRUCK: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  DELIVERED: 'bg-green-500/20 text-green-300 border border-green-500/30',
  COLLECTED: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  BACK_AT_FACTORY: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  FLAGGED_FOR_DESTRUCTION: 'bg-red-500/20 text-red-300 border border-red-500/30',
  DESTROYED: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
};

export const ROLES = {
  CUSTOMER: 'customer',
  DRIVER: 'driver',
  ADMIN: 'admin',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  customer: 'Customer',
  driver: 'Driver',
  admin: 'Admin',
};
