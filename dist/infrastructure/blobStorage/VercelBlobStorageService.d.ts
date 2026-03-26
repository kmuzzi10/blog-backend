import { IBlobStorageService } from '../../domain/interfaces/IBlobStorageService';
export declare class VercelBlobStorageService implements IBlobStorageService {
    upload(file: Buffer, fileName: string, contentType: string, folder?: string): Promise<{
        url: string;
        pathname: string;
    }>;
    delete(url: string): Promise<void>;
}
//# sourceMappingURL=VercelBlobStorageService.d.ts.map