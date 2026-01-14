import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

interface WeeklySummary {
  id: string
  workerId: string
  orgId: string
  weekStart: string
  totalRegular: number
  totalOvertime: number
  approvalState: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  worker?: {
    id: string
    name: string
    email: string
  }
}

async function fetchSummaries(params?: {
  workerId?: string
  weekStart?: string
  limit?: number
  offset?: number
}) {
  const token = localStorage.getItem('token')
  const queryParams = new URLSearchParams()
  if (params?.workerId) queryParams.append('workerId', params.workerId)
  if (params?.weekStart) queryParams.append('weekStart', params.weekStart)
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset) queryParams.append('offset', params.offset.toString())

  const response = await fetch(`${API_BASE_URL}/api/summaries?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch summaries')
  }
  return response.json()
}

async function calculateSummary(workerId: string, weekStart: string) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/api/summaries/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ workerId, weekStart }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to calculate summary')
  }
  return response.json()
}

export function WeeklySummariesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('')
  const [weekStart, setWeekStart] = useState<string>(() => {
    // Default to current week (Monday)
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday.toISOString().split('T')[0]
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['summaries', selectedWorkerId, weekStart],
    queryFn: () => fetchSummaries({
      workerId: selectedWorkerId || undefined,
      weekStart: weekStart || undefined,
      limit: 100,
    }),
  })

  const calculateMutation = useMutation({
    mutationFn: ({ workerId, weekStart }: { workerId: string; weekStart: string }) =>
      calculateSummary(workerId, weekStart),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summaries'] })
    },
  })

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`
  }

  const formatWeekStart = (weekStart: string) => {
    const date = new Date(weekStart)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 6)
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'APPROVED':
        return 'text-sky-600 bg-sky-50'
      case 'REJECTED':
        return 'text-red-600 bg-red-400/20'
      default:
        return 'text-amber-300 bg-amber-400/20'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading summaries...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-6">
        <p className="text-red-600">Error loading summaries: {(error as Error).message}</p>
      </div>
    )
  }

  const summaries = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Weekly Summaries</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">View and calculate weekly timesheet summaries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Week Start
            </label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Worker (Optional)
            </label>
            <input
              type="text"
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              placeholder="Filter by worker ID"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                if (selectedWorkerId && weekStart) {
                  calculateMutation.mutate({ workerId: selectedWorkerId, weekStart })
                }
              }}
              disabled={!selectedWorkerId || !weekStart || calculateMutation.isPending}
              className="w-full rounded-xl bg-emerald-400/20 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calculateMutation.isPending ? 'Calculating...' : 'Calculate Summary'}
            </button>
          </div>
        </div>
      </div>

      {/* Summaries List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="space-y-4">
          {summaries.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-600">No summaries found</p>
              <p className="mt-2 text-sm text-slate-500">
                Use the calculate button to generate weekly summaries
              </p>
            </div>
          ) : (
            summaries.map((summary: WeeklySummary) => (
              <div
                key={summary.id}
                className="rounded-2xl border border-slate-300 bg-white p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <p className="font-semibold text-slate-900 text-lg">
                          {summary.worker?.name || 'Unknown Worker'}
                        </p>
                        <p className="text-sm text-slate-600">{summary.worker?.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(summary.approvalState)}`}>
                        {summary.approvalState}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      Week of {formatWeekStart(summary.weekStart)}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-widest text-slate-600 mb-2">
                          Regular Hours
                        </p>
                        <p className="text-2xl font-semibold text-slate-900">
                          {formatHours(summary.totalRegular)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-widest text-slate-600 mb-2">
                          Overtime Hours
                        </p>
                        <p className="text-2xl font-semibold text-amber-300">
                          {formatHours(summary.totalOvertime)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600">
                        Total: <span className="text-slate-900 font-semibold">
                          {formatHours(summary.totalRegular + summary.totalOvertime)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {calculateMutation.isError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {(calculateMutation.error as Error)?.message || 'Failed to calculate summary'}
          </p>
        </div>
      )}

      {calculateMutation.isSuccess && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-300">Summary calculated successfully!</p>
        </div>
      )}
    </div>
  )
}
