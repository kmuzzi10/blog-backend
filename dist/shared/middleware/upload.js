"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadSingle = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const config_1 = require("../config/config");
const AppError_1 = require("../utils/AppError");
const storage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    const allowedTypes = [
        ...config_1.config.allowedImageTypes,
        ...config_1.config.allowedVideoTypes,
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new AppError_1.AppError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`, 400, true, 'INVALID_FILE_TYPE'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: config_1.config.maxFileSize,
    },
    fileFilter,
});
// Specific upload configurations
const uploadSingle = (fieldName) => exports.upload.single(fieldName);
exports.uploadSingle = uploadSingle;
const uploadMultiple = (fieldName, maxCount = 5) => exports.upload.array(fieldName, maxCount);
exports.uploadMultiple = uploadMultiple;
//# sourceMappingURL=upload.js.map