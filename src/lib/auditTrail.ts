import { createHash } from 'crypto'

import { supabase } from './supabase'
import type { AuditAction } from './types'

interface AuditEntryArgs {
  invoiceId: string
  action: AuditAction
  actorId?: string
  txHash?: string // pass real blockchain tx hash when available
  metadata?: Record<string, unknown>
}

export async function writeAuditEntry({
  invoiceId,
  action,
  actorId,
  txHash,
  metadata,
}: AuditEntryArgs): Promise<string> {
  const hash =
    txHash ??
    '0x' +
      createHash('sha256')
        .update(`${invoiceId}:${action}:${actorId ?? ''}:${Date.now()}`)
        .digest('hex')

  const { error } = await supabase.from('audit_trail').insert({
    invoice_id: invoiceId,
    action,
    actor_id: actorId ?? null,
    tx_hash: hash,
    metadata: metadata ?? null,
  })

  if (error) {
    console.error('[auditTrail] Failed to write entry:', error.message)
  }

  return hash
}
