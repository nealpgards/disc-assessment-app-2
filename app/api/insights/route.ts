import { NextResponse } from 'next/server'
import {
  calculateDepartmentCompatibility,
  analyzeTeamComposition,
  getCommunicationInsights,
  getDepartmentData,
} from '@/lib/insights'

export async function GET() {
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
    const deptData = getDepartmentData()
    const departmentCount = deptData.length

    // Calculate each insight type independently to allow partial success
    try {
      result.compatibility = calculateDepartmentCompatibility()
    } catch (compatError) {
      console.error('Error calculating compatibility:', compatError)
      result.compatibility = []
    }

    try {
      result.teamComposition = analyzeTeamComposition()
    } catch (compError) {
      console.error('Error analyzing team composition:', compError)
      result.teamComposition = []
    }

    try {
      result.communicationInsights = getCommunicationInsights()
    } catch (commError) {
      console.error('Error getting communication insights:', commError)
      result.communicationInsights = []
    }

    // Add metadata about why compatibility might not be available
    result.metadata = {
      departmentCount,
      totalResults: deptData.reduce((sum, dept) => sum + dept.count, 0),
      compatibilityAvailable: result.compatibility.length > 0,
      compatibilityReason:
        departmentCount < 2
          ? 'Need at least 2 departments with results to calculate compatibility'
          : result.compatibility.length === 0
            ? 'Compatibility calculation returned no results'
            : undefined,
    }

    // Debug logging
    console.log('Insights calculated:', {
      compatibilityCount: result.compatibility.length,
      teamCompositionCount: result.teamComposition.length,
      communicationInsightsCount: result.communicationInsights.length,
      metadata: result.metadata,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error calculating insights:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Failed to calculate insights',
        details: errorMessage,
        compatibility: [],
        teamComposition: [],
        communicationInsights: [],
      },
      { status: 500 }
    )
  }
}

