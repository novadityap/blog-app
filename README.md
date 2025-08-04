# Blog App

A full-stack blogging platform with modern features such as user authentication, role-based access control, post and comment management, likes/dislikes, and an admin dashboard.

---

## 🚀 Tech Stack

### Backend
- **Express.js** — Web framework for building RESTful APIs
- **MongoDB** — NoSQL database, managed with Mongoose ODM
- **Authentication** — JSON Web Token (JWT) and Google OAuth 2.0
- **Email Service** — Handled via Nodemailer

### Frontend
- **Next.js** — Fullstack React framework
- **Redux Toolkit & RTK Query** — State and data fetching management
- **shadcn/ui** — Accessible and customizable UI components

---

## 🧰 Getting Started (Development)

### Prerequisites
- Docker

### Setup Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/novadityap/blog-app.git
   cd blog-app
   ```

2. **Prepare environment variables:**

   Make sure `.env` files exist in both:

   ```
   ./server/.env.development
   ./client/.env.development
   ```

   (You can create them manually or copy from `.env.example` if available.)

4. **Start the application:**

   ```bash
   docker compose -f docker-compose.development.yml up -d --build
   ```

3. **Seed the database:**

   ```bash
   docker compose -f docker-compose.development.yml exec server npm run seed
   ```

5. **Access URLs:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3000/api](http://localhost:3000/api)

---

## 🔐 Default Admin Account

To access the admin dashboard, use the following credentials:

- **Email:** `admin@email.com`
- **Password:** `admin123`

---

## 🧪 Running Tests (Optional)

```bash
docker compose -f docker-compose.development.yml exec server npm run test
```

---

## 🧼 Maintenance

- **View container logs:**

  ```bash
  docker compose -f docker-compose.development.yml logs -f
  ```

- **Stop and remove containers, networks, and volumes:**

  ```bash
  docker compose -f docker-compose.development.yml down -v
  ```

---
