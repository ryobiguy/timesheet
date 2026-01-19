import { DashboardLayout } from '../components/DashboardLayout'

export default function PrivacyPolicy() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            Clockly ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our time tracking service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-medium mb-2">2.1 Account Information</h3>
          <p className="text-gray-700 mb-4">
            When you create an account, we collect:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Name and email address</li>
            <li>Company information</li>
            <li>Role (Admin, Supervisor, or Worker)</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.2 Location Data</h3>
          <p className="text-gray-700 mb-4">
            Our mobile app collects GPS location data to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Track when workers enter and exit jobsites (geofencing)</li>
            <li>Verify time entries</li>
            <li>Prevent time theft</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Location data is only collected when the app is active and you have granted location permissions. You can revoke location permissions at any time through your device settings.
          </p>

          <h3 className="text-xl font-medium mb-2">2.3 Time Entry Data</h3>
          <p className="text-gray-700 mb-4">
            We collect and store:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Clock-in and clock-out times</li>
            <li>Jobsite assignments</li>
            <li>Time entry approvals and disputes</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">2.4 Payment Information</h3>
          <p className="text-gray-700 mb-4">
            Payment processing is handled by Stripe. We do not store your credit card information. Stripe's privacy policy applies to payment data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">We use the information we collect to:</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Provide and maintain our service</li>
            <li>Process time entries and approvals</li>
            <li>Generate payroll reports</li>
            <li>Process payments and manage subscriptions</li>
            <li>Send you service-related communications</li>
            <li>Improve our service and develop new features</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
          <p className="text-gray-700 mb-4">We do not sell your personal information. We may share your information only in the following circumstances:</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li><strong>Within your organization:</strong> Admins and supervisors can view time entries for workers in their organization</li>
            <li><strong>Service providers:</strong> We use third-party services (e.g., Stripe for payments, hosting providers) that may access your data to provide services</li>
            <li><strong>Legal requirements:</strong> We may disclose information if required by law or to protect our rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement industry-standard security measures to protect your data, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Encrypted data transmission (HTTPS)</li>
            <li>Encrypted password storage</li>
            <li>Secure database hosting</li>
            <li>Regular security audits</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt-out of non-essential communications</li>
          </ul>
          <p className="text-gray-700 mb-4">
            To exercise these rights, contact us at [your-email@clockly.com]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain your data for as long as your account is active or as needed to provide services. If you cancel your account, we will delete your data within 30 days, unless we are required to retain it for legal or accounting purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
          <p className="text-gray-700 mb-4">
            Our service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-gray-700">
            Email: [your-email@clockly.com]<br />
            Address: [Your Company Address]
          </p>
        </section>
      </div>
    </DashboardLayout>
  )
}
