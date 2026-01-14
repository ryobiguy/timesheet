const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export interface ExportParams {
  workerId?: string
  jobsiteId?: string
  startDate?: Date | string
  endDate?: Date | string
  status?: 'PENDING' | 'APPROVED' | 'DISPUTED'
  format?: 'csv' | 'pdf'
}

export async function exportTimeEntries(params: ExportParams): Promise<void> {
  const token = localStorage.getItem('token')
  const queryParams = new URLSearchParams()
  
  if (params.workerId) queryParams.append('workerId', params.workerId)
  if (params.jobsiteId) queryParams.append('jobsiteId', params.jobsiteId)
  if (params.startDate) {
    const date = params.startDate instanceof Date ? params.startDate.toISOString() : params.startDate
    queryParams.append('startDate', date)
  }
  if (params.endDate) {
    const date = params.endDate instanceof Date ? params.endDate.toISOString() : params.endDate
    queryParams.append('endDate', date)
  }
  if (params.status) queryParams.append('status', params.status)
  queryParams.append('format', params.format || 'csv')

  const url = `${API_BASE_URL}/api/exports/time-entries?${queryParams.toString()}`
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Export failed')
  }

  // Download the file
  const blob = await response.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = `time-entries-${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)
}
