// ─────────────────────────────────────────────────────────
// @bingooo/types — Standardized API response/error shapes
// ─────────────────────────────────────────────────────────

/** Successful API response wrapper */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: ApiMeta;
  requestId: string;
}

/** Paginated metadata */
export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/** Error API response wrapper */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  requestId: string;
}

/** Structured error detail */
export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/** Known error codes from doc 05 */
export type ApiErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'PRODUCT_NOT_FOUND'
  | 'VARIANT_NOT_FOUND'
  | 'OUT_OF_STOCK'
  | 'CART_EMPTY'
  | 'PRICE_CHANGED'
  | 'COUPON_INVALID'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_VERIFICATION_FAILED'
  | 'ORDER_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

/** Pagination query parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Sort query parameters */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
