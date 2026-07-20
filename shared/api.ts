export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchQuery {
  name?: string;
  specialty?: string;
  city?: string;
  page?: number;
  limit?: number;
}

export interface NearbyQuery {
  lat: number;
  lng: number;
  radius?: number;
}
