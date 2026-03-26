import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { UserModel } from './models/UserModel';
import { PostModel } from './models/PostModel';
import { UserRole } from '../../domain/entities/User';
import { PostStatus } from '../../domain/entities/Post';
import { config } from '../../shared/config/config';

dotenv.config();

// Connect to MongoDB
const connectToDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Password123!',
    role: UserRole.ADMIN,
    isActive: true,
  },
  {
    name: 'Author User',
    email: 'author@example.com',
    password: 'Password123!',
    role: UserRole.AUTHOR,
    isActive: true,
  },
];

const seedData = async () => {
  try {
    await connectToDB();

    console.log('Clearing existing data...');
    await UserModel.deleteMany({});
    await PostModel.deleteMany({});

    console.log('Seeding users...');
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, config.bcryptSaltRounds);
        return { ...user, password: hashedPassword };
      })
    );
    const createdUsers = await UserModel.insertMany(hashedUsers);

    console.log('Seeding posts...');
    const authorId = createdUsers[1]._id; // Author User
    const adminId = createdUsers[0]._id;  // Admin User

    const posts = [
      {
        title: 'Welcome to the Blog Platform',
        slug: 'welcome-to-the-blog-platform',
        content: '<p>This is the first post on the new platform.</p>',
        excerpt: 'This is the first post on the new platform.',
        status: PostStatus.PUBLISHED,
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
        status: PostStatus.PUBLISHED,
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
        status: PostStatus.DRAFT,
        authorId: authorId,
        tags: ['draft'],
        readTime: 1,
        viewCount: 0,
      },
    ];

    await PostModel.insertMany(posts);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${(error as Error).message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectToDB();

    console.log('Destroying data...');
    await UserModel.deleteMany({});
    await PostModel.deleteMany({});

    console.log('Data destroyed!');
    process.exit(0);
  } catch (error) {
    console.error(`Destroy failed: ${(error as Error).message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}
