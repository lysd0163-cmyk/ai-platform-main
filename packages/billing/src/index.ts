export type BillingInterval = "monthly" | "yearly";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled";

export interface Plan { id: string; name: string; interval: BillingInterval; priceCents: number; includedCredits: number; features: string[]; }
export interface Subscription { id: string; organizationId: string; planId: string; status: SubscriptionStatus; currentPeriodEnd: string; }
export interface UsageRecord { organizationId: string; metric: "ai_tokens" | "build_minutes" | "storage_gb" | "deployment"; quantity: number; timestamp: string; }
export interface Invoice { id: string; organizationId: string; amountCents: number; status: "draft" | "open" | "paid" | "void"; createdAt: string; }

export interface PaymentProvider {
  createCheckout(input: { organizationId: string; plan: Plan }): Promise<{ checkoutId: string; url: string }>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}

export class BillingService {
  private readonly plans = new Map<string, Plan>();
  private readonly subscriptions = new Map<string, Subscription>();
  private readonly usage: UsageRecord[] = [];
  private readonly invoices = new Map<string, Invoice>();

  registerPlan(plan: Plan): void { this.plans.set(plan.id, plan); }
  getPlan(id: string): Plan | undefined { return this.plans.get(id); }

  subscribe(input: { id: string; organizationId: string; planId: string; status?: SubscriptionStatus }): Subscription {
    const plan = this.plans.get(input.planId);
    if (!plan) throw new Error(`Plan not found: ${input.planId}`);
    const subscription: Subscription = {
      id: input.id,
      organizationId: input.organizationId,
      planId: plan.id,
      status: input.status ?? "active",
      currentPeriodEnd: new Date(Date.now() + (plan.interval === "yearly" ? 365 : 30) * 86400000).toISOString()
    };
    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  recordUsage(record: UsageRecord): void {
    if (record.quantity < 0) throw new Error("Usage quantity cannot be negative");
    this.usage.push(record);
  }

  usageFor(organizationId: string, metric: UsageRecord["metric"]): number {
    return this.usage.filter((u) => u.organizationId === organizationId && u.metric === metric).reduce((sum, u) => sum + u.quantity, 0);
  }

  createInvoice(invoice: Invoice): Invoice { this.invoices.set(invoice.id, invoice); return invoice; }
  getSubscription(id: string): Subscription | undefined { return this.subscriptions.get(id); }
}
