import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { OverviewPage } from './pages/OverviewPage'
import { JobsitesPage } from './pages/JobsitesPage'
import { LiveRosterPage } from './pages/LiveRosterPage'
import { TimesheetApprovalsPage } from './pages/TimesheetApprovalsPage'
import { WeeklySummariesPage } from './pages/WeeklySummariesPage'
import { DisputesPage } from './pages/DisputesPage'
import { UsersPage } from './pages/UsersPage'
import { AssignmentsPage } from './pages/AssignmentsPage'
import { BillingPage } from './pages/BillingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ClockInOutPage } from './pages/ClockInOutPage'
import { LandingPage } from './pages/LandingPage'
import { CompanySignupPage } from './pages/CompanySignupPage'

export function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/signup" element={<CompanySignupPage />} />
      
      {/* Protected dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="jobsites" element={<JobsitesPage />} />
        <Route path="roster" element={<LiveRosterPage />} />
        <Route path="approvals" element={<TimesheetApprovalsPage />} />
        <Route path="summaries" element={<WeeklySummariesPage />} />
        <Route path="disputes" element={<DisputesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="clock" element={<ClockInOutPage />} />
      </Route>
      
      {/* Redirect authenticated users trying to access root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
