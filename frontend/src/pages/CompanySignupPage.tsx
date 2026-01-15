import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export function CompanySignupPage() {
  const [formData, setFormData] = useState({
    organizationName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    subscriptionTier: 'free' as 'free' | 'starter' | 'professional' | 'enterprise'
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [companyCode, setCompanyCode] = useState<string | null>(null)
  const { companySignup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.adminPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.adminPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'
      const response = await fetch(`${API_BASE_URL}/api/organizations/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: formData.organizationName,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
          subscriptionTier: formData.subscriptionTier,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Signup failed')
      }
      
      const result = await response.json()
      const { user, token, organization } = result.data
      
      // Store company code to show it
      setCompanyCode(organization.companyCode)
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      toast.success('Account created successfully!')
      
      // Don't navigate yet - show the company code first
    } catch (err: any) {
      setError(err.message || 'Signup failed')
      toast.error(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-white px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-sky-500"></div>
            <span className="text-xl font-bold text-slate-900">Clockly</span>
          </Link>
          <h2 className="text-3xl font-semibold text-slate-900">Create Your Company Account</h2>
          <p className="mt-2 text-slate-600">Get started with a free trial. No credit card required.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          {error && (
            <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Acme Construction Co"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Plan</label>
              <select
                value={formData.subscriptionTier}
                onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value as any })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="free">Free Trial (14 days)</option>
                <option value="professional">Standard Plan - £1 per employee/month</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Start with a free trial. Pricing: £1 per employee per month (minimum 5 employees).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-sky-500 px-6 py-4 text-base font-semibold text-white hover:bg-sky-600 disabled:opacity-50 transition"
            >
              {isLoading ? 'Creating account...' : 'Create Company Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-500 hover:text-sky-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {companyCode && (
        <div className="mt-8 rounded-3xl border-2 border-sky-500 bg-sky-50 p-8 text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Your Company Code</h3>
          <div className="mb-4">
            <div className="inline-block rounded-xl bg-white px-8 py-4 border-2 border-sky-500">
              <p className="text-4xl font-mono font-bold text-sky-600 tracking-widest">
                {companyCode}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-6">
            Share this code with your workers so they can register for your company.
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(companyCode)
              toast.success('Company code copied to clipboard!')
            }}
            className="mr-4 rounded-xl bg-sky-500 px-6 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition"
          >
            Copy Code
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-xl bg-white border-2 border-sky-500 px-6 py-2 text-sm font-semibold text-sky-600 hover:bg-sky-50 transition"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  )
}
