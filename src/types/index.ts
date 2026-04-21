// ── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin" | "manager";

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
  created_at: string;
  updated_at: string;
}

// ── Admin user list ───────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  family_name: string;
  email: string;
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

// ── Jobs ──────────────────────────────────────────────────────────────────────

export interface ReportJob {
  job_id: string;
  store_id: string;
  job_type: "cancelled" | "contested" | "payment";
  status: "pending" | "completed" | "failed";
  created_at: string;
}
