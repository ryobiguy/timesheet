import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { timeEntriesApi, type TimeEntry } from '../lib/api'
import { exportTimeEntries } from '../lib/exportApi'
import { useAuth } from '../contexts/AuthContext'

export function TimesheetApprovalsPage() {
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'DISPUTED' | 'ALL'>('PENDING')
  const [isExporting, setIsExporting] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set())
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const navigate = useNavigate()

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
      setSelectedEntries(new Set())
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve entry')
    },
  })

  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => timeEntriesApi.update(id, { status: 'APPROVED' })))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      toast.success(`${selectedEntries.size} entries approved`)
      setSelectedEntries(new Set())
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve entries')
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
  const pendingEntries = entries.filter(e => e.status === 'PENDING')
  const pendingCount = pendingEntries.length
  const disputedCount = entries.filter(e => e.status === 'DISPUTED').length

  // Calculate summary stats
  const totalHours = pendingEntries.reduce((sum, entry) => {
    const hours = entry.durationMinutes ? entry.durationMinutes / 60 : 0
    return sum + hours
  }, 0)
  const uniqueWorkers = new Set(pendingEntries.map(e => e.workerId)).size
  // Estimate cost at £15/hour (can be made configurable)
  const estimatedCost = totalHours * 15

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

  const handleSelectAll = () => {
    if (selectedEntries.size === pendingEntries.length) {
      setSelectedEntries(new Set())
    } else {
      setSelectedEntries(new Set(pendingEntries.map(e => e.id)))
    }
  }

  const handleBulkApprove = () => {
    if (selectedEntries.size === 0) {
      toast.error('Please select entries to approve')
      return
    }
    if (confirm(`Approve ${selectedEntries.size} time entries?`)) {
      bulkApproveMutation.mutate(Array.from(selectedEntries))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">Timesheet Approvals</h2>
          <p className="mt-2 text-sm text-slate-600">Review and approve worker time entries</p>
        </div>
        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
          <div className={`flex-1 sm:flex-none rounded-2xl border px-4 sm:px-6 py-3 transition ${
            pendingCount > 0 
              ? 'border-amber-400 bg-amber-50 shadow-sm' 
              : 'border-amber-300 bg-amber-50'
          }`}>
            <p className="text-xs uppercase tracking-widest text-amber-600">Pending</p>
            <p className={`mt-1 text-xl sm:text-2xl font-semibold ${
              pendingCount > 0 ? 'text-amber-800' : 'text-amber-700'
            }`}>
              {pendingCount}
            </p>
          </div>
          {disputedCount > 0 && (
            <div className="flex-1 sm:flex-none rounded-2xl border border-red-300 bg-red-50 px-4 sm:px-6 py-3">
              <p className="text-xs uppercase tracking-widest text-red-600">Disputed</p>
              <p className="mt-1 text-xl sm:text-2xl font-semibold text-red-700">{disputedCount}</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      {pendingCount > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-50 to-blue-50 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Hours Pending</p>
              <p className="text-2xl font-bold text-slate-900">{totalHours.toFixed(1)}h</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Workers with Entries</p>
              <p className="text-2xl font-bold text-slate-900">{uniqueWorkers}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Estimated Payroll Cost</p>
              <p className="text-2xl font-bold text-slate-900">£{estimatedCost.toFixed(0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center justify-between">
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
            {filter === 'PENDING' && pendingCount > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {selectedEntries.size === pendingCount ? 'Deselect All' : 'Select All'}
                </button>
                {selectedEntries.size > 0 && (
                  <button
                    onClick={handleBulkApprove}
                    disabled={bulkApproveMutation.isPending}
                    className="rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                  >
                    Approve {selectedEntries.size}
                  </button>
                )}
              </div>
            )}
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
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {filter === 'PENDING' 
                ? 'No pending time entries' 
                : 'No time entries found'}
            </h3>
            <p className="text-slate-600 mb-6">
              {filter === 'PENDING' 
                ? 'Workers will appear here once they clock out of a jobsite. All time entries are currently approved or disputed.'
                : 'Try adjusting your filters or date range to see more entries.'}
            </p>
            {filter === 'PENDING' && (
              <button
                onClick={() => navigate('/dashboard/roster')}
                className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600 transition"
              >
                View Live Roster
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="divide-y divide-slate-200">
            {entries.map((entry) => (
              <TimeEntryCard
                key={entry.id}
                entry={entry}
                isExpanded={expandedEntry === entry.id}
                isSelected={selectedEntries.has(entry.id)}
                onExpand={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                onSelect={(selected) => {
                  const newSet = new Set(selectedEntries)
                  if (selected) {
                    newSet.add(entry.id)
                  } else {
                    newSet.delete(entry.id)
                  }
                  setSelectedEntries(newSet)
                }}
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
  isExpanded,
  isSelected,
  onExpand,
  onSelect,
  onApprove,
  onReject,
  isLoading,
  formatDuration,
  formatDate,
  formatTime,
}: {
  entry: TimeEntry
  isExpanded: boolean
  isSelected: boolean
  onExpand: () => void
  onSelect: (selected: boolean) => void
  onApprove: () => void
  onReject: () => void
  isLoading: boolean
  formatDuration: (minutes: number | null) => string
  formatDate: (dateString: string) => string
  formatTime: (dateString: string) => string
}) {
  const meta = entry._meta || {}
  const isPending = entry.status === 'PENDING'

  return (
    <div className="py-4 border-b border-slate-200 last:border-0">
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1.5fr_1fr_1fr_1fr_auto] items-start sm:items-center gap-3 sm:gap-4">
        {isPending && (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
            />
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-900">{entry.worker?.name || 'Unknown Worker'}</p>
          <p className="text-sm text-slate-600">{entry.jobsite?.name || 'Unknown Jobsite'}</p>
          <p className="mt-1 text-xs text-slate-500">{entry.jobsite?.address}</p>
          {/* Trust Signals */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {meta.geofenceVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                <span>✔</span> Geofence verified
              </span>
            )}
            {meta.hasGeofenceEvents && !meta.geofenceVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                <span>⚠</span> Partial geofence data
              </span>
            )}
            {!meta.hasGeofenceEvents && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                <span>📍</span> No geofence data
              </span>
            )}
            {meta.isManualEdit && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                <span>⏱</span> Manual edit
              </span>
            )}
          </div>
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
        {isPending && (
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              onClick={onExpand}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 w-full sm:w-auto"
            >
              {isExpanded ? 'Hide' : 'Details'}
            </button>
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

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Jobsite Details</h4>
              <p className="text-sm text-slate-600">{entry.jobsite?.address}</p>
              {entry.jobsite?.latitude && entry.jobsite?.longitude && (
                <p className="text-xs text-slate-500 mt-1">
                  Location: {entry.jobsite.latitude.toFixed(6)}, {entry.jobsite.longitude.toFixed(6)}
                </p>
              )}
              {entry.jobsite?.radiusMeters && (
                <p className="text-xs text-slate-500">Geofence radius: {entry.jobsite.radiusMeters}m</p>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Verification</h4>
              <div className="space-y-1 text-sm text-slate-600">
                <p>Geofence events: {meta.eventCount || 0}</p>
                <p>Created: {new Date(entry.createdAt).toLocaleString()}</p>
                {entry.modifiedBy && (
                  <p className="text-amber-600">Modified by supervisor</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
