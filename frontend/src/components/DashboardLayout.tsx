import { useState, useEffect, ReactNode } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { timeEntriesApi } from '../lib/api'

const navItems = [
  { label: 'Overview', path: '/dashboard' },
  { label: 'Jobsites', path: 'jobsites' },
  { label: 'Live Roster', path: 'roster' },
  { label: 'Approvals', path: 'approvals', showBadge: true },
  { label: 'Summaries', path: 'summaries' },
  { label: 'Disputes', path: 'disputes' },
  { label: 'Users', path: 'users' },
  { label: 'Assignments', path: 'assignments' },
  { label: 'Billing', path: 'billing' },
  { label: 'Clock In/Out', path: 'clock' },
]

interface DashboardLayoutProps {
  children?: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps = {}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Get pending approvals count for badge
  const { data: pendingData } = useQuery({
    queryKey: ['time-entries', 'pending-count'],
    queryFn: () => timeEntriesApi.list({ status: 'PENDING', limit: 1 }),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
  const pendingCount = pendingData?.data?.length || 0

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open')
    } else {
      document.body.classList.remove('sidebar-open')
    }
    return () => {
      document.body.classList.remove('sidebar-open')
    }
  }, [sidebarOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 transition"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-widest text-sky-500">Clockly</p>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Geofence Workforce</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">{user?.role}</p>
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-3 sm:px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6 lg:py-10">
        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <aside
            className={`hidden lg:block lg:sticky lg:top-0 h-fit w-[220px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm`}
          >
            <nav className="space-y-2">
              {navItems.map((item) => {
                const showBadge = item.showBadge && pendingCount > 0
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/dashboard'}
                    className={({ isActive }) =>
                      [
                        'block rounded-xl px-4 py-3 text-sm font-medium transition relative',
                        isActive
                          ? 'bg-sky-50 text-sky-600 border border-sky-200'
                          : 'text-slate-600 hover:bg-slate-50',
                      ].join(' ')
                    }
                  >
                    {item.label}
                    {showBadge && (
                      <span className="ml-2 inline-flex items-center justify-center rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                        {pendingCount > 99 ? '99+' : pendingCount}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </aside>

          {/* Mobile Sidebar - Slides in from left */}
          <aside
            className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 z-50 rounded-r-2xl border-r border-b border-slate-200 bg-white p-4 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <nav className="space-y-2 overflow-y-auto h-full pb-8">
              {navItems.map((item) => {
                const showBadge = item.showBadge && pendingCount > 0
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/dashboard'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      [
                        'block rounded-xl px-4 py-3 text-sm font-medium transition relative',
                        isActive
                          ? 'bg-sky-50 text-sky-600 border border-sky-200'
                          : 'text-slate-600 hover:bg-slate-50',
                      ].join(' ')
                    }
                  >
                    {item.label}
                    {showBadge && (
                      <span className="ml-2 inline-flex items-center justify-center rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                        {pendingCount > 99 ? '99+' : pendingCount}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </aside>

          {/* Main Content - Full width on mobile */}
          <main className="flex-1 space-y-6 min-w-0 w-full">
            {children ? children : <Outlet />}
          </main>
        </div>
      </div>
    </div>
  )
}
