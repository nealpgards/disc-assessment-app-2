import { NextRequest, NextResponse } from 'next/server'
import { dbInstance } from '@/lib/db'

// Force dynamic rendering to prevent Next.js from trying to execute this during build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      dept,
      teamCode,
      natural,
      adaptive,
      primaryNatural,
      primaryAdaptive,
      drivingForces,
    } = body

    // Validate required fields
    if (!name || !dept || !natural || !adaptive || !primaryNatural || !primaryAdaptive) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Normalize department name (trim whitespace)
    const normalizedDept = dept.trim()
    const normalizedTeamCode = teamCode ? teamCode.trim().toUpperCase() : null

    // Lightweight diagnostic logging (safe fields only)
    console.log('[API/results POST] Saving result', {
      name,
      dept: normalizedDept,
      rawTeamCode: teamCode,
      normalizedTeamCode,
      hasDrivingForces: !!drivingForces,
    })

    // Insert result into database
    const result = await dbInstance.insertResult({
      name,
      email: email || null,
      department: normalizedDept,
      team_code: normalizedTeamCode,
      natural_D: natural.D,
      natural_I: natural.I,
      natural_S: natural.S,
      natural_C: natural.C,
      adaptive_D: adaptive.D,
      adaptive_I: adaptive.I,
      adaptive_S: adaptive.S,
      adaptive_C: adaptive.C,
      primary_natural: primaryNatural,
      primary_adaptive: primaryAdaptive,
      driving_forces: drivingForces ? JSON.stringify(drivingForces) : null,
    })

    console.log('[API/results POST] Saved result row', {
      lastInsertRowid: result.lastInsertRowid,
      changes: result.changes,
      normalizedTeamCode,
    })

    return NextResponse.json(
      { id: result.lastInsertRowid, success: true },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error saving result:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to save result', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const teamCode = searchParams.get('teamCode')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const normalizedTeamCode = teamCode ? teamCode.trim().toUpperCase() : null

    // Diagnostic logging for query + params
    console.log('[API/results GET] Executing query', {
      department,
      rawTeamCode: teamCode,
      normalizedTeamCode,
      startDate,
      endDate,
    })

    // Query results with filters
    const results = await dbInstance.queryResults({
      department: department || undefined,
      teamCode: normalizedTeamCode || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })

    console.log('[API/results GET] Raw rows fetched', {
      rowCount: results.length,
      sampleTeamCodes: Array.from(
        new Set(
          results
            .map((row: any) => row.team_code)
            .filter((code: string | null | undefined) => !!code)
        )
      ).slice(0, 10),
    })

    // Transform results to match frontend format
    const transformedResults = results.map((row) => {
      try {
        return {
          id: row.id,
          name: row.name,
          email: row.email,
          dept: row.department,
          teamCode: row.team_code,
          natural: {
            D: row.natural_D,
            I: row.natural_I,
            S: row.natural_S,
            C: row.natural_C,
          },
          adaptive: {
            D: row.adaptive_D,
            I: row.adaptive_I,
            S: row.adaptive_S,
            C: row.adaptive_C,
          },
          primaryNatural: row.primary_natural,
          primaryAdaptive: row.primary_adaptive,
          drivingForces: row.driving_forces ? JSON.parse(row.driving_forces) : null,
          date: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        }
      } catch (parseError) {
        console.error('Error parsing result row:', parseError, row)
        // Return a safe fallback for this row
        return {
          id: row.id,
          name: row.name || 'Unknown',
          email: row.email,
          dept: row.department || 'Unknown',
          teamCode: row.team_code || null,
          natural: {
            D: row.natural_D || 0,
            I: row.natural_I || 0,
            S: row.natural_S || 0,
            C: row.natural_C || 0,
          },
          adaptive: {
            D: row.adaptive_D || 0,
            I: row.adaptive_I || 0,
            S: row.adaptive_S || 0,
            C: row.adaptive_C || 0,
          },
          primaryNatural: row.primary_natural || 'S',
          primaryAdaptive: row.primary_adaptive || 'S',
          drivingForces: null,
          date: new Date().toISOString().split('T')[0],
        }
      }
    })

    return NextResponse.json(transformedResults)
  } catch (error) {
    console.error('Error fetching results:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch results', details: errorMessage },
      { status: 500 }
    )
  }
}

