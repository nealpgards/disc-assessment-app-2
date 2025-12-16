import { NextResponse } from 'next/server'
import {
  calculateDepartmentCompatibility,
  analyzeTeamComposition,
  getCommunicationInsights,
  getDepartmentData,
} from '@/lib/insights'

export async function GET() {
  console.log('[API] Insights endpoint called')
  
  const result: {
    compatibility: Array<{ dept1: string; dept2: string; score: number; reasoning: string }>
    teamComposition: Array<{ department: string; strengths: string[]; gaps: string[]; recommendations: string[] }>
    communicationInsights: Array<{ department: string; style: string; preferences: string[]; recommendations: string[] }>
    metadata?: {
      departmentCount: number
      totalResults: number
      compatibilityAvailable: boolean
      compatibilityReason?: string
    }
  } = {
    compatibility: [],
    teamComposition: [],
    communicationInsights: [],
  }

  try {
    // Get department data to provide metadata
    console.log('[API] Fetching department data...')
    const deptData = getDepartmentData()
    const departmentCount = deptData.length
    const totalResults = deptData.reduce((sum, dept) => sum + dept.count, 0)

    console.log('[API] Department data retrieved:', {
      departmentCount,
      totalResults,
      departments: deptData.map(d => ({ name: d.department, count: d.count })),
    })

    // Calculate each insight type independently to allow partial success
    try {
      console.log('[API] Calculating compatibility...')
      result.compatibility = calculateDepartmentCompatibility()
      console.log('[API] Compatibility calculated:', result.compatibility.length, 'pairs')
    } catch (compatError) {
      console.error('[API] Error calculating compatibility:', compatError)
      result.compatibility = []
    }

    try {
      console.log('[API] Analyzing team composition...')
      result.teamComposition = analyzeTeamComposition()
      console.log('[API] Team composition analyzed:', result.teamComposition.length, 'departments')
    } catch (compError) {
      console.error('[API] Error analyzing team composition:', compError)
      result.teamComposition = []
    }

    try {
      console.log('[API] Getting communication insights...')
      result.communicationInsights = getCommunicationInsights()
      console.log('[API] Communication insights retrieved:', result.communicationInsights.length, 'departments')
    } catch (commError) {
      console.error('[API] Error getting communication insights:', commError)
      result.communicationInsights = []
    }

    // Add metadata about why compatibility might not be available
    result.metadata = {
      departmentCount,
      totalResults,
      compatibilityAvailable: result.compatibility.length > 0,
      compatibilityReason:
        departmentCount < 2
          ? 'Need at least 2 departments with results to calculate compatibility'
          : result.compatibility.length === 0
            ? 'Compatibility calculation returned no results'
            : undefined,
    }

    // Debug logging
    console.log('[API] Insights calculated:', {
      compatibilityCount: result.compatibility.length,
      teamCompositionCount: result.teamComposition.length,
      communicationInsightsCount: result.communicationInsights.length,
      metadata: result.metadata,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Error calculating insights:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('[API] Full error details:', {
      message: errorMessage,
      stack: errorStack,
    })
    
    return NextResponse.json(
      {
        error: 'Failed to calculate insights',
        details: errorMessage,
        compatibility: [],
        teamComposition: [],
        communicationInsights: [],
        metadata: {
          departmentCount: 0,
          totalResults: 0,
          compatibilityAvailable: false,
          compatibilityReason: `Error: ${errorMessage}`,
        },
      },
      { status: 500 }
    )
  }
}
