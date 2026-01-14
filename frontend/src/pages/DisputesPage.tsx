import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { timeEntriesApi } from '../lib/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

interface Dispute {
  id: string
  timeEntryId: string
  raisedBy: string
  reason: string
  resolution: string | null
  resolvedBy: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
  timeEntry?: {
    id: string
    workerId: string
    jobsiteId: string
    startAt: string
    endAt: string | null
    durationMinutes: number | null
    status: string
    worker?: {
      id: string
      name: string
      email: string
    }
    jobsite?: {
      id: string
      name: string
      address: string
    }
  }
  raisedByUser?: {
    id: string
    name: string
    email: string
  }
}

async function fetchDisputes(params?: {
  timeEntryId?: string
  status?: 'open' | 'resolved'
  limit?: number
  offset?: number
}) {
  const token = localStorage.getItem('token')
  const queryParams = new URLSearchParams()
  if (params?.timeEntryId) queryParams.append('timeEntryId', params.timeEntryId)
  if (params?.status) queryParams.append('status', params.status)
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset) queryParams.append('offset', params.offset.toString())

  const response = await fetch(`${API_BASE_URL}/api/disputes?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch disputes')
  }
  return response.json()
}

async function createDispute(timeEntryId: string, reason: string) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/api/disputes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ timeEntryId, reason }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create dispute')
  }
  return response.json()
}

async function resolveDispute(id: string, resolution: string) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/api/disputes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ resolution }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to resolve dispute')
  }
  return response.json()
}

export function DisputesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTimeEntryId, setSelectedTimeEntryId] = useState('')
  const [disputeReason, setDisputeReason] = useState('')
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [resolutionText, setResolutionText] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['disputes', filter],
    queryFn: () => fetchDisputes({
      status: filter === 'all' ? undefined : filter,
      limit: 100,
    }),
  })

  const { data: timeEntriesData } = useQuery({
    queryKey: ['time-entries', 'for-dispute'],
    queryFn: () => timeEntriesApi.list({ limit: 100 }),
    enabled: showCreateForm,
  })

  const createMutation = useMutation({
    mutationFn: ({ timeEntryId, reason }: { timeEntryId: string; reason: string }) =>
      createDispute(timeEntryId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] })
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      setShowCreateForm(false)
      setSelectedTimeEntryId('')
      setDisputeReason('')
    },
  })

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) =>
      resolveDispute(id, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] })
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      setResolvingId(null)
      setResolutionText('')
    },
  })

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading disputes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
        <p className="text-red-300">Error loading disputes: {(error as Error).message}</p>
      </div>
    )
  }

  const disputes = data?.data || []
  const openCount = disputes.filter((d: Dispute) => !d.resolution).length
  const resolvedCount = disputes.filter((d: Dispute) => d.resolution).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Disputes</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">Manage time entry disputes</p>
        </div>
        {user?.role === 'WORKER' && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 w-full sm:w-auto"
          >
            {showCreateForm ? 'Cancel' : 'Create Dispute'}
          </button>
        )}
      </div>

      {/* Create Dispute Form */}
      {showCreateForm && (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Create New Dispute</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Time Entry
              </label>
              <select
                value={selectedTimeEntryId}
                onChange={(e) => setSelectedTimeEntryId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
              >
                <option value="">Select a time entry...</option>
                {timeEntriesData?.data.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.worker?.name} - {entry.jobsite?.name} ({formatDuration(entry.durationMinutes)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason
              </label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain why you're disputing this time entry..."
                rows={4}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                if (selectedTimeEntryId && disputeReason) {
                  createMutation.mutate({ timeEntryId: selectedTimeEntryId, reason: disputeReason })
                }
              }}
              disabled={!selectedTimeEntryId || !disputeReason || createMutation.isPending}
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Creating...' : 'Submit Dispute'}
            </button>
          </div>
          {createMutation.isError && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-sm text-red-300">
                {(createMutation.error as Error)?.message || 'Failed to create dispute'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('open')}
          className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition ${
            filter === 'open'
              ? 'bg-amber-50 text-amber-600'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Open ({openCount})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition ${
            filter === 'resolved'
              ? 'bg-sky-500 text-white'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Resolved ({resolvedCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition ${
            filter === 'all'
              ? 'bg-slate-200 text-slate-700'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All
        </button>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {disputes.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/5 p-12 text-center">
            <p className="text-slate-600">No disputes found</p>
          </div>
        ) : (
          disputes.map((dispute: Dispute) => (
            <div
              key={dispute.id}
              className="rounded-3xl border border-slate-200 bg-white/5 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        dispute.resolution
                          ? 'text-sky-500 bg-sky-500'
                          : 'text-amber-300 bg-amber-400/20'
                      }`}
                    >
                      {dispute.resolution ? 'Resolved' : 'Open'}
                    </span>
                    <p className="text-sm text-slate-600">
                      Raised by {dispute.raisedByUser?.name || 'Unknown'} on {formatDate(dispute.createdAt)}
                    </p>
                  </div>
                  {dispute.timeEntry && (
                    <div className="mt-3 p-4 rounded-xl bg-slate-50">
                      <p className="text-sm text-slate-600 mb-1">Time Entry</p>
                      <p className="font-semibold text-slate-900">
                        {dispute.timeEntry.worker?.name} - {dispute.timeEntry.jobsite?.name}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {formatDuration(dispute.timeEntry.durationMinutes)} • {formatDate(dispute.timeEntry.startAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-600 mb-1">Reason</p>
                  <p className="text-slate-900">{dispute.reason}</p>
                </div>

                {dispute.resolution && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-600 mb-1">Resolution</p>
                    <p className="text-sky-500">{dispute.resolution}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Resolved on {dispute.resolvedAt ? formatDate(dispute.resolvedAt) : 'N/A'}
                    </p>
                  </div>
                )}

                {!dispute.resolution && (user?.role === 'ADMIN' || user?.role === 'SUPERVISOR') && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    {resolvingId === dispute.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={resolutionText}
                          onChange={(e) => setResolutionText(e.target.value)}
                          placeholder="Enter resolution..."
                          rows={3}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (resolutionText) {
                                resolveMutation.mutate({ id: dispute.id, resolution: resolutionText })
                              }
                            }}
                            disabled={!resolutionText || resolveMutation.isPending}
                            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
                          >
                            {resolveMutation.isPending ? 'Resolving...' : 'Resolve'}
                          </button>
                          <button
                            onClick={() => {
                              setResolvingId(null)
                              setResolutionText('')
                            }}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResolvingId(dispute.id)}
                        className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
                      >
                        Resolve Dispute
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
