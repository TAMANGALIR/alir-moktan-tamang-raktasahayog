# 🩸 Raktasahayog — Blood Donation Management System

Raktasahayog is a full-stack web application designed to streamline blood donation management in Nepal. It connects donors, organisations, and administrators on a single platform to manage campaigns, appointments, emergency requests, and blood inventory efficiently.

---

## 📌 Project Overview

| Detail | Info |
|--------|------|
| **Project Name** | Raktasahayog |
| **Type** | Full-Stack Web Application |
| **Frontend** | React.js (Vite) |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL (via Prisma ORM) |
| **Authentication** | JWT (JSON Web Token) |

---

## 🧰 Prerequisites

Make sure you have the following installed before running the project:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- [Git](https://git-scm.com/)

---

## 📁 Project Structure

```
alir-moktan-tamang-raktasahayog/
├── client/          # React frontend (Vite)
├── server/          # Node.js + Express backend (TypeScript)
├── package.json     # Root package config
└── README.md        # Project documentation
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/alir-moktan-tamang-raktasahayog.git
cd alir-moktan-tamang-raktasahayog
```

---

### 2. Setup the Backend (Server)

```bash
cd server
```

**Install dependencies:**
```bash
npm install
```

**Configure environment variables:**
```bash
# Copy the example env file
copy .env.example .env
```

Then open `.env` and update these values:
```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/raktasahayog"
JWT_SECRET="your_jwt_secret_key"
PORT=3000
```

**Generate Prisma Client:**
```bash
npm run prisma:generate
```

**Run database migrations:**
```bash
npm run prisma:migrate
```

**Start the backend development server:**
```bash
npm run dev
```

> ✅ Backend will run at: `http://localhost:3000`

---

### 3. Setup the Frontend (Client)

Open a **new terminal** and run:

```bash
cd client
```

**Install dependencies:**
```bash
npm install
```

**Start the frontend development server:**
```bash
npm run dev
```

> ✅ Frontend will run at: `http://localhost:5173`

---

## 🚀 Running the Full Project

To run the full application, you need **two terminals open at the same time**:

| Terminal | Directory | Command |
|----------|-----------|---------|
| Terminal 1 (Backend) | `server/` | `npm run dev` |
| Terminal 2 (Frontend) | `client/` | `npm run dev` |

Then open your browser and go to: **`http://localhost:5173`**

---

## 🛠️ Available Scripts

### Backend (`server/`)
| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |

### Frontend (`client/`)
| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run frontend Jest tests |

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| **Donor** | Register, book appointments, view campaigns, request donations |
| **Organisation** | Manage campaigns, handle inventory, approve appointments |
| **Admin** | Manage users and organisation requests |
| **Super Admin** | Full system control and oversight |

---

## 🔑 Key Features

- 🩸 Blood donation campaign management
- 📅 Appointment booking system
- 🚨 Emergency blood request alerts
- 🏦 Blood inventory tracking
- 💳 Payment integration
- 🔐 Role-based access control (JWT)
- 📊 Admin and organisation dashboards

---

## 🤝 Authors

- **Alir Moktan Tamang** — Developer

---

## 📄 License

This project is developed as part of a Final Year Project (FYP) submission.
