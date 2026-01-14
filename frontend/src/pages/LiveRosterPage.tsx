import { useQuery } from '@tanstack/react-query'
import { timeEntriesApi } from '../lib/api'

export function LiveRosterPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['time-entries', 'live'],
    queryFn: () => timeEntriesApi.list({ status: 'PENDING', limit: 100 }),
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading live roster...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-6">
        <p className="text-red-600">Error loading roster: {error.message}</p>
      </div>
    )
  }

  const entries = data?.data || []
  
  // Group entries by jobsite
  const entriesByJobsite = entries.reduce((acc, entry) => {
    const jobsiteName = entry.jobsite?.name || 'Unknown Jobsite'
    if (!acc[jobsiteName]) {
      acc[jobsiteName] = []
    }
    acc[jobsiteName].push(entry)
    return acc
  }, {} as Record<string, typeof entries>)

  // Calculate active workers (those with entries that haven't ended)
  const activeWorkers = entries.filter(entry => !entry.endAt)
  const clockedInCount = activeWorkers.length

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
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
          <h2 className="text-2xl sm:text-3xl font-semibold">Live Roster</h2>
          <p className="mt-2 text-sm text-slate-600">Real-time view of active workers and time entries</p>
        </div>
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 sm:px-6 py-3 w-full sm:w-auto">
          <p className="text-xs uppercase tracking-widest text-emerald-600">Active Now</p>
          <p className="mt-1 text-xl sm:text-2xl font-semibold text-emerald-700">{clockedInCount}</p>
        </div>
      </div>

      {Object.keys(entriesByJobsite).length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-600">No active time entries</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(entriesByJobsite).map(([jobsiteName, siteEntries]) => (
            <div key={jobsiteName} className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{jobsiteName}</h3>
                  <p className="text-sm text-slate-600">
                    {siteEntries.length} {siteEntries.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 px-4 py-2">
                  <span className="text-sm font-semibold text-emerald-600">
                    {siteEntries.filter(e => !e.endAt).length} active
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-slate-200">
                {siteEntries.map((entry) => (
                  <div key={entry.id} className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_120px] items-start sm:items-center gap-3 sm:gap-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{entry.worker?.name || 'Unknown Worker'}</p>
                      <p className="text-sm text-slate-600">{entry.worker?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Started</p>
                      <p className="text-sm font-medium text-slate-900">{formatTime(entry.startAt)}</p>
                      {entry.endAt && (
                        <>
                          <p className="mt-1 text-xs text-slate-500">Ended</p>
                          <p className="text-sm font-medium text-slate-900">{formatTime(entry.endAt)}</p>
                        </>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Duration</p>
                      <p className="text-sm font-medium text-slate-900">
                        {entry.durationMinutes !== null
                          ? formatDuration(entry.durationMinutes)
                          : entry.endAt
                          ? 'Calculating...'
                          : 'In progress'}
                      </p>
                      {entry.status === 'DISPUTED' && (
                        <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">
                          Disputed
                        </span>
                      )}
                    </div>
                    <div className="sm:justify-self-end">
                      {!entry.endAt && (
                        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                          Active
                        </span>
                      )}
                      {entry.status === 'APPROVED' && (
                        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          Approved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
