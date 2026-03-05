# 🚀 Nexura Solutions — Business Management System

> A full-stack, production-ready enterprise platform with a public marketing website, a powerful Admin portal, and a dedicated Employee portal.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20MongoDB-blue)
![License](https://img.shields.io/badge/License-Private-red)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Login Credentials](#-login-credentials)
- [API Routes](#-api-routes)
- [Troubleshooting](#-troubleshooting)
- [Contact](#-contact)

---

## 🌐 Overview

**Nexura Solutions** is a complete business management system built as a modern SaaS-style platform. It includes three separate portals:

| Portal | Description | URL |
|---|---|---|
| 🌍 **Public Website** | Marketing site for clients to learn about services | `http://localhost:5173` |
| 🔐 **Admin Panel** | Full management dashboard for administrators | `http://localhost:5173/admin` |
| 👤 **Employee Portal** | Self-service portal for employees | `http://localhost:5173/employee` |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI Framework |
| **Vite** | Build Tool & Dev Server |
| **Tailwind CSS** | Utility-first Styling |
| **Zustand** | Global State Management |
| **Axios** | HTTP Client |
| **React Router DOM** | Client-side Routing |
| **Lucide React** | Icon Library |
| **React Hot Toast** | Toast Notifications |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API Server |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication Tokens |
| **bcryptjs** | Password Hashing |
| **Nodemailer** | Email Service (SMTP) |
| **Multer** | File Upload Handling |

---

## ✅ Features

### 📢 Public Website
- Modern landing page with company stats and live client reviews
- About, Services, Portfolio, Blog, Careers, and Contact pages
- Contact form with **Auto-Reply Email** to visitors
- Review submission form (moderated by admin)
- Job Listings & Application Form
- Full SEO optimization with dynamic meta tags

### 🔐 Admin Panel
- **Dashboard** — Live stats, real-time activity logs, quick leave approvals
- **Staff Management** — Add/Edit/Delete employees, send Welcome Emails
- **Project Management** — Track projects with client, budget, and status
- **Client Management** — Manage client database
- **Invoice Management** — Create, update, and track payment status of invoices
- **Leave Management** — Approve or reject employee leave requests (with email + in-app notifications)
- **Review Management** — Moderate customer reviews (Approve/Reject/Delete)
- **Blog Management** — Create and publish company blogs
- **Contact Inquiries** — View and manage messages from the contact form
- **Notifications** — Real-time bell icon with dropdown for new leaves & inquiries
- **Analytics** — Revenue charts, project stats, and client leaderboard
- **CSV Export** — Download Staff, Clients, Invoices, and Leave data as spreadsheets

### 👤 Employee Portal
- **Dashboard** — Personal task summary, attendance, and leave balance
- **Task Board** — Kanban-style view of assigned tasks
- **Attendance** — Clock In/Clock Out with daily records
- **Leave Requests** — Apply for leave with reason and date selection
- **Payslips** — View and download monthly payslips
- **Team Overview** — See all team members and their roles
- **Calendar** — Company events and personal schedule

### 🔒 Authentication & Security
- Separate login flows for Admin and Employees
- JWT-based authentication with role-based route protection
- **Forgot Password** / **Reset Password** via email token
- Passwords hashed with bcryptjs

### 📧 Email Automation (Nodemailer)
- ✅ Welcome email when an employee is created (includes default credentials)
- ✅ Task assignment notification email
- ✅ Leave status update email (Approved / Rejected)
- ✅ Contact form submission notification to admin
- ✅ Auto-reply email to the person who submitted the contact form

---

## 📁 Project Structure

```
nexura-solution/
├── frontend/                    # React Application
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── admin/           # AdminLayout, NotificationCenter, etc.
│       │   ├── employee/        # EmployeeLayout
│       │   └── ui/              # Shared UI: Avatar, Skeleton, ReviewForm, etc.
│       ├── pages/
│       │   ├── admin/           # 9 admin pages
│       │   ├── auth/            # Login, ForgotPassword, ResetPassword
│       │   ├── employee/        # 10 employee pages
│       │   └── public/          # 14 public pages
│       ├── services/
│       │   ├── api.js           # Axios instance with auth interceptor
│       │   ├── adminService.js  # All admin API calls
│       │   ├── authService.js   # Auth API calls
│       │   └── notificationService.js
│       ├── store/
│       │   └── authStore.js     # Zustand auth state
│       └── utils/
│           └── csvExport.js     # CSV download utility
│
├── backend/                     # Express REST API
│   └── src/
│       ├── middleware/
│       │   └── auth.js          # JWT verification & role guard
│       ├── models/              # Mongoose Data Models
│       │   ├── User.js          # Employees & Admin
│       │   ├── Leave.js
│       │   ├── Attendance.js
│       │   ├── Task.js
│       │   ├── Project.js
│       │   ├── Client.js
│       │   ├── Invoice.js
│       │   ├── Payslip.js
│       │   ├── Review.js
│       │   ├── Blog.js
│       │   ├── Contact.js
│       │   └── Notification.js
│       ├── routes/              # API Route Handlers
│       │   ├── auth.js
│       │   ├── users.js
│       │   ├── leaves.js
│       │   ├── attendance.js
│       │   ├── tasks.js
│       │   ├── projects.js
│       │   ├── clients.js
│       │   ├── invoices.js
│       │   ├── payroll.js
│       │   ├── reviews.js
│       │   ├── blogs.js
│       │   ├── contact.js
│       │   ├── notifications.js
│       │   └── dashboard.js
│       ├── utils/
│       │   └── emailService.js  # Nodemailer SMTP service
│       └── seeds/
│           └── seedData.js      # Database seeder
│
├── package.json                 # Root — runs both servers via concurrently
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local at `localhost:27017` OR MongoDB Atlas URI)
- npm v9+

### 1. Clone & Install

```bash
# Install all dependencies (frontend, backend, and root)
npm install
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with your values (see [Environment Variables](#-environment-variables) below).

### 3. Seed the Database

```bash
cd backend
node src/seeds/seedData.js
```

This creates the admin user and sample employees, projects, and clients.

### 4. Start Development Servers

```bash
# From the ROOT directory — starts BOTH frontend and backend
npm run dev
```

| Server | URL |
|---|---|
| 🖥️ Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:5002 |

---

## 🔐 Environment Variables

Create `backend/.env` (copy from `.env.example`):

```env
# Server
PORT=5002
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/nexura-solution

# Auth
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend URL (for CORS & email links)
FRONTEND_URL=http://localhost:5173

# Company Details
COMPANY_NAME=Nexura Solutions
COMPANY_EMAIL=nexurasolutions.official@gmail.com
COMPANY_PHONE=+91 97266 69466
COMPANY_WHATSAPP=+91 97266 69466
COMPANY_ADDRESS=Virtual (Remote-first company)

# ─── Email / SMTP ────────────────────────────────────────
# Option A: Gmail (use an App Password from Google account settings)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password

# Option B: Leave blank → Ethereal (test mode, preview links in console)
SMTP_HOST=
SMTP_USER=
SMTP_PASS=

FROM_EMAIL="Nexura Solutions <noreply@nexurasolutions.com>"
ADMIN_EMAIL=nexurasolutions.official@gmail.com
```

> **Gmail App Password:** Go to [Google Account → Security → 2-Step Verification → App Passwords](https://myaccount.google.com/apppasswords) to generate one.

---

## 🔑 Login Credentials

### Admin Portal
| Field | Value |
|---|---|
| URL | `http://localhost:5173/admin/login` |
| Email | `admin@nexurasolutions.com` |
| Password | `admin123` |

### Employee Portal (after seeding)
| Field | Value |
|---|---|
| URL | `http://localhost:5173/employee/login` |
| Email | `jadav@nexurasolutions.com` |
| Password | `password123` |

> Other employees: `niraj@nexurasolutions.com`, `kargar@nexurasolutions.com`, `dhruv@nexurasolutions.com` — all with password `password123`

---

## 🌐 API Routes

| Prefix | Description |
|---|---|
| `POST /api/auth/login` | Admin/Employee login |
| `POST /api/auth/forgot-password` | Send password reset email |
| `POST /api/auth/reset-password` | Reset password with token |
| `GET /api/users` | List all employees |
| `GET/POST /api/leaves` | Leave management |
| `PUT /api/leaves/:id/approve` | Approve a leave |
| `PUT /api/leaves/:id/reject` | Reject a leave |
| `GET/POST /api/projects` | Project management |
| `GET/POST /api/clients` | Client management |
| `GET/POST /api/invoices` | Invoice management |
| `GET/POST /api/tasks` | Task management |
| `GET/POST /api/attendance` | Attendance records |
| `GET/POST /api/reviews` | Review moderation |
| `GET/POST /api/blogs` | Blog management |
| `GET/POST /api/contact` | Contact inquiries |
| `GET /api/notifications` | In-app notifications |
| `GET /api/dashboard/activity` | Live activity log |

---

## 🐞 Troubleshooting

### MongoDB not connecting?
```bash
# Make sure MongoDB service is running on port 27017
# OR update MONGODB_URI in backend/.env to your Atlas connection string
```

### Login not working?
```bash
# Re-run the seed script to reset the admin user
cd backend
node src/seeds/seedData.js
```
Then clear your browser's `localStorage` (DevTools → Application → Local Storage → Clear).

### Port already in use?
```bash
# Change PORT in backend/.env from 5002 to any free port
# Vite will auto-pick the next available frontend port
```

### Emails not sending?
- Leave `SMTP_HOST` blank to fall back to **Ethereal** (test mode). Email preview links will appear in the backend console.
- For real sending, use a Gmail App Password as described in the env section.

---

## 📊 Project Stats

| Metric | Count |
|---|---|
| Total Pages | 38+ |
| Database Models | 12 |
| API Route Groups | 14 |
| Email Triggers | 5 |
| Build Status | ✅ Zero Errors |

---

## 📞 Contact

**Nexura Solutions**
- 📧 Email: nexurasolutions.official@gmail.com
- 📱 Phone/WhatsApp: +91 97266 69466
- 🌐 Website: http://localhost:5173

---

<p align="center">
  <strong>Built with ❤️ by the Nexura Solutions Team 🚀</strong>
</p>