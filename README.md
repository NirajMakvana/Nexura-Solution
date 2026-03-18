# Nexura Solutions — Full Stack Business Management Platform

A comprehensive MERN stack platform for IT company operations — combining a public-facing website with a full admin panel and employee portal.

---

## 🚀 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Auth:** JWT (JSON Web Tokens), bcrypt
- **Storage:** Multer (file uploads)
- **Email:** Nodemailer

---

## ✨ Features

### 🌐 Public Website
- Landing page with animated hero, stats counter, pricing, reviews
- About, Services, Portfolio, Blog, Careers, Contact pages
- Job application system
- Review submission with admin approval flow
- SEO meta tags via react-helmet-async

### 👨‍💼 Admin Panel
- Dashboard with live stats, recent projects, pending leaves
- Staff Management (CRUD + CSV export)
- Project & Timeline Management (Gantt-style)
- Client & Invoice Management (PDF export)
- Payroll & Attendance Tracking
- Leave Management (Approve/Reject)
- Blog & Job Posting Management
- Contact Inquiry Inbox
- Review Moderation
- Analytics with Charts
- Notification Center

### 👷 Employee Portal
- Personal Dashboard with task overview
- Task Board (Kanban)
- Attendance Clock-in/Clock-out
- Leave Request System
- Payslip Downloads
- Calendar & Team Overview
- Code Reviews (role-based)
- Profile & Settings

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5002
MONGODB_URI=mongodb://localhost:27017/nexura
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
NODE_ENV=development
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Seed Database (Optional)

```bash
cd backend
node src/scripts/resetAndSeed.js
```

---

## 🔐 Default Login Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nexurasolutions.com | Admin@1234 |
| Employee | employee@nexurasolutions.com | Admin@1234 |

> ⚠️ Change these credentials immediately in production!

---

## 📁 Project Structure

```
nexura-solution/
├── backend/
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── middleware/   # Auth, error handler, upload
│   │   ├── models/       # Mongoose models (17 models)
│   │   ├── routes/       # Express routes (17 routes)
│   │   ├── scripts/      # Seed scripts
│   │   └── server.js     # Entry point
│   └── uploads/          # File uploads
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Route pages (public/admin/employee)
    │   ├── services/     # API service layer
    │   └── store/        # Zustand state management
    └── index.html
```

---

## 🌍 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 5002) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `FRONTEND_URL` | Frontend URL for CORS |
| `EMAIL_USER` | Gmail address for email service |
| `EMAIL_PASS` | Gmail App Password |

---

## 📄 License

© 2025 Nexura Solutions. All rights reserved.
