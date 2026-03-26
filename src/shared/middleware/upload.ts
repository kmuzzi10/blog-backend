import multer from 'multer';
import { config } from '../config/config';
import { AppError } from '../utils/AppError';

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void => {
  const allowedTypes = [
    ...config.allowedImageTypes,
    ...config.allowedVideoTypes,
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
        400,
        true,
        'INVALID_FILE_TYPE',
      ),
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
  },
  fileFilter,
});

// Specific upload configurations
export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount: number = 5) =>
  upload.array(fieldName, maxCount);
