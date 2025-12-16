import { NextResponse } from 'next/server'
import {
  calculateDepartmentCompatibility,
  analyzeTeamComposition,
  getCommunicationInsights,
} from '@/lib/insights'

export async function GET() {
  try {
    const compatibility = calculateDepartmentCompatibility()
    const teamComposition = analyzeTeamComposition()
    const communicationInsights = getCommunicationInsights()

    // Debug logging
    console.log('Insights calculated:', {
      compatibilityCount: compatibility.length,
      teamCompositionCount: teamComposition.length,
      communicationInsightsCount: communicationInsights.length,
    })

    return NextResponse.json({
      compatibility,
      teamComposition,
      communicationInsights,
    })
  } catch (error) {
    console.error('Error calculating insights:', error)
    return NextResponse.json(
      { error: 'Failed to calculate insights' },
      { status: 500 }
    )
  }
}

