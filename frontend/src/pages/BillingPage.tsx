import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { billingApi, type SubscriptionStatus } from '../lib/billingApi'
import { useAuth } from '../contexts/AuthContext'

export function BillingPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [employeeCount, setEmployeeCount] = useState(5)

  const { data, isLoading, error } = useQuery({
    queryKey: ['billing', 'status'],
    queryFn: () => billingApi.getStatus(),
  })

  const checkoutMutation = useMutation({
    mutationFn: (count: number) => billingApi.createCheckoutSession(count),
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data.data.url) {
        window.location.href = data.data.url
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start checkout')
    },
  })

  const portalMutation = useMutation({
    mutationFn: () => billingApi.createPortalSession(),
    onSuccess: (data) => {
      if (data.data.url) {
        window.location.href = data.data.url
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to open customer portal')
    },
  })

  const updateQuantityMutation = useMutation({
    mutationFn: (count: number) => billingApi.updateQuantity(count),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] })
      toast.success('Subscription updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subscription')
    },
  })

  useEffect(() => {
    // Check for successful checkout redirect
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session_id')
    const canceled = urlParams.get('canceled')

    if (sessionId) {
      toast.success('Payment successful! Your subscription is now active.')
      queryClient.invalidateQueries({ queryKey: ['billing'] })
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard/billing')
    } else if (canceled) {
      toast.error('Payment was canceled')
      window.history.replaceState({}, '', '/dashboard/billing')
    }
  }, [queryClient])

  useEffect(() => {
    if (data?.data) {
      setEmployeeCount(data.data.employeeCount || 5)
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading billing information...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-6">
        <p className="text-red-600">Error loading billing: {(error as Error).message}</p>
      </div>
    )
  }

  const status: SubscriptionStatus = data?.data || {
    organization: {
      id: '',
      name: '',
      subscriptionTier: 'free',
      subscriptionStatus: null,
    },
    subscription: null,
    employeeCount: 5,
  }

  const hasActiveSubscription =
    status.subscription?.status === 'active' || status.subscription?.status === 'trialing'
  const isPastDue = status.subscription?.status === 'past_due'
  const isCanceled = status.subscription?.cancelAtPeriodEnd

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Billing & Subscription</h2>
        <p className="mt-2 text-sm text-slate-600">Manage your subscription and payment methods</p>
      </div>

      {/* Subscription Status Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Current Plan</h3>
            <p className="mt-1 text-sm text-slate-600">
              {status.organization.subscriptionTier === 'professional' ? 'Standard Plan' : 'Free Trial'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasActiveSubscription ? (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
                Active
              </span>
            ) : isPastDue ? (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Past Due
              </span>
            ) : (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                Inactive
              </span>
            )}
          </div>
        </div>

        {status.subscription ? (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Status</p>
                <p className="text-sm font-medium text-slate-900 capitalize">{status.subscription.status}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Current Period</p>
                <p className="text-sm font-medium text-slate-900">
                  Ends {formatDate(status.subscription.currentPeriodEnd)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Employees</p>
                <p className="text-sm font-medium text-slate-900">
                  {status.subscription.items[0]?.quantity || status.employeeCount} employees
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Monthly Cost</p>
                <p className="text-sm font-medium text-slate-900">
                  £{((status.subscription.items[0]?.quantity || status.employeeCount) * 1).toFixed(2)}/month
                </p>
              </div>
            </div>

            {isCanceled && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm text-amber-700">
                  Your subscription will cancel at the end of the current billing period.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {portalMutation.isPending ? 'Opening...' : 'Manage Subscription'}
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-4">You don't have an active subscription.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => checkoutMutation.mutate(employeeCount)}
                disabled={checkoutMutation.isPending}
                className="flex-1 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 transition"
              >
                {checkoutMutation.isPending ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Count Management */}
      {hasActiveSubscription && status.subscription && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Update Employee Count</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Number of Employees (Minimum 5)
              </label>
              <input
                type="number"
                min="5"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(Math.max(5, parseInt(e.target.value) || 5))}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
              />
              <p className="mt-2 text-sm text-slate-600">
                Current: {status.subscription.items[0]?.quantity || status.employeeCount} employees • £
                {((status.subscription.items[0]?.quantity || status.employeeCount) * 1).toFixed(2)}/month
              </p>
              <p className="mt-1 text-sm text-slate-600">
                New: {employeeCount} employees • £{(employeeCount * 1).toFixed(2)}/month
              </p>
            </div>
            <button
              onClick={() => updateQuantityMutation.mutate(employeeCount)}
              disabled={
                updateQuantityMutation.isPending ||
                employeeCount === (status.subscription?.items[0]?.quantity || status.employeeCount)
              }
              className="w-full sm:w-auto rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {updateQuantityMutation.isPending ? 'Updating...' : 'Update Subscription'}
            </button>
          </div>
        </div>
      )}

      {/* Pricing Info */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Pricing</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Per Employee</span>
            <span className="text-sm font-semibold text-slate-900">£1.00/month</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Minimum</span>
            <span className="text-sm font-semibold text-slate-900">5 employees</span>
          </div>
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-slate-900">Total Monthly Cost</span>
              <span className="text-lg font-bold text-sky-600">
                £{Math.max(5, employeeCount) * 1}.00/month
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
