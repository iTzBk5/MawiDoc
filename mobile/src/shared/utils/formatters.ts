import { format, parseISO } from 'date-fns';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy HH:mm');
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString()} DZD`;
}

export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || '';
}

export function getDayNameAr(dayOfWeek: number): string {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[dayOfWeek] || '';
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: '#F59E0B',
    ACCEPTED: '#10B981',
    REJECTED: '#EF4444',
    CANCELLED: '#6B7280',
    COMPLETED: '#3B82F6',
  };
  return map[status] || '#6B7280';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
  };
  return map[status] || status;
}
