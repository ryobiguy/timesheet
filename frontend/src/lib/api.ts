const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export interface ApiResponse<T> {
  data: T
  pagination?: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface Jobsite {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  radiusMeters: number
  orgId: string
  createdAt: string
  updatedAt: string
  org?: {
    id: string
    name: string
  }
  _count?: {
    assignments: number
    entries: number
    events: number
  }
}

export interface TimeEntry {
  id: string
  workerId: string
  jobsiteId: string
  startAt: string
  endAt: string | null
  durationMinutes: number | null
  status: 'PENDING' | 'APPROVED' | 'DISPUTED'
  createdFromEvents: string[]
  modifiedBy: string | null
  createdAt: string
  updatedAt: string
  worker?: {
    id: string
    name: string
    email: string
  }
  jobsite?: {
    id: string
    name: string
    address: string
    latitude?: number
    longitude?: number
    radiusMeters?: number
  }
  disputes?: Array<{
    id: string
    reason: string
    createdAt: string
  }>
  _meta?: {
    geofenceVerified: boolean
    hasGeofenceEvents: boolean
    isManualEdit: boolean
    eventCount: number
  }
}

export interface CreateJobsiteInput {
  name: string
  address: string
  latitude: number
  longitude: number
  radiusMeters?: number
  orgId: string
}

export interface UpdateJobsiteInput {
  name?: string
  address?: string
  latitude?: number
  longitude?: number
  radiusMeters?: number
}

export interface CreateTimeEntryInput {
  workerId: string
  jobsiteId: string
  startAt: string | Date
  endAt?: string | Date | null
  durationMinutes?: number | null
  status?: 'PENDING' | 'APPROVED' | 'DISPUTED'
  createdFromEvents?: string[]
}

export interface UpdateTimeEntryInput {
  startAt?: string | Date
  endAt?: string | Date | null
  durationMinutes?: number | null
  status?: 'PENDING' | 'APPROVED' | 'DISPUTED'
  modifiedBy?: string
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = localStorage.getItem('token')
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Jobsites API
export const jobsitesApi = {
  list: async (params?: { 
    orgId?: string
    search?: string
    limit?: number
    offset?: number
    sortBy?: 'name' | 'createdAt' | 'updatedAt'
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<Jobsite[]>> => {
    const queryParams = new URLSearchParams()
    if (params?.orgId) queryParams.append('orgId', params.orgId)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    
    const query = queryParams.toString()
    return fetchApi<ApiResponse<Jobsite[]>>(`/api/jobsites${query ? `?${query}` : ''}`)
  },

  get: async (id: string): Promise<ApiResponse<Jobsite>> => {
    return fetchApi<ApiResponse<Jobsite>>(`/api/jobsites/${id}`)
  },

  create: async (data: CreateJobsiteInput): Promise<ApiResponse<Jobsite>> => {
    return fetchApi<ApiResponse<Jobsite>>('/api/jobsites', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: UpdateJobsiteInput): Promise<ApiResponse<Jobsite>> => {
    return fetchApi<ApiResponse<Jobsite>>(`/api/jobsites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string): Promise<void> => {
    return fetchApi<void>(`/api/jobsites/${id}`, {
      method: 'DELETE',
    })
  },
}

// Time Entries API
export const timeEntriesApi = {
  list: async (params?: {
    workerId?: string
    jobsiteId?: string
    status?: 'PENDING' | 'APPROVED' | 'DISPUTED'
    startDate?: Date | string
    endDate?: Date | string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<TimeEntry[]>> => {
    const queryParams = new URLSearchParams()
    if (params?.workerId) queryParams.append('workerId', params.workerId)
    if (params?.jobsiteId) queryParams.append('jobsiteId', params.jobsiteId)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.startDate) {
      const date = params.startDate instanceof Date ? params.startDate.toISOString() : params.startDate
      queryParams.append('startDate', date)
    }
    if (params?.endDate) {
      const date = params.endDate instanceof Date ? params.endDate.toISOString() : params.endDate
      queryParams.append('endDate', date)
    }
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    
    const query = queryParams.toString()
    return fetchApi<ApiResponse<TimeEntry[]>>(`/api/time-entries${query ? `?${query}` : ''}`)
  },

  get: async (id: string): Promise<ApiResponse<TimeEntry>> => {
    return fetchApi<ApiResponse<TimeEntry>>(`/api/time-entries/${id}`)
  },

  create: async (data: CreateTimeEntryInput): Promise<ApiResponse<TimeEntry>> => {
    return fetchApi<ApiResponse<TimeEntry>>('/api/time-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: UpdateTimeEntryInput): Promise<ApiResponse<TimeEntry>> => {
    return fetchApi<ApiResponse<TimeEntry>>(`/api/time-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string): Promise<void> => {
    return fetchApi<void>(`/api/time-entries/${id}`, {
      method: 'DELETE',
    })
  },
}
