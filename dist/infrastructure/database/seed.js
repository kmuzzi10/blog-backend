"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const UserModel_1 = require("./models/UserModel");
const PostModel_1 = require("./models/PostModel");
const User_1 = require("../../domain/entities/User");
const Post_1 = require("../../domain/entities/Post");
const config_1 = require("../../shared/config/config");
dotenv_1.default.config();
// Connect to MongoDB
const connectToDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(config_1.config.mongodbUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};
const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Password123!',
        role: User_1.UserRole.ADMIN,
        isActive: true,
    },
    {
        name: 'Author User',
        email: 'author@example.com',
        password: 'Password123!',
        role: User_1.UserRole.AUTHOR,
        isActive: true,
    },
];
const seedData = async () => {
    try {
        await connectToDB();
        console.log('Clearing existing data...');
        await UserModel_1.UserModel.deleteMany({});
        await PostModel_1.PostModel.deleteMany({});
        console.log('Seeding users...');
        const hashedUsers = await Promise.all(users.map(async (user) => {
            const hashedPassword = await bcryptjs_1.default.hash(user.password, config_1.config.bcryptSaltRounds);
            return { ...user, password: hashedPassword };
        }));
        const createdUsers = await UserModel_1.UserModel.insertMany(hashedUsers);
        console.log('Seeding posts...');
        const authorId = createdUsers[1]._id; // Author User
        const adminId = createdUsers[0]._id; // Admin User
        const posts = [
            {
                title: 'Welcome to the Blog Platform',
                slug: 'welcome-to-the-blog-platform',
                content: '<p>This is the first post on the new platform.</p>',
                excerpt: 'This is the first post on the new platform.',
                status: Post_1.PostStatus.PUBLISHED,
                authorId: adminId,
                tags: ['welcome', 'intro'],
                readTime: 1,
                viewCount: 150,
                publishedAt: new Date(),
            },
            {
                title: 'How to Write a Technical Blog Post',
                slug: 'how-to-write-a-technical-blog-post',
                content: '<p>Writing technical blogs involves clear explanation and code snippets.</p>',
                excerpt: 'Writing technical blogs involves clear explanation and code snippets.',
                status: Post_1.PostStatus.PUBLISHED,
                authorId: authorId,
                tags: ['writing', 'technical'],
                readTime: 3,
                viewCount: 45,
                publishedAt: new Date(),
            },
            {
                title: 'Draft Post Idea',
                slug: 'draft-post-idea',
                content: '<p>Still working on this content...</p>',
                excerpt: 'Still working on this content...',
                status: Post_1.PostStatus.DRAFT,
                authorId: authorId,
                tags: ['draft'],
                readTime: 1,
                viewCount: 0,
            },
        ];
        await PostModel_1.PostModel.insertMany(posts);
        console.log('Seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error(`Seeding failed: ${error.message}`);
        process.exit(1);
    }
};
const destroyData = async () => {
    try {
        await connectToDB();
        console.log('Destroying data...');
        await UserModel_1.UserModel.deleteMany({});
        await PostModel_1.PostModel.deleteMany({});
        console.log('Data destroyed!');
        process.exit(0);
    }
    catch (error) {
        console.error(`Destroy failed: ${error.message}`);
        process.exit(1);
    }
};
if (process.argv[2] === '-d') {
    destroyData();
}
else {
    seedData();
}
//# sourceMappingURL=seed.js.map