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
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number, meta?: ApiSuccessResponse["meta"]) => Response;
export declare const sendError: (res: Response, message: string, statusCode?: number, code?: string, errors?: unknown[]) => Response;
export declare const sendPaginated: <T>(res: Response, data: T[], total: number, page: number, limit: number, message?: string) => Response;
export {};
//# sourceMappingURL=apiResponse.d.ts.map