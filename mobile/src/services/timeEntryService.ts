import { api } from '../config/api'

export interface TimeEntry {
  id: string
  workerId: string
  jobsiteId: string
  startAt: string
  endAt: string | null
  durationMinutes: number | null
  status: 'PENDING' | 'APPROVED' | 'DISPUTED'
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
  disputes?: Array<{
    id: string
    reason: string
    createdAt: string
  }>
}

export const timeEntryService = {
  async getTimeEntries(workerId: string): Promise<TimeEntry[]> {
    try {
      const response = await api.get<{ data: TimeEntry[] }>(
        `/api/time-entries?workerId=${workerId}&limit=100`
      )
      return response.data?.data || []
    } catch (error) {
      console.error('Failed to get time entries:', error)
      throw error
    }
  },

  async getActiveTimeEntry(workerId: string): Promise<TimeEntry | null> {
    try {
      const entries = await this.getTimeEntries(workerId)
      return entries.find((e) => e.endAt === null) || null
    } catch (error) {
      console.error('Failed to get active time entry:', error)
      return null
    }
  },

  async getPendingApprovals(orgId?: string): Promise<TimeEntry[]> {
    try {
      const url = orgId 
        ? `/api/time-entries?status=PENDING&limit=100`
        : `/api/time-entries?status=PENDING&limit=100`
      const response = await api.get<{ data: TimeEntry[] }>(url)
      return response.data?.data || []
    } catch (error) {
      console.error('Failed to get pending approvals:', error)
      throw error
    }
  },

  async approveTimeEntry(id: string): Promise<TimeEntry> {
    try {
      const response = await api.put<{ data: TimeEntry }>(`/api/time-entries/${id}`, {
        status: 'APPROVED'
      })
      return response.data.data
    } catch (error) {
      console.error('Failed to approve time entry:', error)
      throw error
    }
  },

  async rejectTimeEntry(id: string): Promise<TimeEntry> {
    try {
      const response = await api.put<{ data: TimeEntry }>(`/api/time-entries/${id}`, {
        status: 'DISPUTED'
      })
      return response.data.data
    } catch (error) {
      console.error('Failed to reject time entry:', error)
      throw error
    }
  },
}
