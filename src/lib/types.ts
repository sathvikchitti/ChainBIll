// ─── Invoice ─────────────────────────────────────────────────────────────────

export type InvoiceStatus =
  | 'pending'
  | 'confirmed'
  | 'listed'
  | 'funded'
  | 'settled'
  | 'disputed'

export interface Invoice {
  id:                 string
  immutable_id:       string | null   // CB-XXXXXXXX
  supplier_id:        string          // Clerk user ID
  buyer_id:           string          // Clerk user ID
  supplier_name:      string | null
  buyer_name:         string | null
  amount:             number
  description:        string
  due_date:           string          // ISO date string
  status:             InvoiceStatus
  discount_rate:      number | null
  funding_progress:   number          // 0–100
  settlement_status:  'ACTIVE' | 'SETTLED'
  gst_no:             string | null
  payment_terms:      string | null
  pdf_url:            string | null
  blockchain_tx_hash: string | null
  token_id:           string | null
  is_draft:           boolean
  created_at:         string
  verified_at:        string | null
  settled_at:         string | null
}

// ─── Funding Transaction ──────────────────────────────────────────────────────

export interface FundingTransaction {
  id:                 string
  invoice_id:         string
  investor_id:        string          // Clerk user ID
  amount_funded:      number
  funded_at:          string
  settlement_tx_hash: string | null
}

// ─── Credit Ledger ────────────────────────────────────────────────────────────

export type CreditLedgerEventType =
  | 'invoice_raised'
  | 'buyer_confirmed'
  | 'funded'
  | 'settled'

export interface CreditLedgerEntry {
  id:                 string
  supplier_id:        string
  invoice_id:         string
  event_type:         CreditLedgerEventType
  recorded_at:        string
  blockchain_tx_hash: string | null
}

// ─── Audit Trail ─────────────────────────────────────────────────────────────

export type AuditAction =
  | 'CREATED'
  | 'VERIFIED'
  | 'LISTED'
  | 'FUNDED'
  | 'SETTLED'
  | 'DISPUTED'
  | 'DRAFT_SAVED'

export interface AuditTrailEntry {
  id:         string
  invoice_id: string
  action:     AuditAction
  actor_id:   string | null
  tx_hash:    string
  metadata:   Record<string, unknown> | null
  created_at: string
}

// ─── AI Analysis ─────────────────────────────────────────────────────────────

export type AIAnalysisType = 'OCR' | 'RISK' | 'CASHFLOW' | 'DISPUTE' | 'PORTFOLIO'

export interface AIAnalysis {
  id:               string
  type:             AIAnalysisType
  result:           Record<string, unknown>
  confidence_score: number | null
  explanation:      string | null
  invoice_id:       string | null
  user_id:          string | null
  created_at:       string
}

// ─── Settlement Record ────────────────────────────────────────────────────────

export interface SettlementRecord {
  id:               string
  invoice_id:       string
  investor_id:      string
  principal_amount: number
  return_amount:    number
  roi:              number
  settled_at:       string
}

// ─── Clerk Session Claims Augmentation ───────────────────────────────────────

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: 'SUPPLIER' | 'BUYER' | 'INVESTOR' | 'ADMIN'
      onboarded?: boolean
    }
  }
}
