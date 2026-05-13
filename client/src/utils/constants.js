// Application constants
export const NOTIFICATION_TYPES = {
  APPOINTMENT: 'appointment',
  VACCINATION: 'vaccination',
  HEALTH_ALERT: 'healthAlert',
  ORDER: 'order',
  MATCH_REQUEST: 'matchRequest',
  ADOPTION_REQUEST: 'adoptionRequest',
  MESSAGE: 'message',
  SYSTEM: 'system'
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
};

export const MATCH_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  BLOCKED: 'blocked'
};

export const ADOPTION_STATUS = {
  AVAILABLE: 'available',
  REQUESTED: 'requested',
  APPROVED: 'approved',
  ADOPTED: 'adopted'
};

export const USER_ACCOUNT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  BLOCKED: 'blocked',
  SUSPENDED: 'suspended'
};

export const SERVICE_TYPES = {
  VETERINARY: 'veterinary',
  GROOMING: 'grooming',
  TRAINING: 'training'
};
