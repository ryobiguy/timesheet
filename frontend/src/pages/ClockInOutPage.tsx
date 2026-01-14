import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { jobsitesApi } from '../lib/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export function ClockInOutPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedJobsiteId, setSelectedJobsiteId] = useState<string>('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string>('')

  const { data: jobsitesData } = useQuery({
    queryKey: ['jobsites'],
    queryFn: () => jobsitesApi.list({ limit: 100 }),
  })

  const { data: activeEntries } = useQuery({
    queryKey: ['time-entries', 'active', user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${API_BASE_URL}/api/time-entries?workerId=${user?.id}&status=PENDING`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await response.json()
      return data.data.filter((e: any) => !e.endAt)
    },
    enabled: !!user,
  })

  const clockMutation = useMutation({
    mutationFn: async (type: 'ENTER' | 'EXIT') => {
      if (!location || !selectedJobsiteId || !user) {
        throw new Error('Missing required information')
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/geofence-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workerId: user.id,
          jobsiteId: selectedJobsiteId,
          type,
          timestamp: new Date().toISOString(),
          source: 'mobile-web',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to clock in/out')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      queryClient.invalidateQueries({ queryKey: ['geofence-events'] })
    },
  })

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          setLocationError('Unable to get location. Please enable location services.')
          console.error('Geolocation error:', error)
        }
      )
    } else {
      setLocationError('Geolocation is not supported by your browser')
    }
  }, [])

  const activeEntry = activeEntries && activeEntries.length > 0 ? activeEntries[0] : null
  const canClockIn = !activeEntry && selectedJobsiteId && location
  const canClockOut = !!activeEntry

  const handleClockIn = () => {
    if (canClockIn) {
      clockMutation.mutate('ENTER')
    }
  }

  const handleClockOut = () => {
    if (canClockOut) {
      clockMutation.mutate('EXIT')
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Clock In/Out</h2>
          <p className="mt-2 text-sm text-slate-600">Tap to record your time</p>
        </div>

        {locationError && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4">
            <p className="text-sm text-red-600">{locationError}</p>
          </div>
        )}

        {location && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-emerald-600">Location</p>
            <p className="mt-1 text-sm text-emerald-700">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <label className="block text-sm font-medium text-slate-700 mb-3">Select Jobsite</label>
          <select
            value={selectedJobsiteId}
            onChange={(e) => setSelectedJobsiteId(e.target.value)}
            disabled={!!activeEntry}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none disabled:opacity-50"
          >
            <option value="">Choose a jobsite...</option>
            {jobsitesData?.data.map((jobsite) => (
              <option key={jobsite.id} value={jobsite.id}>
                {jobsite.name}
              </option>
            ))}
          </select>
        </div>

        {activeEntry && (
          <div className="rounded-3xl border border-amber-300 bg-amber-50 p-4 sm:p-6">
            <p className="text-center text-sm font-semibold text-amber-700">Currently Clocked In</p>
            <p className="mt-2 text-center text-xs text-amber-600">
              Started: {new Date(activeEntry.startAt).toLocaleTimeString()}
            </p>
            <p className="mt-1 text-center text-xs text-amber-600">
              {activeEntry.jobsite?.name}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleClockIn}
            disabled={!canClockIn || clockMutation.isPending}
            className="w-full rounded-2xl bg-emerald-500 px-8 py-6 text-lg font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {clockMutation.isPending ? 'Processing...' : 'Clock In'}
          </button>

          <button
            onClick={handleClockOut}
            disabled={!canClockOut || clockMutation.isPending}
            className="w-full rounded-2xl border border-red-300 bg-red-50 px-8 py-6 text-lg font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {clockMutation.isPending ? 'Processing...' : 'Clock Out'}
          </button>
        </div>

        {clockMutation.isError && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4">
            <p className="text-sm text-red-600">
              {(clockMutation.error as Error)?.message || 'An error occurred'}
            </p>
          </div>
        )}

        {clockMutation.isSuccess && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-600">Successfully recorded!</p>
          </div>
        )}
      </div>
    </div>
  )
}
