import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { jobsitesApi } from '../lib/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

interface Assignment {
  id: string
  workerId: string
  jobsiteId: string
  scheduleDays: string[]
  createdAt: string
  updatedAt: string
  worker?: {
    id: string
    name: string
    email: string
    role: string
  }
  jobsite?: {
    id: string
    name: string
    address: string
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

async function fetchAssignments(params?: {
  workerId?: string
  jobsiteId?: string
  limit?: number
  offset?: number
}) {
  const token = localStorage.getItem('token')
  const queryParams = new URLSearchParams()
  if (params?.workerId) queryParams.append('workerId', params.workerId)
  if (params?.jobsiteId) queryParams.append('jobsiteId', params.jobsiteId)
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset) queryParams.append('offset', params.offset.toString())

  const response = await fetch(`${API_BASE_URL}/api/assignments?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch assignments')
  }
  return response.json()
}

async function fetchWorkers() {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/api/users?role=WORKER&limit=100`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch workers')
  }
  return response.json()
}

async function createAssignment(data: { workerId: string; jobsiteId: string; scheduleDays: string[] }) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/api/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create assignment')
  }
  return response.json()
}

async function updateAssignment(id: string, data: { scheduleDays: string[] }) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/api/assignments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update assignment')
  }
  return response.json()
}

async function deleteAssignment(id: string) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/api/assignments/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete assignment')
  }
}

export function AssignmentsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [selectedJobsiteId, setSelectedJobsiteId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [scheduleDays, setScheduleDays] = useState<string[]>([])

  const { data, isLoading, error } = useQuery({
    queryKey: ['assignments', selectedWorkerId, selectedJobsiteId],
    queryFn: () => fetchAssignments({
      workerId: selectedWorkerId || undefined,
      jobsiteId: selectedJobsiteId || undefined,
      limit: 100,
    }),
  })

  const { data: workersData } = useQuery({
    queryKey: ['workers'],
    queryFn: fetchWorkers,
  })

  const { data: jobsitesData } = useQuery({
    queryKey: ['jobsites'],
    queryFn: () => jobsitesApi.list({ limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      setIsCreating(false)
      setSelectedWorkerId('')
      setSelectedJobsiteId('')
      setScheduleDays([])
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { scheduleDays: string[] } }) =>
      updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      setEditingId(null)
      setScheduleDays([])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const toggleDay = (day: string) => {
    if (scheduleDays.includes(day)) {
      setScheduleDays(scheduleDays.filter(d => d !== day))
    } else {
      setScheduleDays([...scheduleDays, day])
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading assignments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
        <p className="text-red-300">Error loading assignments: {(error as Error).message}</p>
      </div>
    )
  }

  const assignments = data?.data || []
  const workers = workersData?.data || []
  const jobsites = jobsitesData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Assignments</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">Manage worker-to-jobsite assignments</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'SUPERVISOR') && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 w-full sm:w-auto"
          >
            {isCreating ? 'Cancel' : 'Create Assignment'}
          </button>
        )}
      </div>

      {/* Create Assignment Form */}
      {isCreating && (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Worker</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
                >
                  <option value="">Select a worker...</option>
                  {workers.map((worker: User) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} ({worker.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jobsite</label>
                <select
                  value={selectedJobsiteId}
                  onChange={(e) => setSelectedJobsiteId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
                >
                  <option value="">Select a jobsite...</option>
                  {jobsites.map((jobsite) => (
                    <option key={jobsite.id} value={jobsite.id}>
                      {jobsite.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Schedule Days</label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      scheduleDays.includes(day)
                        ? 'bg-sky-500 text-white'
                        : 'border border-white/20 text-slate-700 hover:bg-white/5'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                if (selectedWorkerId && selectedJobsiteId) {
                  createMutation.mutate({
                    workerId: selectedWorkerId,
                    jobsiteId: selectedJobsiteId,
                    scheduleDays,
                  })
                }
              }}
              disabled={!selectedWorkerId || !selectedJobsiteId || createMutation.isPending}
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
          {createMutation.isError && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-sm text-red-300">
                {(createMutation.error as Error)?.message || 'Failed to create assignment'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white/5 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Worker</label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
            >
              <option value="">All Workers</option>
              {workers.map((worker: User) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Jobsite</label>
            <select
              value={selectedJobsiteId}
              onChange={(e) => setSelectedJobsiteId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
            >
              <option value="">All Jobsites</option>
              {jobsites.map((jobsite) => (
                <option key={jobsite.id} value={jobsite.id}>
                  {jobsite.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="rounded-3xl border border-slate-200 bg-white/5 p-6 shadow-sm">
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-600">No assignments found</p>
            </div>
          ) : (
            assignments.map((assignment: Assignment) => (
              <div
                key={assignment.id}
                className="rounded-2xl border border-slate-300 bg-white p-4 sm:p-6 hover:bg-slate-50 transition-colors"
              >
                {editingId === assignment.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Schedule Days</label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                              scheduleDays.includes(day)
                                ? 'bg-sky-500 text-white'
                                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          updateMutation.mutate({ id: assignment.id, data: { scheduleDays } })
                        }}
                        disabled={updateMutation.isPending}
                        className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setScheduleDays([])
                        }}
                        className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {assignment.worker?.name || 'Unknown Worker'}
                          </h3>
                          <p className="text-sm text-slate-600">{assignment.worker?.email}</p>
                        </div>
                        <span className="text-slate-500 hidden sm:inline">→</span>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {assignment.jobsite?.name || 'Unknown Jobsite'}
                          </h3>
                          <p className="text-sm text-slate-600">{assignment.jobsite?.address}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs uppercase tracking-widest text-slate-600 mb-2">Schedule</p>
                        <div className="flex flex-wrap gap-2">
                          {assignment.scheduleDays && assignment.scheduleDays.length > 0 ? (
                            assignment.scheduleDays.map((day) => (
                              <span
                                key={day}
                                className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500 text-sky-500"
                              >
                                {day}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">No schedule set</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {(user?.role === 'ADMIN' || user?.role === 'SUPERVISOR') && (
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            setEditingId(assignment.id)
                            setScheduleDays(assignment.scheduleDays || [])
                          }}
                          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit Schedule
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this assignment?')) {
                              deleteMutation.mutate(assignment.id)
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
