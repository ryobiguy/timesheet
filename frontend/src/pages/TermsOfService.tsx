import { DashboardLayout } from '../components/DashboardLayout'

export default function TermsOfService() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing or using Clockly ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="text-gray-700 mb-4">
            Clockly is a time tracking service that uses GPS geofencing to automatically track when workers enter and exit jobsites. The Service includes:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Mobile app for workers to clock in/out</li>
            <li>Web dashboard for supervisors to manage timesheets</li>
            <li>Time entry approval and dispute management</li>
            <li>Payroll reporting and exports</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
          <p className="text-gray-700 mb-4">
            To use the Service, you must:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Create an account with accurate information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Be at least 18 years old</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Subscription and Billing</h2>
          <h3 className="text-xl font-medium mb-2">4.1 Pricing</h3>
          <p className="text-gray-700 mb-4">
            The Service is provided on a subscription basis at £1 per employee per month. Pricing may change with 30 days' notice.
          </p>

          <h3 className="text-xl font-medium mb-2">4.2 Payment</h3>
          <p className="text-gray-700 mb-4">
            Payments are processed through Stripe. You agree to provide valid payment information and authorize us to charge your payment method for subscription fees.
          </p>

          <h3 className="text-xl font-medium mb-2">4.3 Billing Cycle</h3>
          <p className="text-gray-700 mb-4">
            Subscriptions are billed monthly in advance. Fees are non-refundable except as required by law.
          </p>

          <h3 className="text-xl font-medium mb-2">4.4 Cancellation</h3>
          <p className="text-gray-700 mb-4">
            You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial billing periods.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
          <p className="text-gray-700 mb-4">You agree not to:</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Use the Service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Use automated systems to access the Service without permission</li>
            <li>Share your account credentials with others</li>
            <li>Manipulate or falsify time entry data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Location Data</h2>
          <p className="text-gray-700 mb-4">
            The Service requires location permissions to function. By using the Service, you consent to the collection and use of location data as described in our Privacy Policy. You understand that:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Location data is used solely for time tracking purposes</li>
            <li>Location accuracy depends on your device and GPS signal</li>
            <li>You can revoke location permissions at any time</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            The Service and its original content, features, and functionality are owned by Clockly and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. User Content</h2>
          <p className="text-gray-700 mb-4">
            You retain ownership of any data you submit through the Service. By using the Service, you grant us a license to use, store, and process your data to provide the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Service Availability</h2>
          <p className="text-gray-700 mb-4">
            We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. The Service may be unavailable due to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Scheduled maintenance</li>
            <li>Technical issues</li>
            <li>Force majeure events</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            To the maximum extent permitted by law, Clockly shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business interruption, arising from your use of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
          <p className="text-gray-700 mb-4">
            You agree to indemnify and hold harmless Clockly from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
          <p className="text-gray-700 mb-4">
            We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to modify these Terms at any time. We will notify you of material changes via email or through the Service. Your continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. Governing Law</h2>
          <p className="text-gray-700 mb-4">
            These Terms shall be governed by and construed in accordance with the laws of [Your Country/Jurisdiction], without regard to its conflict of law provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about these Terms, please contact us at:
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
