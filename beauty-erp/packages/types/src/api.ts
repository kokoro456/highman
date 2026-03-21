export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
