const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export interface SubscriptionStatus {
  organization: {
    id: string
    name: string
    subscriptionTier: string
    subscriptionStatus: string | null
  }
  subscription: {
    id: string
    status: string
    currentPeriodEnd: number
    cancelAtPeriodEnd: boolean
    items: Array<{
      priceId: string
      quantity: number
    }>
  } | null
  employeeCount: number
}

export interface CheckoutSession {
  sessionId: string
  url: string
}

export const billingApi = {
  async getStatus(): Promise<{ data: SubscriptionStatus }> {
    const response = await fetch(`${API_BASE_URL}/api/billing/status`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch subscription status')
    }
    return response.json()
  },

  async createCheckoutSession(employeeCount: number): Promise<{ data: CheckoutSession }> {
    const response = await fetch(`${API_BASE_URL}/api/billing/create-checkout-session`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ employeeCount }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create checkout session')
    }
    return response.json()
  },

  async createPortalSession(): Promise<{ data: { url: string } }> {
    const response = await fetch(`${API_BASE_URL}/api/billing/create-portal-session`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create portal session')
    }
    return response.json()
  },

  async updateQuantity(employeeCount: number): Promise<{ data: { subscription: { id: string; quantity: number } } }> {
    const response = await fetch(`${API_BASE_URL}/api/billing/update-quantity`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ employeeCount }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update quantity')
    }
    return response.json()
  },
}
