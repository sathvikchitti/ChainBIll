'use client'
import Link from 'next/link'
import { useClerk, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useRef, useCallback, useEffect, DragEvent } from 'react'

interface ExtractedData {
  invoiceNo?: string
  gstNo?: string
  supplierName?: string
  buyerName?: string
  amount?: number
  dueDate?: string
  description?: string
  paymentTerms?: string
  confidence?: number
  confidenceScore?: number
}

interface BuyerOption {
  id: string
  name: string
  email: string
  buyer_profiles: { company_name: string; credit_score: number } | null
}

export default function SupplierRaiseInvoicePage() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const router = useRouter()

  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Buyer lookup
  const [buyers, setBuyers] = useState<BuyerOption[]>([])
  const [selectedBuyerId, setSelectedBuyerId] = useState('')

  // Form state — populated either by AI or manually
  const [invoiceNo, setInvoiceNo] = useState('')
  const [gstNo, setGstNo] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [isDraft, setIsDraft] = useState(false)

  // Load buyers on mount
  useEffect(() => {
    fetch('/api/users?role=BUYER')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBuyers(data) })
      .catch(() => { })
  }, [])

  // Auto-populate supplier name from Clerk
  useEffect(() => {
    if (user && !supplierName) {
      const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      if (name) setSupplierName(name)
    }
  }, [user, supplierName])

  const handleSubmitInvoice = useCallback(async (draft: boolean) => {
    if (!invoiceNo || !amount || !dueDate || !description) {
      setSubmitError('Please fill in all required fields: Invoice No, Amount, Due Date, Description.')
      return
    }
    if (!selectedBuyerId && !buyerName) {
      setSubmitError('Please select a buyer or enter a buyer name.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      // Upload PDF first if present
      let pdfUrl: string | null = null
      if (uploadedFile) {
        const fd = new FormData()
        fd.append('file', uploadedFile)
        const uploadRes = await fetch('/api/invoices/upload-pdf', { method: 'POST', body: fd })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          pdfUrl = uploadData.url
        }
      }

      const selectedBuyer = buyers.find(b => b.id === selectedBuyerId)

      const payload = {
        invoiceNo,
        gstNo: gstNo || null,
        supplierName: supplierName || null,
        buyerName: selectedBuyer?.buyer_profiles?.company_name ?? buyerName ?? null,
        buyerId: selectedBuyerId || null,
        amount,
        dueDate,
        description,
        paymentTerms: paymentTerms || null,
        pdfUrl,
        isDraft: draft,
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit invoice')

      router.push('/supplier/my-invoices')
    } catch (err: any) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }, [invoiceNo, amount, dueDate, description, selectedBuyerId, buyerName, supplierName, gstNo, paymentTerms, uploadedFile, buyers, router])

  const processFile = useCallback(async (file: File) => {
    if (!file.type.includes('pdf')) {
      setExtractError('Please upload a valid PDF file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setExtractError('File size must be under 10 MB.')
      return
    }
    setUploadedFile(file)
    setExtractError(null)
    setExtracted(null)
    setExtracting(true)

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/extract-invoice', { method: 'POST', body: fd })
      const data: ExtractedData = await res.json()
      if (!res.ok || (data as any).error) {
        throw new Error((data as any).error || 'Extraction failed')
      }
      setExtracted(data)
      // Auto-populate form fields
      if (data.invoiceNo) setInvoiceNo(data.invoiceNo)
      if (data.gstNo) setGstNo(data.gstNo)
      if (data.supplierName) setSupplierName(data.supplierName)
      if (data.buyerName) setBuyerName(data.buyerName)
      if (data.amount) setAmount(String(data.amount))
      if (data.dueDate) setDueDate(data.dueDate)
      if (data.description) setDescription(data.description)
    } catch (err: any) {
      setExtractError(err.message || 'Could not extract invoice data. Please fill fields manually.')
    } finally {
      setExtracting(false)
    }
  }, [])

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const clearFile = () => {
    setUploadedFile(null)
    setExtracted(null)
    setExtractError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md flex">
      {/* ── Sidebar ── */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant py-8 px-4 z-40">
        <div className="mb-8">
          <Link href="/supplier/dashboard" className="block">
            <h1 className="font-headline-lg text-headline-lg-mobile text-primary font-bold">ChainBill</h1>
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant">MSME Solutions</p>
        </div>
        <div className="flex-grow flex flex-col gap-2">
          <Link href="/supplier/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-full text-on-surface-variant hover:bg-primary-container/20 transition-all font-label-md text-label-md">
            <span className="material-symbols-outlined">dashboard</span>Dashboard
          </Link>
          <Link href="/supplier/raise-invoice" className="flex items-center gap-3 px-4 py-2 rounded-full text-on-primary bg-primary font-label-md text-label-md transition-all scale-95">
            <span className="material-symbols-outlined">description</span>Raise Invoice
          </Link>
          <Link href="/supplier/my-invoices" className="flex items-center gap-3 px-4 py-2 rounded-full text-on-surface-variant hover:bg-primary-container/20 transition-all font-label-md text-label-md">
            <span className="material-symbols-outlined">storefront</span>My Invoices
          </Link>
          <Link href="/supplier/credit-history" className="flex items-center gap-3 px-4 py-2 rounded-full text-on-surface-variant hover:bg-primary-container/20 transition-all font-label-md text-label-md">
            <span className="material-symbols-outlined">settings</span>Credit History
          </Link>
        </div>
        <div className="mt-auto flex flex-col gap-4">
          <button type="button" onClick={() => router.push('/supplier/raise-invoice')}
            className="w-full py-3 bg-on-background text-on-primary font-label-md text-label-md rounded hover:bg-primary transition-colors border border-on-background">
            Create Invoice
          </button>
          <div className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-2 rounded-full text-on-surface-variant hover:bg-primary-container/20 transition-all font-label-md text-label-md" href="#">
              <span className="material-symbols-outlined">help</span>Support
            </a>
            <button type="button" onClick={() => signOut({ redirectUrl: '/' })}
              className="flex items-center gap-3 px-4 py-2 rounded-full text-on-surface-variant hover:bg-primary-container/20 transition-all font-label-md text-label-md">
              <span className="material-symbols-outlined">logout</span>Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="w-full md:ml-64 flex flex-col min-h-screen px-margin-mobile md:px-margin-desktop py-12">
        <header className="mb-12">
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">Raise Invoice</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Upload your invoice PDF to auto-fill fields, or enter details manually.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <div className="lg:col-span-2 space-y-8">

            {/* ── PDF Upload Zone ── */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8">
              <p className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest mb-4">
                Step 1 — Upload Invoice PDF
              </p>

              {!uploadedFile ? (
                /* Drop zone */
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-12 flex flex-col items-center cursor-pointer transition-all duration-300 ${dragOver
                    ? 'border-primary bg-primary-container/10 scale-[1.01]'
                    : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <span className={`material-symbols-outlined text-5xl mb-4 transition-colors ${dragOver ? 'text-primary' : 'text-outline'}`}>
                    upload_file
                  </span>
                  <p className="font-body-md text-body-md text-on-surface mb-2 text-center">
                    {dragOver ? 'Drop your PDF here' : 'Drag & drop your invoice PDF, or click to browse'}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
                    Supports PDF up to 10 MB
                  </p>
                  <div className="mt-6 bg-surface-tint text-on-primary px-6 py-3 font-label-md text-label-md flex items-center gap-2 rounded transition-colors hover:bg-primary pointer-events-none">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Extract with AI
                  </div>
                </div>
              ) : (
                /* Uploaded file preview */
                <div className="w-full border border-outline-variant rounded-xl p-6 flex flex-col gap-4">
                  {/* File info row */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-2xl">picture_as_pdf</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-label-md text-label-md text-on-surface truncate">{uploadedFile.name}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{formatFileSize(uploadedFile.size)}</p>
                    </div>
                    <button type="button" onClick={clearFile}
                      className="p-2 rounded-full hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>

                  {/* Extraction status */}
                  {extracting && (
                    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <svg className="animate-spin h-5 w-5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <div>
                        <p className="font-label-md text-label-md text-primary">Extracting with Gemini AI…</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Reading invoice fields from your PDF</p>
                      </div>
                    </div>
                  )}

                  {extracted && !extracting && (
                    <div className="p-4 bg-surface-container-low border border-outline-variant rounded-lg">
                      <div className="flex items-center gap-2 text-surface-tint mb-3">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <span className="font-label-md text-label-md font-bold">Fields extracted — please verify below</span>
                      </div>
                      <div className="w-full bg-outline-variant h-1.5 rounded-full overflow-hidden">
                        <div className="bg-surface-tint h-full rounded-full transition-all duration-700" style={{ width: `${extracted.confidence ?? 85}%` }} />
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant block text-right mt-1">
                        {extracted.confidence ?? 85}% Confidence
                      </span>
                    </div>
                  )}

                  {extractError && !extracting && (
                    <div className="flex items-start gap-3 p-4 bg-error/5 border border-error/20 rounded-lg">
                      <span className="material-symbols-outlined text-error flex-shrink-0 text-xl mt-0.5">error</span>
                      <div>
                        <p className="font-label-md text-label-md text-error">Extraction failed</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{extractError}</p>
                        <button type="button" onClick={() => processFile(uploadedFile)}
                          className="mt-2 font-label-sm text-label-sm text-primary underline hover:no-underline">
                          Try again
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Re-upload link */}
                  {!extracting && (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="text-left font-label-sm text-label-sm text-primary underline hover:no-underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">swap_horiz</span>
                      Replace PDF
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                </div>
              )}
            </div>

            {/* ── Invoice Form ── */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 space-y-8">
              <p className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest">
                Step 2 — Verify & Complete Details
              </p>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-8">
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest flex items-center gap-2">
                    Invoice No.
                    {extracted?.invoiceNo && <span className="material-symbols-outlined text-sm text-surface-tint" title="Auto-filled by AI">auto_awesome</span>}
                  </label>
                  <input
                    className="w-full bg-transparent border-0 border-b border-outline text-on-background font-body-md text-body-md py-3 px-0 focus:ring-0 focus:border-b-2 focus:border-on-background transition-colors"
                    type="text"
                    placeholder="e.g. INV-2026-089"
                    value={invoiceNo}
                    onChange={e => setInvoiceNo(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest flex items-center gap-2">
                    GST No.
                    {extracted?.gstNo && <span className="material-symbols-outlined text-sm text-surface-tint" title="Auto-filled by AI">auto_awesome</span>}
                  </label>
                  <input
                    className="w-full bg-transparent border-0 border-b border-outline text-on-background font-body-md text-body-md py-3 px-0 focus:ring-0 focus:border-b-2 focus:border-on-background transition-colors"
                    type="text"
                    placeholder="e.g. 27AADCB2230M1Z2"
                    value={gstNo}
                    onChange={e => setGstNo(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest flex items-center gap-2">
                    Supplier Name
                    {extracted?.supplierName && <span className="material-symbols-outlined text-sm text-surface-tint" title="Auto-filled by AI">auto_awesome</span>}
                  </label>
                  <input
                    className="w-full bg-transparent border-0 border-b border-outline text-on-background font-body-md text-body-md py-3 px-0 focus:ring-0 focus:border-b-2 focus:border-on-background transition-colors"
                    type="text"
                    placeholder="Your company name"
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest flex items-center gap-2">
                    Buyer
                    {extracted?.buyerName && <span className="material-symbols-outlined text-sm text-surface-tint" title="Auto-filled by AI">auto_awesome</span>}
                  </label>
                  {buyers.length > 0 ? (
                    <select
                      className="w-full bg-transparent border-0 border-b border-outline text-on-background font-body-md text-body-md py-3 px-0 focus:ring-0 focus:border-b-2 focus:border-on-background transition-colors"
                      value={selectedBuyerId}
                      onChange={e => {
                        setSelectedBuyerId(e.target.value)
                        const b = buyers.find(x => x.id === e.target.value)
                        if (b) setBuyerName(b.buyer_profiles?.company_name ?? b.name)
                      }}
                    >
                      <option value="">Select a buyer…</option>
                      {buyers.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.buyer_profiles?.company_name ?? b.name} — {b.email}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="w-full bg-transparent border-0 border-b border-outline text-on-background font-body-md text-body-md py-3 px-0 focus:ring-0 focus:border-b-2 focus:border-on-background transition-colors"
                      type="text"
                      placeholder="Buyer company name"
                      value={buyerName}
                      onChange={e => setBuyerName(e.target.value)}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest flex items-center gap-2">
                    Amount (₹)
                    {extracted?.amount && <span className="material-symbols-outlined text-sm text-surface-tint" title="Auto-filled by AI">auto_awesome</span>}
                  </label>
                  <input
                    className="w-full bg-transparent border-0 border-b border-outline text-on-background font-body-md text-body-md py-3 px-0 focus:ring-0 focus:border-b-2 focus:border-on-background transition-colors"
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest flex items-center gap-2">
                    Due Date
                    {extracted?.dueDate && <span className="material-symbols-outlined text-sm text-surface-tint" title="Auto-filled by AI">auto_awesome</span>}
                  </label>
                  <input
                    className="w-full bg-transparent border-0 border-b border-outline text-on-background font-body-md text-body-md py-3 px-0 focus:ring-0 focus:border-b-2 focus:border-on-background transition-colors"
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest flex items-center gap-2">
                  Description
                  {extracted?.description && <span className="material-symbols-outlined text-sm text-surface-tint" title="Auto-filled by AI">auto_awesome</span>}
                </label>
                <textarea
                  className="w-full bg-transparent border-0 border-b border-outline text-on-background font-body-md text-body-md py-3 px-0 focus:ring-0 focus:border-b-2 focus:border-on-background transition-colors resize-none"
                  rows={3}
                  placeholder="Describe the goods or services..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {extracted && (
                <p className="font-label-sm text-label-sm text-surface-tint flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Fields marked with this icon were auto-filled by Gemini AI. Please verify before submitting.
                </p>
              )}

              <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                      <input
                        className="h-5 w-5 rounded border-outline text-surface-tint focus:ring-surface-tint cursor-pointer bg-transparent"
                        id="draft" name="draft" type="checkbox"
                      />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                      <label className="font-label-md text-label-md text-on-surface cursor-pointer" htmlFor="draft">Save as Draft</label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  {submitError && (
                    <p className="text-error font-label-sm text-label-sm w-full">{submitError}</p>
                  )}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmitInvoice(true)}
                    className="flex-1 md:flex-none px-6 py-3 border border-on-background text-on-background font-label-md text-label-md hover:bg-surface-variant transition-colors rounded disabled:opacity-50"
                  >
                    {submitting ? 'Saving…' : 'Save Draft'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmitInvoice(false)}
                    className="flex-1 md:flex-none px-6 py-3 bg-on-background text-on-primary font-label-md text-label-md hover:bg-surface-tint transition-colors flex items-center justify-center gap-2 rounded disabled:opacity-50"
                  >
                    {submitting ? 'Submitting…' : 'Submit Invoice'}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar Widget ── */}
          <div className="lg:col-span-1 space-y-stack-gap">
            <div className="bg-primary text-on-primary rounded-xl p-8 flex flex-col sticky top-24">
              <h3 className="font-headline-lg text-headline-lg-mobile mb-8 border-b border-on-primary/20 pb-4">Estimated Savings</h3>
              <div className="space-y-6 mb-8 flex-grow">
                <div className="flex justify-between items-center pb-4 border-b border-on-primary/10">
                  <span className="font-label-md text-label-md opacity-80">Your ChainBill rate:</span>
                  <span className="font-body-lg text-body-lg font-bold">1.4% / mo</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-on-primary/10">
                  <span className="font-label-md text-label-md opacity-80">Market rate:</span>
                  <span className="font-body-lg text-body-lg">2.5% / mo</span>
                </div>
                <div className="pt-4">
                  <span className="font-label-sm text-label-sm uppercase tracking-widest opacity-80 block mb-2">Projected Savings</span>
                  <div className="font-headline-lg text-headline-lg text-primary-fixed">
                    {amount
                      ? `₹ ${Math.round(Number(amount) * (0.025 - 0.014)).toLocaleString('en-IN')}`
                      : '₹ —'}
                  </div>
                </div>
              </div>
              <div className="bg-on-primary/10 p-4 rounded-lg mt-auto">
                <p className="font-label-sm text-label-sm flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                  0.75% transaction fee applies — overall cost remains significantly lower than traditional 2.5%/month factoring.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-highest border-l-4 border-surface-tint p-4 rounded-r-xl shadow-sm">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-surface-tint">auto_awesome</span>
                <div>
                  <h4 className="font-label-md text-label-md text-on-background mb-1">AI-Powered Extraction</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                    Upload your invoice PDF and Gemini AI will automatically read and fill all fields. Always verify before submitting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
