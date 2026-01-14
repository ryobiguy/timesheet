import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sky-500"></div>
              <span className="text-xl font-bold text-slate-900">Timesheet Control</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition">Pricing</a>
              <a href="#contact" className="text-slate-600 hover:text-slate-900 transition">Contact</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-slate-600 hover:text-slate-900 transition">Sign In</Link>
              <Link to="/signup" className="rounded-full bg-sky-500 px-6 py-2 font-semibold text-white hover:bg-sky-600 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 to-white px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Geofence Workforce
              <span className="block text-sky-500">Timesheet Management</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Automate time tracking with GPS geofencing. Know exactly when your workers arrive and leave job sites. 
              Reduce payroll errors and save hours every week.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/signup"
                className="rounded-full bg-sky-500 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-sky-600 transition"
              >
                Start Free Trial
              </Link>
              <a
                href="#features"
                className="text-base font-semibold leading-6 text-slate-900 hover:text-sky-500 transition"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="grid grid-cols-3 gap-8 rounded-3xl border border-sky-200 bg-sky-50 p-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-500">£1</div>
              <div className="mt-2 text-sm text-slate-600">Per Employee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-500">50%</div>
              <div className="mt-2 text-sm text-slate-600">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-500">24/7</div>
              <div className="mt-2 text-slate-600">Support</div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to manage your workforce
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Powerful features designed for construction and field service companies
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="rounded-3xl border border-slate-200 bg-white p-8 hover:border-sky-300 hover:shadow-lg transition"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.name}</h3>
                <p className="mt-2 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-24 sm:py-32 bg-sky-50">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Just £1 per employee per month. No hidden fees.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl">
            <div className="rounded-3xl border-2 border-sky-500 bg-white p-12 shadow-xl text-center">
              <div className="mb-8">
                <div className="flex items-baseline justify-center">
                  <span className="text-6xl font-bold text-slate-900">£1</span>
                  <span className="ml-3 text-xl text-slate-600">per employee/month</span>
                </div>
                <p className="mt-4 text-slate-600">Minimum 5 employees</p>
              </div>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {allFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <span className="text-sky-500 text-xl">✓</span>
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link
                to="/signup"
                className="mt-12 inline-block rounded-full bg-sky-500 px-8 py-4 text-lg font-semibold text-white hover:bg-sky-600 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Join hundreds of companies already using Timesheet Control
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/signup"
              className="rounded-full bg-sky-500 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-sky-600 transition"
            >
              Start Free Trial
            </Link>
            <a
              href="#contact"
              className="text-base font-semibold leading-6 text-slate-900 hover:text-sky-500 transition"
            >
              Contact Sales <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-sky-500"></div>
                <span className="text-xl font-bold text-slate-900">Timesheet Control</span>
              </div>
              <p className="text-sm text-slate-600">
                Automated workforce timesheet management with geofencing technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#features" className="hover:text-sky-500 transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-sky-500 transition">Pricing</a></li>
                <li><Link to="/login" className="hover:text-sky-500 transition">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#contact" className="hover:text-sky-500 transition">Contact</a></li>
                <li><a href="#" className="hover:text-sky-500 transition">About</a></li>
                <li><a href="#" className="hover:text-sky-500 transition">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-sky-500 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-sky-500 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-sky-500 transition">API</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-600">
            <p>&copy; {new Date().getFullYear()} Timesheet Control. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    name: 'GPS Geofencing',
    description: 'Automatic clock in/out when workers enter or leave job sites. No manual time cards needed.',
    icon: '📍',
  },
  {
    name: 'Real-Time Tracking',
    description: 'See who\'s on site right now with live roster updates. Monitor active workers across all locations.',
    icon: '👥',
  },
  {
    name: 'Approval Workflow',
    description: 'Streamlined approval process with dispute resolution. Supervisors can review and approve time entries.',
    icon: '✅',
  },
  {
    name: 'Weekly Summaries',
    description: 'Automatic calculation of regular and overtime hours. Weekly timesheet summaries ready for payroll.',
    icon: '📊',
  },
  {
    name: 'Export & Reports',
    description: 'Export time entries to CSV or PDF. Generate reports for accounting and payroll integration.',
    icon: '📤',
  },
  {
    name: 'Mobile Friendly',
    description: 'Workers can clock in/out from their phones. Responsive design works on any device.',
    icon: '📱',
  },
]

const allFeatures = [
  'Unlimited job sites',
  'GPS geofencing',
  'Time entry management',
  'Advanced approval workflow',
  'Weekly summaries',
  'CSV & PDF exports',
  'Mobile app access',
  'Email support',
  'API access',
]
