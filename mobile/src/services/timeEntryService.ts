import { api } from '../config/api'

export interface TimeEntry {
  id: string
  workerId: string
  jobsiteId: string
  startAt: string
  endAt: string | null
  durationMinutes: number | null
  status: 'PENDING' | 'APPROVED' | 'DISPUTED'
  jobsite?: {
    id: string
    name: string
    address: string
  }
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
}
