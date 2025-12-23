import { NextRequest, NextResponse } from 'next/server'
import { dbInstance } from '@/lib/db'

// Force dynamic rendering to prevent Next.js from trying to execute this during build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid result ID' },
        { status: 400 }
      )
    }

    const result = await dbInstance.getResultById(id)

    if (!result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      )
    }

    // Transform result to match frontend format
    const transformedResult = {
      id: result.id,
      name: result.name,
      email: result.email,
      dept: result.department,
      teamCode: result.team_code,
      natural: {
        D: result.natural_D,
        I: result.natural_I,
        S: result.natural_S,
        C: result.natural_C,
      },
      adaptive: {
        D: result.adaptive_D,
        I: result.adaptive_I,
        S: result.adaptive_S,
        C: result.adaptive_C,
      },
      primaryNatural: result.primary_natural,
      primaryAdaptive: result.primary_adaptive,
      drivingForces: result.driving_forces ? JSON.parse(result.driving_forces) : null,
      date: result.created_at ? result.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    }

    return NextResponse.json(transformedResult)
  } catch (error) {
    console.error('Error fetching result:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch result', details: errorMessage },
      { status: 500 }
    )
  }
}

