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
    const response = await api.get<{ data: Assignment[] }>(
      `/api/assignments?workerId=${workerId}`
    )
    return response.data.data
  },

  async getJobsite(jobsiteId: string): Promise<Jobsite> {
    const response = await api.get<{ data: Jobsite }>(`/api/jobsites/${jobsiteId}`)
    return response.data.data
  },
}
