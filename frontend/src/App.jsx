import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Public Pages
import SimpleLandingPage from './pages/public/SimpleLandingPage'
import AboutPage from './pages/public/AboutPage'
import ServicesPage from './pages/public/ServicesPage'
import PortfolioPage from './pages/public/PortfolioPage'
import ProjectDetailPage from './pages/public/ProjectDetailPage'
import BlogPage from './pages/public/BlogPage'
import BlogArticlePage from './pages/public/BlogArticlePage'
import ContactPage from './pages/public/ContactPage'
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage'
import TermsOfServicePage from './pages/public/TermsOfServicePage'
import FeaturesPage from './pages/public/FeaturesPage'
import CareersPage from './pages/public/CareersPage'
import JobApplicationPage from './pages/public/JobApplicationPage'

import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import AdminLoginPage from './pages/auth/AdminLoginPage'
import EmployeeLoginPage from './pages/auth/EmployeeLoginPage'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ProjectManagement from './pages/admin/ProjectManagement'
import StaffManagement from './pages/admin/StaffManagement'
import ProfilePage from './pages/admin/ProfilePage'
import Analytics from './pages/admin/Analytics'
import ClientManagement from './pages/admin/ClientManagement'
import InvoiceManagement from './pages/admin/InvoiceManagement'
import ProjectTimeline from './pages/admin/ProjectTimeline'
import Settings from './pages/admin/Settings'
import ReviewManagement from './pages/admin/ReviewManagement'
import LeaveManagement from './pages/admin/LeaveManagement'
import BlogManagement from './pages/admin/BlogManagement'
import ContactManagement from './pages/admin/ContactManagement'
import JobManagement from './pages/admin/JobManagement'
import PayrollManagement from './pages/admin/PayrollManagement'
import AttendanceManagement from './pages/admin/AttendanceManagement'

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import TaskBoard from './pages/employee/TaskBoard'
import AttendancePortal from './pages/employee/AttendancePortal'
import LeaveRequests from './pages/employee/LeaveRequests'
import PayslipDownloads from './pages/employee/PayslipDownloads'
import Calendar from './pages/employee/Calendar'
import TeamOverview from './pages/employee/TeamOverview'
import CodeReviews from './pages/employee/CodeReviews'
import EmployeeProjectTimeline from './pages/employee/ProjectTimeline'
import EmployeeProfile from './pages/employee/EmployeeProfile'
import EmployeeSettings from './pages/employee/EmployeeSettings'

// Error Pages
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<SimpleLandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:projectId" element={<ProjectDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:articleId" element={<BlogArticlePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/apply/:jobId" element={<JobApplicationPage />} />

          {/* Auth Routes */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/employee/login" element={<EmployeeLoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={['admin']}><ProjectManagement /></ProtectedRoute>} />
          <Route path="/admin/timeline" element={<ProtectedRoute allowedRoles={['admin']}><ProjectTimeline /></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><StaffManagement /></ProtectedRoute>} />
          <Route path="/admin/clients" element={<ProtectedRoute allowedRoles={['admin']}><ClientManagement /></ProtectedRoute>} />
          <Route path="/admin/invoices" element={<ProtectedRoute allowedRoles={['admin']}><InvoiceManagement /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={['admin']}><ReviewManagement /></ProtectedRoute>} />
          <Route path="/admin/leaves" element={<ProtectedRoute allowedRoles={['admin']}><LeaveManagement /></ProtectedRoute>} />
          <Route path="/admin/blogs" element={<ProtectedRoute allowedRoles={['admin']}><BlogManagement /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><JobManagement /></ProtectedRoute>} />
          <Route path="/admin/contacts" element={<ProtectedRoute allowedRoles={['admin']}><ContactManagement /></ProtectedRoute>} />
          <Route path="/admin/payroll" element={<ProtectedRoute allowedRoles={['admin']}><PayrollManagement /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['admin']}><AttendanceManagement /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><ProfilePage /></ProtectedRoute>} />

          {/* Employee Routes */}
          <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/employee/tasks" element={<ProtectedRoute allowedRoles={['employee']}><TaskBoard /></ProtectedRoute>} />
          <Route path="/employee/team" element={<ProtectedRoute allowedRoles={['employee']}><TeamOverview /></ProtectedRoute>} />
          <Route path="/employee/projects" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeProjectTimeline /></ProtectedRoute>} />
          <Route path="/employee/reviews" element={<ProtectedRoute allowedRoles={['employee']}><CodeReviews /></ProtectedRoute>} />
          <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['employee']}><AttendancePortal /></ProtectedRoute>} />
          <Route path="/employee/leave" element={<ProtectedRoute allowedRoles={['employee']}><LeaveRequests /></ProtectedRoute>} />
          <Route path="/employee/payslips" element={<ProtectedRoute allowedRoles={['employee']}><PayslipDownloads /></ProtectedRoute>} />
          <Route path="/employee/calendar" element={<ProtectedRoute allowedRoles={['employee']}><Calendar /></ProtectedRoute>} />
          <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeProfile /></ProtectedRoute>} />
          <Route path="/employee/settings" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeSettings /></ProtectedRoute>} />

          {/* 404 Route - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App