import { api } from '../config/api'

export interface Jobsite {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  radiusMeters: number
  orgId: string
}

export interface Assignment {
  id: string
  workerId: string
  jobsiteId: string
  scheduleDays: string[]
  jobsite: Jobsite
}

export const jobsiteService = {
  async getAssignments(workerId: string): Promise<Assignment[]> {
    try {
      const response = await api.get<{ data: Assignment[] }>(
        `/api/assignments?workerId=${workerId}`
      )
      return response.data?.data || []
    } catch (error) {
      console.error('Failed to get assignments:', error)
      throw error
    }
  },

  async getJobsite(jobsiteId: string): Promise<Jobsite> {
    try {
      const response = await api.get<{ data: Jobsite }>(`/api/jobsites/${jobsiteId}`)
      return response.data?.data
    } catch (error) {
      console.error('Failed to get jobsite:', error)
      throw error
    }
  },
}
