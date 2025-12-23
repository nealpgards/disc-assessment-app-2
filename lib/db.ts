import { supabase } from './supabase'

export interface ResultRow {
  id: number
  name: string
  email: string | null
  department: string
  team_code: string | null
  natural_D: number
  natural_I: number
  natural_S: number
  natural_C: number
  adaptive_D: number
  adaptive_I: number
  adaptive_S: number
  adaptive_C: number
  primary_natural: string
  primary_adaptive: string
  driving_forces: string | null
  created_at: string
}

// Database helper functions using Supabase
export const dbInstance = {
  // Insert a new result
  async insertResult(data: {
    name: string
    email: string | null
    department: string
    team_code: string | null
    natural_D: number
    natural_I: number
    natural_S: number
    natural_C: number
    adaptive_D: number
    adaptive_I: number
    adaptive_S: number
    adaptive_C: number
    primary_natural: string
    primary_adaptive: string
    driving_forces: string | null
  }) {
    const { data: result, error } = await supabase
      .from('results')
      .insert(data)
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      lastInsertRowid: result.id,
      changes: 1,
    }
  },

  // Query results with optional filters
  async queryResults(filters?: {
    department?: string
    teamCode?: string
    startDate?: string
    endDate?: string
  }): Promise<ResultRow[]> {
    let query = supabase.from('results').select('*')

    if (filters?.department) {
      query = query.eq('department', filters.department.trim())
    }

    if (filters?.teamCode) {
      query = query.eq('team_code', filters.teamCode.trim().toUpperCase())
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate + ' 23:59:59')
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw error
    }

    return (data || []) as ResultRow[]
  },

  // Get all results
  async getAllResults(): Promise<ResultRow[]> {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return (data || []) as ResultRow[]
  },
}

