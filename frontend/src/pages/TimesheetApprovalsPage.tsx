import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { timeEntriesApi, type TimeEntry } from '../lib/api'
import { exportTimeEntries } from '../lib/exportApi'
import { useAuth } from '../contexts/AuthContext'

export function TimesheetApprovalsPage() {
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'DISPUTED' | 'ALL'>('PENDING')
  const [isExporting, setIsExporting] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data, isLoading, error } = useQuery({
    queryKey: ['time-entries', 'approvals', filter, startDate, endDate],
    queryFn: () =>
      timeEntriesApi.list({
        status: filter === 'ALL' ? undefined : filter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 100,
      }),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      timeEntriesApi.update(id, { status: 'APPROVED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      toast.success('Time entry approved')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve entry')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      timeEntriesApi.update(id, { status: 'DISPUTED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      toast.success('Time entry marked as disputed')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject entry')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Loading time entries...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
        <p className="text-red-300">Error loading entries: {error.message}</p>
      </div>
    )
  }

  const entries = data?.data || []
  const pendingCount = entries.filter(e => e.status === 'PENDING').length
  const disputedCount = entries.filter(e => e.status === 'DISPUTED').length

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">Timesheet Approvals</h2>
          <p className="mt-2 text-sm text-slate-600">Review and approve worker time entries</p>
        </div>
        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none rounded-2xl border border-amber-300 bg-amber-50 px-4 sm:px-6 py-3">
            <p className="text-xs uppercase tracking-widest text-amber-600">Pending</p>
            <p className="mt-1 text-xl sm:text-2xl font-semibold text-amber-700">{pendingCount}</p>
          </div>
          {disputedCount > 0 && (
            <div className="flex-1 sm:flex-none rounded-2xl border border-red-300 bg-red-50 px-4 sm:px-6 py-3">
              <p className="text-xs uppercase tracking-widest text-red-600">Disputed</p>
              <p className="mt-1 text-xl sm:text-2xl font-semibold text-red-700">{disputedCount}</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'PENDING', 'APPROVED', 'DISPUTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                  filter === status
                    ? 'bg-sky-500 text-white'
                    : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-300">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={async () => {
                  try {
                    setIsExporting(true)
                    await exportTimeEntries({
                      status: filter === 'ALL' ? undefined : filter,
                      startDate: startDate || undefined,
                      endDate: endDate || undefined,
                      format: 'csv',
                    })
                    toast.success('Export downloaded successfully')
                  } catch (error) {
                    toast.error((error as Error).message || 'Failed to export')
                  } finally {
                    setIsExporting(false)
                  }
                }}
                disabled={isExporting}
                className="w-full rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-400">No time entries found</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="divide-y divide-slate-200">
            {entries.map((entry) => (
              <TimeEntryCard
                key={entry.id}
                entry={entry}
                onApprove={() => approveMutation.mutate(entry.id)}
                onReject={() => {
                  if (confirm('Mark this entry as disputed?')) {
                    rejectMutation.mutate(entry.id)
                  }
                }}
                isLoading={approveMutation.isPending || rejectMutation.isPending}
                formatDuration={formatDuration}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TimeEntryCard({
  entry,
  onApprove,
  onReject,
  isLoading,
  formatDuration,
  formatDate,
  formatTime,
}: {
  entry: TimeEntry
  onApprove: () => void
  onReject: () => void
  isLoading: boolean
  formatDuration: (minutes: number | null) => string
  formatDate: (dateString: string) => string
  formatTime: (dateString: string) => string
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-start sm:items-center gap-3 sm:gap-4 py-4 border-b border-slate-200 last:border-0">
      <div>
        <p className="font-semibold text-slate-900">{entry.worker?.name || 'Unknown Worker'}</p>
        <p className="text-sm text-slate-600">{entry.jobsite?.name || 'Unknown Jobsite'}</p>
        <p className="mt-1 text-xs text-slate-500">{entry.jobsite?.address}</p>
      </div>
      <div>
        <p className="text-xs text-slate-500">Date</p>
        <p className="text-sm font-medium text-slate-900">{formatDate(entry.startAt)}</p>
        <p className="mt-1 text-xs text-slate-500">
          {formatTime(entry.startAt)} - {entry.endAt ? formatTime(entry.endAt) : 'Ongoing'}
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-500">Duration</p>
        <p className="text-sm font-medium text-slate-900">{formatDuration(entry.durationMinutes)}</p>
      </div>
      <div>
        <p className="text-xs text-slate-500">Status</p>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            entry.status === 'APPROVED'
              ? 'bg-blue-50 text-blue-600'
              : entry.status === 'DISPUTED'
              ? 'bg-red-50 text-red-600'
              : 'bg-amber-50 text-amber-600'
          }`}
        >
          {entry.status}
        </span>
        {entry.disputes && entry.disputes.length > 0 && (
          <p className="mt-1 text-xs text-red-600">
            {entry.disputes.length} {entry.disputes.length === 1 ? 'dispute' : 'disputes'}
          </p>
        )}
      </div>
      {entry.status === 'PENDING' && (
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600 disabled:opacity-50 w-full sm:w-auto"
          >
            Approve
          </button>
          <button
            onClick={onReject}
            disabled={isLoading}
            className="rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 w-full sm:w-auto"
          >
            Dispute
          </button>
        </div>
      )}
    </div>
  )
}
