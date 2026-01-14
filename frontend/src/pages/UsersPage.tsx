import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'SUPERVISOR' | 'WORKER'
  orgId: string
  createdAt: string
  updatedAt: string
  _count?: {
    entries: number
    assignments: number
  }
}

async function fetchUsers(params?: {
  orgId?: string
  role?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const token = localStorage.getItem('token')
  const queryParams = new URLSearchParams()
  if (params?.orgId) queryParams.append('orgId', params.orgId)
  if (params?.role) queryParams.append('role', params.role)
  if (params?.search) queryParams.append('search', params.search)
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset) queryParams.append('offset', params.offset.toString())

  const response = await fetch(`${API_BASE_URL}/api/users?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return response.json()
}

async function updateUser(id: string, data: { name?: string; email?: string; role?: string }) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update user')
  }
  return response.json()
}

async function deleteUser(id: string) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete user')
  }
}

async function resetPassword(id: string, newPassword: string) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/api/users/${id}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to reset password')
  }
  return response.json()
}

export function UsersPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ADMIN' | 'SUPERVISOR' | 'WORKER' | 'ALL'>('ALL')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<Partial<User>>({})
  const [resettingPasswordId, setResettingPasswordId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', search, roleFilter],
    queryFn: () => fetchUsers({
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      search: search || undefined,
      limit: 100,
    }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setEditingId(null)
      setEditingUser({})
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => resetPassword(id, password),
    onSuccess: () => {
      setResettingPasswordId(null)
      setNewPassword('')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-red-700 bg-red-50 border border-red-200'
      case 'SUPERVISOR':
        return 'text-blue-700 bg-blue-50 border border-blue-200'
      default:
        return 'text-sky-700 bg-sky-50 border border-sky-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading users...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-6">
        <p className="text-red-600">Error loading users: {(error as Error).message}</p>
      </div>
    )
  }

  const users = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">User Management</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">Manage users and their roles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="WORKER">Worker</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-600">No users found</p>
            </div>
          ) : (
            users.map((u: User) => (
              <div
                key={u.id}
                className="rounded-2xl border border-slate-300 bg-white p-4 sm:p-6 hover:bg-slate-50 transition-colors"
              >
                {editingId === u.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={editingUser.name || u.name}
                          onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={editingUser.email || u.email}
                          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                        <select
                          value={editingUser.role || u.role}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
                        >
                          <option value="WORKER">Worker</option>
                          <option value="SUPERVISOR">Supervisor</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => {
                          updateMutation.mutate({ id: u.id, data: editingUser })
                        }}
                        disabled={updateMutation.isPending}
                        className="flex-1 sm:flex-none rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 transition"
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditingUser({})
                        }}
                        className="flex-1 sm:flex-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">{u.name}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getRoleColor(u.role)}`}>
                            {u.role}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2 break-words">{u.email}</p>
                        {u._count && (
                          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
                            <span>{u._count.entries || 0} time entries</span>
                            <span>{u._count.assignments || 0} assignments</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {user?.role === 'ADMIN' && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => {
                            setEditingId(u.id)
                            setEditingUser({ name: u.name, email: u.email, role: u.role })
                          }}
                          className="flex-1 sm:flex-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setResettingPasswordId(u.id)}
                          className="flex-1 sm:flex-none rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${u.name}?`)) {
                              deleteMutation.mutate(u.id)
                            }
                          }}
                          disabled={deleteMutation.isPending || u.id === user.id}
                          className="flex-1 sm:flex-none rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
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

      {/* Reset Password Modal */}
      {resettingPasswordId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Reset Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    if (newPassword.length >= 6) {
                      resetPasswordMutation.mutate({ id: resettingPasswordId, password: newPassword })
                    }
                  }}
                  disabled={newPassword.length < 6 || resetPasswordMutation.isPending}
                  className="flex-1 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                </button>
                <button
                  onClick={() => {
                    setResettingPasswordId(null)
                    setNewPassword('')
                  }}
                  className="flex-1 sm:flex-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {updateMutation.isError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {(updateMutation.error as Error)?.message || 'Failed to update user'}
          </p>
        </div>
      )}

      {deleteMutation.isError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {(deleteMutation.error as Error)?.message || 'Failed to delete user'}
          </p>
        </div>
      )}
    </div>
  )
}
