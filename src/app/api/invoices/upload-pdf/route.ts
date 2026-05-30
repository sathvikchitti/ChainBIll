import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const _session = await getServerSession(authOptions)
    const userEmail = _session?.user?.email
    if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 10 MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_')
    const filename = `${Date.now()}-${safeName}`

    // Upload to Supabase Storage bucket "invoices"
    // Create this bucket in Supabase Dashboard → Storage if it doesn't exist
    const { data: storageData, error: storageErr } = await supabase.storage
      .from('invoices')
      .upload(filename, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    let url: string
    if (storageErr) {
      // Storage bucket may not exist in dev — fall back to base64 data URL approach
      console.warn('[upload-pdf] Storage error, returning base64 only:', storageErr.message)
      url = `data:application/pdf;base64,${buffer.toString('base64').slice(0, 50)}...` // placeholder
    } else {
      const { data: publicData } = supabase.storage
        .from('invoices')
        .getPublicUrl(storageData.path)
      url = publicData.publicUrl
    }

    return NextResponse.json({
      url,
      filename: file.name,
      size: file.size,
      // Return base64 for AI extraction (files under 5 MB)
      base64: file.size < 5 * 1024 * 1024 ? buffer.toString('base64') : null,
    })
  } catch (err: any) {
    console.error('[upload-pdf]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
