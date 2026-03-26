import { put, del } from '@vercel/blob';
import { IBlobStorageService } from '../../domain/interfaces/IBlobStorageService';
import { logger } from '../../shared/utils/logger';
import { config } from '../../shared/config/config';

export class VercelBlobStorageService implements IBlobStorageService {
  async upload(
    file: Buffer,
    fileName: string,
    contentType: string,
    folder: string = 'uploads',
  ): Promise<{ url: string; pathname: string }> {
    try {
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const pathname = `${folder}/${Date.now()}-${sanitizedFileName}`;

      const blob = await put(pathname, file, {
        access: 'public',
        contentType,
        token: config.blobReadWriteToken,
      });

      logger.info(`File uploaded to Vercel Blob: ${blob.url}`);
      return { url: blob.url, pathname: blob.pathname };
    } catch (error) {
      const err = error as Error;
      logger.error(`Vercel Blob upload failed: ${err.message}`);
      throw new Error(`File upload failed: ${err.message}`);
    }
  }

  async delete(url: string): Promise<void> {
    try {
      await del(url, { token: config.blobReadWriteToken });
      logger.info(`File deleted from Vercel Blob: ${url}`);
    } catch (error) {
      const err = error as Error;
      logger.error(`Vercel Blob delete failed: ${err.message}`);
      throw new Error(`File delete failed: ${err.message}`);
    }
  }
}
