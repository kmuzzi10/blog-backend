"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const pino_http_1 = __importDefault(require("pino-http"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const config_1 = require("./shared/config/config");
const logger_1 = require("./shared/utils/logger");
const errorHandler_1 = require("./shared/middleware/errorHandler");
const swagger_1 = require("./shared/config/swagger");
// Routes
const auth_routes_1 = require("./modules/auth/auth.routes");
const posts_routes_1 = require("./modules/posts/posts.routes");
const users_routes_1 = require("./modules/users/users.routes");
const category_routes_1 = require("./modules/categories/category.routes");
const comments_routes_1 = require("./modules/comments/comments.routes");
const connection_1 = require("./infrastructure/database/connection");
const buildApp = () => {
    const app = (0, express_1.default)();
    // Trust proxy for rate limiting on Vercel
    app.set('trust proxy', 1);
    // Database Connection Middleware (Ensures DB is ready on every request in serverless)
    app.use(async (req, res, next) => {
        try {
            await (0, connection_1.connectDB)();
            next();
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Database connection middleware failed');
            res.status(503).json({
                success: false,
                message: 'Database connection currently unavailable. Please try again.',
                code: 'SERVICE_UNAVAILABLE',
            });
        }
    });
    // Basic Middleware
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Security Middleware
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: config_1.config.allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }));
    app.use((0, express_mongo_sanitize_1.default)()); // Prevent NoSQL Injection attacks
    // Rate Limiting
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: config_1.config.rateLimitWindowMs,
        max: config_1.config.rateLimitMax,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: 'Too many requests, please try again later.',
        },
    });
    app.use('/api', limiter);
    // Logging
    app.use((0, pino_http_1.default)({
        logger: logger_1.logger,
        autoLogging: config_1.config.isProduction,
        customLogLevel: (req, _res, err) => {
            if (err || _res.statusCode >= 500)
                return 'error';
            if (_res.statusCode >= 400)
                return 'warn';
            return 'info';
        },
    }));
    // Health Check
    app.get('/health', (_req, res) => {
        res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    // Swagger Documentation
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
        customSiteTitle: 'Blog Platform API Docs'
    }));
    app.get('/api-docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swagger_1.swaggerSpec);
    });
    // API Routes
    const v1Router = express_1.default.Router();
    v1Router.use('/auth', auth_routes_1.authRoutes);
    v1Router.use('/posts', posts_routes_1.postRoutes);
    v1Router.use('/users', users_routes_1.userRoutes);
    v1Router.use('/categories', category_routes_1.categoryRoutes);
    v1Router.use('/comments', comments_routes_1.commentRoutes);
    app.use('/api/v1', v1Router);
    // Error Handling (Must be last)
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.buildApp = buildApp;
//# sourceMappingURL=app.js.map