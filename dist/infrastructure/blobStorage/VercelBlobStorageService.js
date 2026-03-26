"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VercelBlobStorageService = void 0;
const blob_1 = require("@vercel/blob");
const logger_1 = require("../../shared/utils/logger");
const config_1 = require("../../shared/config/config");
class VercelBlobStorageService {
    async upload(file, fileName, contentType, folder = 'uploads') {
        try {
            const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
            const pathname = `${folder}/${Date.now()}-${sanitizedFileName}`;
            const blob = await (0, blob_1.put)(pathname, file, {
                access: 'public',
                contentType,
                token: config_1.config.blobReadWriteToken,
            });
            logger_1.logger.info(`File uploaded to Vercel Blob: ${blob.url}`);
            return { url: blob.url, pathname: blob.pathname };
        }
        catch (error) {
            const err = error;
            logger_1.logger.error(`Vercel Blob upload failed: ${err.message}`);
            throw new Error(`File upload failed: ${err.message}`);
        }
    }
    async delete(url) {
        try {
            await (0, blob_1.del)(url, { token: config_1.config.blobReadWriteToken });
            logger_1.logger.info(`File deleted from Vercel Blob: ${url}`);
        }
        catch (error) {
            const err = error;
            logger_1.logger.error(`Vercel Blob delete failed: ${err.message}`);
            throw new Error(`File delete failed: ${err.message}`);
        }
    }
}
exports.VercelBlobStorageService = VercelBlobStorageService;
//# sourceMappingURL=VercelBlobStorageService.js.map