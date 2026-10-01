import { PAGINATION } from '@/constants';

export interface PageParams {
  page: number;
  limit: number;
  skip: number;
}

/** Parses and clamps page/limit query params into safe values. */
export function getPageParams(query: Record<string, unknown>): PageParams {
  const page = Math.max(Number(query.page) || PAGINATION.DEFAULT_PAGE, 1);
  const rawLimit = Number(query.limit) || PAGINATION.DEFAULT_LIMIT;
  const limit = Math.min(Math.max(rawLimit, 1), PAGINATION.MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPageMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}
