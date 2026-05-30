const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_BLOCKCHAIN === 'true'

function fakeTxHash(): string {
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

async function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

export async function createInvoiceOnChain(
  invoiceId: string,
  _buyerAddress: string,
  _amount: number,
  _dueDateUnix: number
): Promise<{ hash: string }> {
  if (MOCK_MODE) {
    await delay(1500)
    return { hash: fakeTxHash() }
  }
  // Real implementation would go here
  throw new Error('Real blockchain not configured. Set NEXT_PUBLIC_MOCK_BLOCKCHAIN=true')
}

export async function confirmInvoiceOnChain(
  _invoiceId: string
): Promise<{ hash: string }> {
  if (MOCK_MODE) {
    await delay(2000)
    return { hash: fakeTxHash() }
  }
  throw new Error('Real blockchain not configured.')
}

export async function fundInvoiceOnChain(
  _invoiceId: string
): Promise<{ hash: string }> {
  if (MOCK_MODE) {
    await delay(2000)
    return { hash: fakeTxHash() }
  }
  throw new Error('Real blockchain not configured.')
}
