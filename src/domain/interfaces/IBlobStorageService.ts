export interface IBlobStorageService {
  upload(
    file: Buffer,
    fileName: string,
    contentType: string,
    folder?: string,
  ): Promise<{ url: string; pathname: string }>;
  delete(url: string): Promise<void>;
}
