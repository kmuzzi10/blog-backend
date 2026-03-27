# 🚀 ClayBlog - Premium Content Platform

ClayBlog is a high-performance, full-stack blogging ecosystem built with a focus on **Clean Architecture**, **Security**, and a state-of-the-art **Claymorphic** UI. It allows authors to publish engaging stories and admins to moderate the platform through a centralized dashboard.

---

## 🏗️ The System Architecture

### 🛡️ Clean Backend (The Engine)
Our backend follows **Clean Architecture** principles to separate business rules from technical details (database, web framework).
*   **Separation of Concerns**: Logic is divided into Domain, Modules, and Infrastructure layers.
*   **Performance**: Uses **MongoDB Aggregation Pipelines** to perform heavy joins and counts directly on the database side.
*   **Security**: Hardened with **Rate Limiting**, **Helmet security headers**, **CORS origin validation**, and **NoSQL Injection protection**.
*   **Serverless Ready**: Optimized for Vercel with specific database connection middlewares to eliminate cold-start timeouts.

### 🎨 Premium Frontend (The Interface)
The frontend is built for speed and visual "wow" using a **Claymorphic** design system.
*   **Tactile UI**: Uses soft shadows and rounded depth (`shadow-clay`) to create a premium feel.
*   **Lightning Fast**: Built with **Vite + React + TypeScript** for near-instant interaction.
*   **Auth Management**: Centralized React Context for JWT lifecycle and role-based access control.
*   **Responsive Dashboard**: Tailored views for Authors (post management) and Admins (user moderation).

---

## 🚀 Getting Started

### 1. Prerequisites
*   **Node.js** (v18+)
*   **MongoDB Atlas Account** (Free tier works perfectly)
*   **Vercel Account** (For deployment)

---

### 2. Backend Setup (`/server`)
1.  **Enter Directory**: `cd server`
2.  **Install**: `npm install`
3.  **Environment**: Create a `.env` file with these keys:
    ```env
    MONGODB_URI=your_mongodb_atlas_url
    JWT_SECRET=your_secure_random_string
    JWT_REFRESH_SECRET=another_random_string
    ALLOWED_ORIGINS=http://localhost:5173
    LOG_LEVEL=info
    ADMIN_REGISTRATION_SECRET=super-secret-admin-key-123
    ```
4.  **Run Development**: `npm run dev`

---

### 3. Frontend Setup (`/client`)
1.  **Enter Directory**: `cd client`
2.  **Install**: `npm install`
3.  **Environment**: Create a `.env` file with this key:
    ```env
    VITE_API_BASE_URL=http://localhost:5000/api/v1
    ```
4.  **Run Development**: `npm run dev`

---

## 📁 Repository Structure

```text
├── client/          # Vite + React (TypeScript) + Tailwind
│   ├── src/
│   │   ├── components/  # Reusable Claymorphic components
│   │   ├── contexts/    # Auth state management
│   │   ├── pages/       # Dashboard and Public views
│   └── vercel.json     # SPA routing configuration
└── server/          # Node.js + Express (TypeScript) + MongoDB
    ├── src/
    │   ├── domain/      # Pure business logic (Zero dependencies)
    │   ├── modules/     # Use cases, Controllers, and Routes
    │   ├── infrastructure/ # Database models & Repositories
    └── vercel.json     # Serverless function routing
```

---
*Built with ❤️ for a modern, scalable content experience.*
