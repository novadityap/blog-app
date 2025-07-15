# Blog App

A full-stack blogging platform with modern features such as user authentication, role-based access control, post and comment management, likes/dislikes, and an admin dashboard.

---

## 🚀 Tech Stack

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication + Google OAuth2
- Nodemailer (Email verification and password reset)   
- Docker & Docker Compose

**Frontend:**
- React (Vite)
- Redux Toolkit + RTK Query
- React Router
- shadcn ui + Tailwind CSS

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
  docker compose logs -f
  ```

- **Stop and remove containers, networks, and volumes:**

  ```bash
  docker compose down -v
  ```

---

## 📁 Project Structure

```
blog-app/
├── client/        # Frontend (React)
├── server/        # Backend (Express.js)
├── docker-compose.development.yml
└── README.md
```

---

## 👤 Author

**Nova Aditya Pratama**  
Email: [admin@email.com](mailto:admin@email.com)

---
