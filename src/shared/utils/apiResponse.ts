import { Response } from 'express';

interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: unknown[];
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: ApiSuccessResponse['meta'],
): Response => {
  const response: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  errors?: unknown[],
): Response => {
  const response: ApiErrorResponse = {
    success: false,
    message,
    ...(code && { code }),
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success',
): Response => {
  return sendSuccess(res, data, message, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};
