import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Client-side / public queries (subject to RLS)
export const supabase = createClient(url, anonKey)

// Server-side only — bypasses RLS using the service role key.
// NEVER import this in client components or expose to the browser.
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
})
