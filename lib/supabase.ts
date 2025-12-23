import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null
let supabaseAdminClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time (Next.js build phase), allow placeholder client to prevent build errors
  // The Proxy ensures this only gets called when actually used, not during module load
  if (!supabaseUrl || !supabaseAnonKey) {
    // Check if we're in Next.js build phase
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                         (typeof process.env.VERCEL === 'undefined' && process.env.NODE_ENV === 'production')
    
    if (isBuildPhase) {
      // During build, create a placeholder client
      // This will fail at runtime if env vars are still missing, but allows build to succeed
      supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key') as SupabaseClient
      return supabaseClient
    }
    
    // At runtime, throw error if env vars are missing
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
    )
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

function getSupabaseAdminClient(): SupabaseClient {
  if (supabaseAdminClient) {
    return supabaseAdminClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // During build time (Next.js build phase), allow placeholder client to prevent build errors
  // The Proxy ensures this only gets called when actually used, not during module load
  if (!supabaseUrl || !supabaseAnonKey) {
    // Check if we're in Next.js build phase
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                         (typeof process.env.VERCEL === 'undefined' && process.env.NODE_ENV === 'production')
    
    if (isBuildPhase) {
      // During build, create a placeholder client
      // This will fail at runtime if env vars are still missing, but allows build to succeed
      supabaseAdminClient = createClient('https://placeholder.supabase.co', 'placeholder-key') as SupabaseClient
      return supabaseAdminClient
    }
    
    // At runtime, throw error if env vars are missing
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
    )
  }

  supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey)
  return supabaseAdminClient
}

// Create proxy objects that lazily initialize the clients when accessed
// This prevents errors during build time when env vars might not be available
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    const value = client[prop as keyof SupabaseClient]
    // If it's a function, bind it to the client to preserve 'this' context
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdminClient()
    const value = client[prop as keyof SupabaseClient]
    // If it's a function, bind it to the client to preserve 'this' context
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

