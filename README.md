# 🧑‍💻 UserBase — User Management System

A full-stack web application built with **PostgreSQL, Express, Node.js** (PERN Stack) that allows users to sign up, log in, and manage user data with full CRUD operations.

## 🌐 Live Demo
👉 [Click here to view the app](https://user-management-system-kl1y1gp10-swatiparihar18s-projects.vercel.app/login.html)

## 📁 GitHub Repository
👉 [github.com/swatiparihar18/user-management-system](https://github.com/swatiparihar18/user-management-system)

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Supabase) |
| Authentication | JWT + bcrypt |
| Deployment | Vercel (Frontend) + Render (Backend) |

---

## ✨ Features

- 🔐 User Signup & Login with JWT Authentication
- 🔒 Password hashing with bcrypt
- 📋 View all users in a dynamic table
- ➕ Add new users
- ✏️ Edit existing users
- 🗑️ Delete users with confirmation modal
- 🔍 Search users by name or email
- 📊 Live stats — Total users & Average age
- 📱 Fully responsive design
- 🎨 Dark theme with modern UI

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- PostgreSQL database

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/swatiparihar18/user-management-system.git
cd user-management-system
```

**2. Setup Backend**
```bash
cd backend
npm install
```

**3. Create `.env` file in backend folder**
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
```

**4. Start Backend**
```bash
node server.js
```

**5. Start Frontend**
```bash
cd frontend
npx serve .
```

---

## 📂 Project Structure

```
user-management-system/
├── backend/
│   ├── controllers/
│   │   └── authController.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── users.js
│   ├── db.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── style.css
│   └── script.js
└── README.md
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/signup | Register a new user |
| POST | /auth/login | Login and get JWT token |
| GET | /users | Get all users |
| POST | /users | Create a new user |
| PUT | /users/:id | Update a user |
| DELETE | /users/:id | Delete a user |

---

## 🙏 Acknowledgements

This project was built as part of the **Codveda Technology Full-Stack Development Internship**.

#CodvedaJourney #CodvedaExperience #FutureWithCodveda
