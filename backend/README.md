# Blog Backend API

Backend API cho ứng dụng blog cá nhân được xây dựng với NestJS và PostgreSQL.

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger

## 📋 Database Schema

### Tables:
- **users**: Quản lý người dùng
- **categories**: Phân loại bài viết
- **tags**: Gắn thẻ cho bài viết
- **posts**: Bài viết chính
- **comments**: Bình luận (hỗ trợ nested comments)
- **post_tags**: Bảng junction cho many-to-many relationship

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 13
- npm hoặc yarn

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin database của bạn:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=blog_user
DB_PASSWORD=blog_password
DB_DATABASE=blog_db

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

PORT=3001
NODE_ENV=development
API_PREFIX=api/v1
CORS_ORIGIN=http://localhost:3000
```

### 3. Setup Database

#### Tạo database:
```sql
CREATE DATABASE blog_db;
CREATE USER blog_user WITH PASSWORD 'blog_password';
GRANT ALL PRIVILEGES ON DATABASE blog_db TO blog_user;
```

#### Chạy migrations:
```bash
npm run migration:run
```

### 4. Khởi chạy application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Documentation

Sau khi khởi chạy server, truy cập Swagger docs tại:
```
http://localhost:3001/api/docs
```

## 🔧 TypeORM Commands

```bash
# Tạo migration mới
npm run migration:generate -- -n MigrationName

# Chạy migrations
npm run migration:run

# Revert migration cuối cùng
npm run migration:revert
```

## 📁 Project Structure

```
src/
├── database/           # Database configuration & migrations
│   ├── migrations/     # TypeORM migrations
│   ├── data-source.ts  # DataSource configuration
│   └── database.module.ts
├── entities/           # TypeORM entities
│   ├── user.entity.ts
│   ├── post.entity.ts
│   ├── category.entity.ts
│   ├── tag.entity.ts
│   └── comment.entity.ts
├── modules/           # Feature modules (sẽ được thêm sau)
├── common/            # Common utilities, guards, interceptors
├── app.module.ts      # Root module
└── main.ts           # Application entry point
```

## 🌟 Features

- ✅ Database schema setup
- ✅ TypeORM entities with relationships
- ✅ Database migrations
- ⏳ Authentication & Authorization (Coming next)
- ⏳ CRUD operations for Posts
- ⏳ Comments system
- ⏳ Search functionality
- ⏳ File upload (images)

## 📝 Next Steps

1. **Authentication Module**: Implement JWT authentication
2. **User Management**: User CRUD operations
3. **Posts Module**: Full CRUD for blog posts
4. **Categories & Tags**: Management endpoints
5. **Comments System**: Nested comments with moderation
6. **Search**: Full-text search implementation
7. **File Upload**: Image upload for posts
8. **Testing**: Unit and E2E tests

## 🤝 Development Guidelines

- Sử dụng TypeScript strict mode
- Validate tất cả input với class-validator
- Document tất cả endpoints với Swagger
- Viết tests cho các features mới
- Follow NestJS best practices 