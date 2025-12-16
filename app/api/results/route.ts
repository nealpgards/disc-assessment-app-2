import { NextRequest, NextResponse } from 'next/server'
import { dbInstance } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      dept,
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

    // Insert result into database
    const stmt = dbInstance.prepare(`
      INSERT INTO results (
        name, email, department,
        natural_D, natural_I, natural_S, natural_C,
        adaptive_D, adaptive_I, adaptive_S, adaptive_C,
        primary_natural, primary_adaptive, driving_forces
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    // Normalize department name (trim whitespace)
    const normalizedDept = dept.trim()

    const result = stmt.run(
      name,
      email || null,
      normalizedDept,
      natural.D,
      natural.I,
      natural.S,
      natural.C,
      adaptive.D,
      adaptive.I,
      adaptive.S,
      adaptive.C,
      primaryNatural,
      primaryAdaptive,
      drivingForces ? JSON.stringify(drivingForces) : null
    )

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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = 'SELECT * FROM results'
    const params: any[] = []
    const conditions: string[] = []

    if (department) {
      conditions.push('department = ?')
      params.push(department)
    }

    if (startDate) {
      conditions.push('created_at >= ?')
      params.push(startDate)
    }

    if (endDate) {
      conditions.push('created_at <= ?')
      params.push(endDate + ' 23:59:59')
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY created_at DESC'

    const stmt = dbInstance.prepare(query)
    const results = stmt.all(...params) as any[]

    // Transform results to match frontend format
    const transformedResults = results.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      dept: row.department,
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
      date: row.created_at.split('T')[0],
    }))

    return NextResponse.json(transformedResults)
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    )
  }
}

