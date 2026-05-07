// ── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin" | "agent";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface Address {
  rue: string;
  city: string;
  gouvernorat: string;
  zip_code: string;
}

export type OnboardingStatus = "not_started" | "pending_call" | "pending_approval" | "approved" | "rejected";

export interface UserProfile {
  id: string;
  name: string;
  family_name: string;
  email: string;
  phone_number: string | null;
  phone_code: string | null;
  address: Address | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  is_subscribed: boolean;
  is_verified_bymanager: boolean;
  onboarding_status: OnboardingStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

// ── CRM ───────────────────────────────────────────────────────────────────────

export interface BusinessAddress {
  rue: string | null;
  city: string | null;
  gouvernorat: string | null;
  zip_code: string | null;
  same_as_personal: string | null;
}

export interface OnboardingForm {
  id: string;
  // KYB Identity (signer)
  signer_role: string | null;
  cin_or_passport: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  id_document_url: string | null;
  business_proof_url: string | null;
  // KYB Business
  legal_entity_name: string | null;
  business_type: string | null;
  tax_id: string | null;
  rne_number: string | null;
  years_in_business: number | null;
  business_address: BusinessAddress;
  // Operations
  store_count: number | null;
  other_platforms: string[];
  monthly_uber_revenue: string | null;
  monthly_loss_estimate: string | null;
  refund_handling_today: string | null;
  // Banking
  bank_name: string | null;
  rib_iban: string | null;
  bank_account_holder: string | null;
  bank_statement_url: string | null;
  // Preferences
  preferred_call_time: string | null;
  preferred_contact_method: string | null;
  referral_source: string | null;
  notes: string | null;
  // Legacy
  uber_experience: string | null;
  work_frequency: string | null;
  submitted_at: string;
}

export type CallOutcome = "pending" | "approved" | "rejected" | "callback" | "no_answer";
export type CallDirection = "inbound" | "outbound";

export interface CallAgent {
  id: string;
  name: string;
  family_name: string;
}

export interface CallLog {
  id: string;
  direction: CallDirection;
  status: string;
  duration_seconds: number | null;
  phone_number: string | null;
  outcome: CallOutcome;
  agent_notes: string | null;
  recording_url: string | null;
  transcription_text: string | null;
  twilio_call_sid: string | null;
  started_at: string;
  ended_at: string | null;
  agent: CallAgent | null;
}

export interface CrmProspect {
  id: string;
  name: string;
  family_name: string;
  email: string;
  phone_number: string | null;
  phone_code: string | null;
  avatar_url?: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  is_verified_bymanager: boolean;
  onboarding_status: OnboardingStatus;
  rejection_reason: string | null;
  created_at: string;
  form: OnboardingForm | null;
  call_count: number;
  calls?: CallLog[];
}

export interface CalendarEvent {
  user_id: string;
  name: string;
  email: string;
  phone_number: string | null;
  phone_code: string | null;
  avatar_url?: string | null;
  preferred_call_time: string;
  onboarding_status: OnboardingStatus;
  store_count: number | null;
  notes: string | null;
}

// ── Subscription ──────────────────────────────────────────────────────────────

export type SubscriptionStatus = "active" | "inactive" | "past_due" | "cancelled" | "trialing" | "cancelling";

export interface SubscriptionPlan {
  name: string;
  price: number | null;
  currency: string;
  started_at: string | null;
  expires_at: string | null;
}

export interface BillingStatus {
  is_subscribed: boolean;
  status: SubscriptionStatus;
  cancel_at_period_end: boolean;
  can_resubscribe: boolean;
  plan: SubscriptionPlan | null;
  stripe_subscription_id: string | null;
}

export interface BillingPlan {
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
}

// ── Admin user list ───────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  family_name: string;
  email: string;
  avatar_url?: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AdminUserListResponse {
  total: number;
  skip: number;
  limit: number;
  users: AdminUser[];
}

// ── Stores ────────────────────────────────────────────────────────────────────

export interface UserStore {
  id: number;
  store_id: string;
  store_name: string;
  status?: string;
}

export interface StoreAddResult {
  store_id: string;
  action: "added" | "already_exists";
  status: string;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export type RemboursementStatus = "en attente" | "remboursé" | "email envoyé";

export interface CancelledOrder {
  store_name: string;
  country_code: string;
  order_id: string;
  order_uuid: string;
  order_status: string;
  menu_item_count: string;
  date_ordered: string;
  workflow_uuid: string;
  store_id: string;
  remboursement_status: RemboursementStatus;
  report_job_id: string;
  fetched_at: string;
  manual_amount: number | null;
  refund_email_sent_at: string | null;
}

export interface ContestedOrder {
  id: number;
  order_id: string;
  order_uuid: string;
  store_id: string;
  store_name: string;
  city: string;
  order_issue: string;
  inaccurate_items: string;
  ticket_size: string;
  customer_refunded: string;
  refund_covered_by_merchant: string;
  refund_not_covered_by_merchant: string;
  currency_code: string;
  time_customer_ordered: string;
  time_merchant_accepted: string;
  time_customer_refunded: string;
  fulfillment_type: string;
  order_channel: string;
  remboursement_status: RemboursementStatus;
  report_job_id: string;
  fetched_at: string;
}

export interface OrderListResponse<T> {
  total: number;
  skip: number;
  limit: number;
  cancelled_orders?: T[];
  contested_orders?: T[];
}

// ── Refunds ───────────────────────────────────────────────────────────────────

export interface StoreRefund {
  id: number;
  store_name: string;
  store_id: string;
  refund_date: string;
  amount: string;
  payout_reference_id: string;
  linked_order_id: string | null;
  report_job_id: string;
  fetched_at: string;
}

export interface RefundListResponse {
  total: number;
  skip: number;
  limit: number;
  refunds: StoreRefund[];
}

// ── Wallet ────────────────────────────────────────────────────────────────────

export interface WalletByStore {
  store_id: string;
  store_name: string;
  total: number;
  count: number;
}

export interface WalletByMonth {
  month: string;
  total: number;
  count: number;
}

export interface WalletData {
  total_income: number;
  refund_count: number;
  by_store: WalletByStore[];
  by_month: WalletByMonth[];
}

// ── Admin Revenue ─────────────────────────────────────────────────────────────

export interface AdminRevenueStore {
  store_id: string;
  store_name: string;
  status: string;
  contested_amount: number;
  contested_revenue: number;
  contested_refunds: number;
  contested_orders_total: number;
  contested_orders_rembourse: number;
  cancelled_amount: number;
  cancelled_revenue: number;
  cancelled_refunds: number;
  cancelled_orders_total: number;
  cancelled_orders_rembourse: number;
  total_revenue: number;
}

export interface AdminRevenueUser {
  user_id: string;
  name: string;
  family_name: string;
  email: string;
  is_active: boolean;
  avatar_url: string | null;
  contested_revenue: number;
  cancelled_revenue: number;
  total_revenue: number;
  stores: AdminRevenueStore[];
}

export interface AdminRevenueResponse {
  total_revenue: number;
  contested_revenue: number;
  cancelled_revenue: number;
  commission_rates: { contested: number; cancelled: number };
  users: AdminRevenueUser[];
}

// ── Feedback ──────────────────────────────────────────────────────────────────

export interface PublicFeedback {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    name: string;
    family_name: string;
    avatar_url: string | null;
    city: string | null;
  };
}

export interface PublicFeedbackResponse {
  total: number;
  average: number;
  feedbacks: PublicFeedback[];
}

export interface SelfFeedback {
  id: string;
  rating: number;
  comment: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export interface ReportJob {
  job_id: string;
  store_id: string;
  job_type: "cancelled" | "contested" | "payment";
  status: "pending" | "completed" | "failed";
  created_at: string;
}
