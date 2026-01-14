import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { validateBody } from '../middleware/validate'
import { z } from 'zod'
import {
  stripe,
  createCheckoutSession,
  createCustomerPortalSession,
  getSubscription,
  updateSubscriptionQuantity,
} from '../services/stripe'
import { env } from '../config/env'
import type Stripe from 'stripe'

const router = Router()

const createCheckoutSchema = z.object({
  employeeCount: z.coerce.number().int().positive().min(5, 'Minimum 5 employees required'),
})

// POST /api/billing/create-checkout-session - Create Stripe checkout session
router.post(
  '/create-checkout-session',
  requireAuth,
  validateBody(createCheckoutSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { employeeCount } = req.body
      const userId = req.user!.id
      const userOrgId = req.user!.orgId

      if (!env.STRIPE_PRICE_ID) {
        return res.status(500).json({
          error: 'Configuration error',
          message: 'Stripe price ID not configured',
        })
      }

      // Get organization
      const org = await prisma.organization.findUnique({
        where: { id: userOrgId },
      })

      if (!org) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Organization not found',
        })
      }

      const frontendUrl = env.FRONTEND_URL || 'http://localhost:5175'
      const successUrl = `${frontendUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${frontendUrl}/dashboard/billing?canceled=true`

      const session = await createCheckoutSession({
        customerId: org.stripeCustomerId || undefined,
        customerEmail: req.user!.email,
        priceId: env.STRIPE_PRICE_ID,
        successUrl,
        cancelUrl,
        metadata: {
          orgId: userOrgId,
          employeeCount: employeeCount.toString(),
        },
      })

      // Update quantity based on employee count
      if (session.id) {
        // We'll update the session after creation if needed
        // For now, we'll handle quantity in the webhook
      }

      res.json({
        data: {
          sessionId: session.id,
          url: session.url,
        },
      })
    } catch (error: any) {
      console.error('Checkout session creation error:', error)
      res.status(500).json({
        error: 'Failed to create checkout session',
        message: error.message,
      })
    }
  }
)

// POST /api/billing/create-portal-session - Create customer portal session
router.post(
  '/create-portal-session',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userOrgId = req.user!.orgId

      const org = await prisma.organization.findUnique({
        where: { id: userOrgId },
      })

      if (!org || !org.stripeCustomerId) {
        return res.status(404).json({
          error: 'Not found',
          message: 'No active subscription found',
        })
      }

      const frontendUrl = env.FRONTEND_URL || 'http://localhost:5175'
      const portalSession = await createCustomerPortalSession(
        org.stripeCustomerId,
        `${frontendUrl}/dashboard/billing`
      )

      res.json({
        data: {
          url: portalSession.url,
        },
      })
    } catch (error: any) {
      console.error('Portal session creation error:', error)
      res.status(500).json({
        error: 'Failed to create portal session',
        message: error.message,
      })
    }
  }
)

// GET /api/billing/status - Get subscription status
router.get('/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userOrgId = req.user!.orgId

    const org = await prisma.organization.findUnique({
      where: { id: userOrgId },
      include: {
        _count: {
          select: {
            users: {
              where: {
                role: 'WORKER',
              },
            },
          },
        },
      },
    })

    if (!org) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Organization not found',
      })
    }

    let subscription = null
    if (org.stripeSubscriptionId) {
      subscription = await getSubscription(org.stripeSubscriptionId)
    }

    res.json({
      data: {
        organization: {
          id: org.id,
          name: org.name,
          subscriptionTier: org.subscriptionTier,
          subscriptionStatus: org.subscriptionStatus,
        },
        subscription: subscription
          ? {
              id: subscription.id,
              status: subscription.status,
              items: subscription.items.data.map((item) => ({
                priceId: item.price.id,
                quantity: item.quantity,
              })),
            }
          : null,
        employeeCount: org._count.users,
      },
    })
  } catch (error: any) {
    console.error('Subscription status error:', error)
    res.status(500).json({
      error: 'Failed to fetch subscription status',
      message: error.message,
    })
  }
})

// POST /api/billing/update-quantity - Update subscription quantity (employee count)
router.post(
  '/update-quantity',
  requireAuth,
  validateBody(z.object({ employeeCount: z.coerce.number().int().positive().min(5) })),
  async (req: AuthRequest, res: Response) => {
    try {
      const { employeeCount } = req.body
      const userOrgId = req.user!.orgId

      const org = await prisma.organization.findUnique({
        where: { id: userOrgId },
      })

      if (!org || !org.stripeSubscriptionId) {
        return res.status(404).json({
          error: 'Not found',
          message: 'No active subscription found',
        })
      }

      const updatedSubscription = await updateSubscriptionQuantity(
        org.stripeSubscriptionId,
        employeeCount
      )

      res.json({
        data: {
          subscription: {
            id: updatedSubscription.id,
            quantity: updatedSubscription.items.data[0].quantity,
          },
        },
      })
    } catch (error: any) {
      console.error('Update quantity error:', error)
      res.status(500).json({
        error: 'Failed to update subscription quantity',
        message: error.message,
      })
    }
  }
)

// POST /api/billing/webhook - Stripe webhook handler
router.post(
  '/webhook',
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature']

    if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).send('Missing stripe-signature header or webhook secret')
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session
          const orgId = session.metadata?.orgId
          const employeeCount = parseInt(session.metadata?.employeeCount || '5')

          if (orgId && session.customer && typeof session.customer === 'string') {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            )

            // Update quantity based on employee count
            await stripe.subscriptions.update(subscription.id, {
              items: [
                {
                  id: subscription.items.data[0].id,
                  quantity: employeeCount,
                },
              ],
            })

            await prisma.organization.update({
              where: { id: orgId },
              data: {
                stripeCustomerId: session.customer,
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                subscriptionTier: 'professional',
              },
            })
          }
          break
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          const org = await prisma.organization.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          })

          if (org) {
            await prisma.organization.update({
              where: { id: org.id },
              data: {
                subscriptionStatus: subscription.status,
                subscriptionTier:
                  subscription.status === 'active' || subscription.status === 'trialing'
                    ? 'professional'
                    : 'free',
              },
            })
          }
          break
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice
          const invoiceSubscription =
            (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null })
              .subscription
          const subscriptionId =
            typeof invoiceSubscription === 'string'
              ? invoiceSubscription
              : invoiceSubscription?.id

          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const org = await prisma.organization.findFirst({
              where: { stripeSubscriptionId: subscription.id },
            })

            if (org) {
              await prisma.organization.update({
                where: { id: org.id },
                data: {
                  subscriptionStatus: subscription.status,
                },
              })
            }
          }
          break
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice
          const invoiceSubscription =
            (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null })
              .subscription
          const subscriptionId =
            typeof invoiceSubscription === 'string'
              ? invoiceSubscription
              : invoiceSubscription?.id

          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const org = await prisma.organization.findFirst({
              where: { stripeSubscriptionId: subscription.id },
            })

            if (org) {
              await prisma.organization.update({
                where: { id: org.id },
                data: {
                  subscriptionStatus: subscription.status,
                },
              })
            }
          }
          break
        }

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      res.json({ received: true })
    } catch (error: any) {
      console.error('Webhook processing error:', error)
      res.status(500).json({
        error: 'Webhook processing failed',
        message: error.message,
      })
    }
  }
)

export default router
