import type { HttpStatusCategoryFilter } from '@/libs/http-status-codes';

export const HTTP_STATUS_CATEGORY_OPTIONS: { value: HttpStatusCategoryFilter; label: string }[] = [
  { value: 'all', label: 'All classes' },
  { value: '1xx', label: '1xx Informational' },
  { value: '2xx', label: '2xx Success' },
  { value: '3xx', label: '3xx Redirection' },
  { value: '4xx', label: '4xx Client error' },
  { value: '5xx', label: '5xx Server error' },
];
