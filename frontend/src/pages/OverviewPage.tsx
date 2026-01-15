import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { exportTimeEntries } from '../lib/exportApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

async function fetchStats() {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/api/stats/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }
  return response.json()
}

async function fetchOrganization() {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/api/organizations/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch organization')
  }
  return response.json()
}

export function OverviewPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: fetchStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: orgData } = useQuery({
    queryKey: ['organization'],
    queryFn: fetchOrganization,
  })

  const handleExport = async () => {
    try {
      await exportTimeEntries({ format: 'csv' })
      toast.success('Export downloaded successfully')
    } catch (error) {
      toast.error((error as Error).message || 'Failed to export')
    }
  }

  const handleReview = (entryId: string) => {
    navigate(`/approvals?entry=${entryId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading overview...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-6">
        <p className="text-red-600">Error loading overview: {(error as Error).message}</p>
      </div>
    )
  }

  const stats = data?.data || {
    workersClockedIn: 0,
    sitesActive: 0,
    unapprovedHours: '0',
    pendingEntries: [],
    recentActivity: []
  }

  const crewStats = [
    { 
      label: 'Workers clocked in', 
      value: stats.workersClockedIn.toString(), 
      trend: 'Active now' 
    },
    { 
      label: 'Sites active', 
      value: stats.sitesActive.toString(), 
      trend: 'Today' 
    },
    { 
      label: 'Unapproved hours', 
      value: `${stats.unapprovedHours}h`, 
      trend: 'Needs review' 
    },
  ]

  const pendingEntries = stats.pendingEntries || []
  const companyCode = orgData?.data?.companyCode

  return (
    <div className="space-y-8">
      {/* Company Code Display */}
      {companyCode && (
        <section className="rounded-3xl border-2 border-sky-500 bg-gradient-to-br from-sky-50 to-white p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500">Your Company Code</p>
              <p className="mt-1 text-sm text-slate-600">Share this code with your workers so they can register</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white px-6 py-3 border-2 border-sky-500">
                <p className="text-3xl font-mono font-bold text-sky-600 tracking-widest">
                  {companyCode}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(companyCode)
                  toast.success('Company code copied!')
                }}
                className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition"
              >
                Copy
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-500">Today</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">Live timesheet pulse</h2>
          </div>
          <button 
            onClick={handleExport}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition w-full sm:w-auto"
          >
            Export snapshot
          </button>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {crewStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white border border-slate-200 px-4 py-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">{stat.value}</p>
              <p className="text-sm text-sky-500">{stat.trend}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Entries */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500">Exceptions</p>
              <h2 className="text-2xl font-semibold text-slate-900">Pending timesheet fixes</h2>
            </div>
            <button 
              onClick={() => navigate('/approvals')}
              className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition"
            >
              View all
            </button>
          </header>
          <div className="divide-y divide-slate-200">
            {pendingEntries.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-slate-500">No pending entries</p>
              </div>
            ) : (
              pendingEntries.map((entry: any) => (
                <article key={entry.id} className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1fr_100px] items-start sm:items-center gap-3 sm:gap-4 py-4 text-sm border-b border-slate-200 last:border-0">
                  <div>
                    <p className="font-semibold text-slate-900">{entry.worker}</p>
                    <p className="text-slate-600 text-xs sm:text-sm">{entry.jobsite}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Status</p>
                    <p className="text-amber-600">{entry.status}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Duration</p>
                    <p className="text-slate-900">{entry.duration}</p>
                  </div>
                  <button 
                    onClick={() => handleReview(entry.id)}
                    className="sm:justify-self-end w-full sm:w-auto rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition"
                  >
                    Review
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header>
            <p className="text-sm uppercase tracking-widest text-slate-500">Activity</p>
            <h2 className="text-2xl font-semibold text-slate-900">Recent updates</h2>
          </header>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity: any) => {
                const getActivityIcon = (type: string) => {
                  switch (type) {
                    case 'approved':
                      return '✓'
                    case 'disputed':
                      return '⚠'
                    default:
                      return '•'
                  }
                }
                const getActivityColor = (type: string) => {
                  switch (type) {
                    case 'approved':
                      return 'text-sky-500'
                    case 'disputed':
                      return 'text-red-500'
                    default:
                      return 'text-blue-500'
                  }
                }
                return (
                  <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-slate-200 last:border-0">
                    <div className={`text-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900">
                        <span className="font-semibold">{activity.worker}</span>
                        {' '}
                        {activity.type === 'approved' && 'approved time entry'}
                        {activity.type === 'disputed' && 'disputed time entry'}
                        {activity.type === 'created' && 'clocked in'}
                        {' '}at <span className="font-semibold">{activity.jobsite}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-500">{activity.duration}</p>
                        <span className="text-slate-400">•</span>
                        <p className="text-xs text-slate-500">
                          {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-8 text-center">
                <p className="text-slate-500">No recent activity</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
