import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { jobsitesApi, type Jobsite, type CreateJobsiteInput, type UpdateJobsiteInput } from '../lib/api'

export function JobsitesPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobsites', search, sortBy, sortOrder],
    queryFn: () => jobsitesApi.list({ 
      limit: 100,
      search: search || undefined,
      sortBy,
      sortOrder
    }),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateJobsiteInput) => jobsitesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobsites'] })
      setIsCreating(false)
      toast.success('Jobsite created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create jobsite')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobsiteInput }) =>
      jobsitesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobsites'] })
      setEditingId(null)
      toast.success('Jobsite updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update jobsite')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobsitesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobsites'] })
      toast.success('Jobsite deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete jobsite')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Loading jobsites...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
        <p className="text-red-300">Error loading jobsites: {error.message}</p>
      </div>
    )
  }

  const jobsites = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">Jobsite Management</h2>
          <p className="mt-2 text-sm text-slate-600">Manage construction sites and geofences</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded-full bg-sky-500 px-4 sm:px-6 py-2 sm:py-3 text-sm font-semibold text-white hover:bg-sky-600 w-full sm:w-auto"
        >
          + Add Jobsite
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or address..."
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
        />
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 sm:flex-none rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Name</option>
            <option value="updatedAt">Last Updated</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {isCreating && (
        <JobsiteForm
          onSubmit={(data) => {
            createMutation.mutate(data)
          }}
          onCancel={() => setIsCreating(false)}
          isLoading={createMutation.isPending}
        />
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {jobsites.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400">No jobsites found. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobsites.map((jobsite) => (
              <JobsiteCard
                key={jobsite.id}
                jobsite={jobsite}
                isEditing={editingId === jobsite.id}
                onEdit={() => setEditingId(jobsite.id)}
                onCancel={() => setEditingId(null)}
                onUpdate={(data) => updateMutation.mutate({ id: jobsite.id, data })}
                onDelete={() => {
                  if (confirm('Are you sure you want to delete this jobsite?')) {
                    deleteMutation.mutate(jobsite.id)
                  }
                }}
                isLoading={updateMutation.isPending || deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function JobsiteCard({
  jobsite,
  isEditing,
  onEdit,
  onCancel,
  onUpdate,
  onDelete,
  isLoading,
}: {
  jobsite: Jobsite
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onUpdate: (data: UpdateJobsiteInput) => void
  onDelete: () => void
  isLoading: boolean
}) {
  if (isEditing) {
    return (
      <JobsiteForm
        initialData={jobsite}
        onSubmit={onUpdate}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-start sm:items-center gap-4 sm:gap-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-semibold">{jobsite.name}</h3>
        <p className="text-sm text-slate-600">{jobsite.address}</p>
        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-slate-500">
          <span>📍 {jobsite.latitude.toFixed(6)}, {jobsite.longitude.toFixed(6)}</span>
          <span>📏 {jobsite.radiusMeters}m radius</span>
          {jobsite._count && (
            <>
              <span>👷 {jobsite._count.assignments} assignments</span>
              <span>⏱️ {jobsite._count.entries} entries</span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-2 justify-end sm:justify-start">
        <button
          onClick={onEdit}
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          disabled={isLoading}
          className="rounded-full border border-red-300 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function JobsiteForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initialData?: Jobsite
  onSubmit: (data: CreateJobsiteInput | UpdateJobsiteInput) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    latitude: initialData?.latitude.toString() || '',
    longitude: initialData?.longitude.toString() || '',
    radiusMeters: initialData?.radiusMeters.toString() || '150',
    orgId: initialData?.orgId || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      address: formData.address,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radiusMeters: parseInt(formData.radiusMeters),
      ...(initialData ? {} : { orgId: formData.orgId }),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
            placeholder="A12 Riverside Tower"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
            placeholder="123 Main St, City, State"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Latitude</label>
          <input
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
            placeholder="40.7128"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Longitude</label>
          <input
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
            placeholder="-74.0060"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Radius (meters)</label>
          <input
            type="number"
            value={formData.radiusMeters}
            onChange={(e) => setFormData({ ...formData, radiusMeters: e.target.value })}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
          />
        </div>
        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Organization ID</label>
            <input
              type="text"
              value={formData.orgId}
              onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
              placeholder="cuid..."
            />
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 w-full sm:w-auto"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
