import { dbInstance, ResultRow } from './db'

type DISCType = 'D' | 'I' | 'S' | 'C'

interface Scores {
  D: number
  I: number
  S: number
  C: number
}

interface DepartmentData {
  department: string
  count: number
  avgNatural: Scores
  avgAdaptive: Scores
  primaryNaturalDistribution: Record<DISCType, number>
  primaryAdaptiveDistribution: Record<DISCType, number>
}

interface CompatibilityScore {
  dept1: string
  dept2: string
  score: number
  reasoning: string
}

interface TeamComposition {
  department: string
  strengths: string[]
  gaps: string[]
  recommendations: string[]
}

interface CommunicationInsight {
  department: string
  style: string
  preferences: string[]
  recommendations: string[]
}

// DISC compatibility matrix
const compatibilityMatrix: Record<DISCType, Record<DISCType, number>> = {
  D: { D: 0.6, I: 0.7, S: 0.9, C: 0.5 },
  I: { D: 0.7, I: 0.6, S: 0.7, C: 0.8 },
  S: { D: 0.9, I: 0.7, S: 0.6, C: 0.8 },
  C: { D: 0.5, I: 0.8, S: 0.8, C: 0.6 },
}

function getCompatibilityReasoning(dept1: DISCType, dept2: DISCType): string {
  const reasons: Record<string, string> = {
    'D-S': 'Dominance and Steadiness complement each other - D provides drive while S ensures stability',
    'S-D': 'Steadiness and Dominance complement each other - S provides stability while D ensures drive',
    'I-C': 'Influence and Conscientiousness work well - I brings energy while C ensures quality',
    'C-I': 'Conscientiousness and Influence work well - C ensures quality while I brings energy',
    'D-D': 'Both departments are direct and results-focused - may need conflict management',
    'I-I': 'Both departments are enthusiastic and collaborative - great for innovation',
    'S-S': 'Both departments value stability - reliable but may resist change',
    'C-C': 'Both departments are detail-oriented - high quality but may be slow',
  }

  return reasons[`${dept1}-${dept2}`] || 'Standard collaboration expected'
}

export function getAllResults(): ResultRow[] {
  try {
    if (!dbInstance) {
      console.error('Database instance is not available')
      return []
    }
    
    const stmt = dbInstance.prepare('SELECT * FROM results ORDER BY created_at DESC')
    const results = stmt.all() as ResultRow[]
    
    console.log(`[Insights] Retrieved ${results.length} results from database`)
    return results
  } catch (error) {
    console.error('[Insights] Error fetching results from database:', error)
    return []
  }
}

// Normalize department name (trim whitespace)
function normalizeDepartmentName(dept: string): string {
  if (!dept || typeof dept !== 'string') {
    return ''
  }
  return dept.trim()
}

// Export for use in API routes
export function getDepartmentData(): DepartmentData[] {
  try {
    const results = getAllResults()
    
    if (!results || results.length === 0) {
      console.log('[Insights] No results found in database')
      return []
    }
    
    // Filter out empty or null departments
    const validResults = results.filter((r) => {
      return r && r.department && typeof r.department === 'string' && normalizeDepartmentName(r.department).length > 0
    })
    
    if (validResults.length === 0) {
      console.log('[Insights] No valid results with departments found')
      return []
    }
    
    // Group departments by normalized name (case-insensitive, trimmed)
    const departmentMap = new Map<string, ResultRow[]>()
    
    validResults.forEach((r) => {
      const normalized = normalizeDepartmentName(r.department).toLowerCase()
      if (normalized.length > 0) {
        if (!departmentMap.has(normalized)) {
          departmentMap.set(normalized, [])
        }
        departmentMap.get(normalized)!.push(r)
      }
    })
    
    // Debug logging
    console.log('[Insights] Department grouping:', {
      totalResults: results.length,
      validResults: validResults.length,
      uniqueDepartments: departmentMap.size,
      departmentNames: Array.from(departmentMap.keys()),
    })
    
    if (departmentMap.size === 0) {
      console.log('[Insights] No departments found after grouping')
      return []
    }
    
    // Get canonical names for each normalized department (use first occurrence's original name)
    const departments = Array.from(departmentMap.keys()).map((normalized) => {
      const firstResult = departmentMap.get(normalized)![0]
      return normalizeDepartmentName(firstResult.department) // Use trimmed version of first occurrence
    })

    const departmentData = departments.map((dept) => {
      // Filter results that match this department (case-insensitive, trimmed)
      const normalizedDept = normalizeDepartmentName(dept).toLowerCase()
      const deptResults = validResults.filter(
        (r) => normalizeDepartmentName(r.department).toLowerCase() === normalizedDept
      )
      const count = deptResults.length

      if (count === 0) {
        console.warn(`[Insights] No results found for department: ${dept}`)
        return null
      }

      // Validate that all required fields exist
      const validDeptResults = deptResults.filter(r => 
        typeof r.natural_D === 'number' && 
        typeof r.natural_I === 'number' &&
        typeof r.natural_S === 'number' &&
        typeof r.natural_C === 'number' &&
        typeof r.adaptive_D === 'number' &&
        typeof r.adaptive_I === 'number' &&
        typeof r.adaptive_S === 'number' &&
        typeof r.adaptive_C === 'number'
      )

      if (validDeptResults.length === 0) {
        console.warn(`[Insights] No valid results with scores for department: ${dept}`)
        return null
      }

      // Calculate averages
      const avgNatural: Scores = {
        D: Math.round(validDeptResults.reduce((sum, r) => sum + (r.natural_D || 0), 0) / validDeptResults.length),
        I: Math.round(validDeptResults.reduce((sum, r) => sum + (r.natural_I || 0), 0) / validDeptResults.length),
        S: Math.round(validDeptResults.reduce((sum, r) => sum + (r.natural_S || 0), 0) / validDeptResults.length),
        C: Math.round(validDeptResults.reduce((sum, r) => sum + (r.natural_C || 0), 0) / validDeptResults.length),
      }

      const avgAdaptive: Scores = {
        D: Math.round(validDeptResults.reduce((sum, r) => sum + (r.adaptive_D || 0), 0) / validDeptResults.length),
        I: Math.round(validDeptResults.reduce((sum, r) => sum + (r.adaptive_I || 0), 0) / validDeptResults.length),
        S: Math.round(validDeptResults.reduce((sum, r) => sum + (r.adaptive_S || 0), 0) / validDeptResults.length),
        C: Math.round(validDeptResults.reduce((sum, r) => sum + (r.adaptive_C || 0), 0) / validDeptResults.length),
      }

      // Primary type distribution
      const primaryNaturalDistribution: Record<DISCType, number> = {
        D: validDeptResults.filter((r) => r.primary_natural === 'D').length,
        I: validDeptResults.filter((r) => r.primary_natural === 'I').length,
        S: validDeptResults.filter((r) => r.primary_natural === 'S').length,
        C: validDeptResults.filter((r) => r.primary_natural === 'C').length,
      }

      const primaryAdaptiveDistribution: Record<DISCType, number> = {
        D: validDeptResults.filter((r) => r.primary_adaptive === 'D').length,
        I: validDeptResults.filter((r) => r.primary_adaptive === 'I').length,
        S: validDeptResults.filter((r) => r.primary_adaptive === 'S').length,
        C: validDeptResults.filter((r) => r.primary_adaptive === 'C').length,
      }

      return {
        department: dept,
        count: validDeptResults.length,
        avgNatural,
        avgAdaptive,
        primaryNaturalDistribution,
        primaryAdaptiveDistribution,
      }
    }).filter((dept): dept is DepartmentData => dept !== null)

    console.log(`[Insights] Processed ${departmentData.length} departments with valid data`)
    return departmentData
  } catch (error) {
    console.error('[Insights] Error in getDepartmentData:', error)
    return []
  }
}

function getPrimaryType(scores: Scores): DISCType {
  const entries = Object.entries(scores) as [DISCType, number][]
  const sorted = entries.sort((a, b) => b[1] - a[1])
  return sorted[0][0]
}

export function calculateDepartmentCompatibility(): CompatibilityScore[] {
  try {
    console.log('[Insights] Starting compatibility calculation...')
    const deptData = getDepartmentData()
    
    console.log(`[Insights] Found ${deptData.length} departments`)
    
    // Need at least 2 departments for compatibility analysis
    if (deptData.length < 2) {
      console.log('[Insights] Not enough departments for compatibility analysis:', {
        departmentCount: deptData.length,
        departments: deptData.map(d => d.department),
      })
      return []
    }

    // Validate department data
    const validDeptData = deptData.filter(dept => {
      if (!dept || !dept.department || dept.count === 0) {
        console.warn('[Insights] Invalid department data (missing or zero count):', dept)
        return false
      }
      // Validate scores exist and are numbers
      if (!dept.avgNatural || !dept.avgAdaptive) {
        console.warn('[Insights] Invalid scores (missing avgNatural or avgAdaptive):', dept.department)
        return false
      }
      const hasValidNaturalScores = Object.values(dept.avgNatural).every(
        score => typeof score === 'number' && !isNaN(score) && score >= 0
      )
      const hasValidAdaptiveScores = Object.values(dept.avgAdaptive).every(
        score => typeof score === 'number' && !isNaN(score) && score >= 0
      )
      if (!hasValidNaturalScores || !hasValidAdaptiveScores) {
        console.warn('[Insights] Invalid scores for department:', dept.department, {
          avgNatural: dept.avgNatural,
          avgAdaptive: dept.avgAdaptive,
        })
        return false
      }
      return true
    })

    if (validDeptData.length < 2) {
      console.log('[Insights] Not enough valid departments for compatibility analysis:', {
        total: deptData.length,
        valid: validDeptData.length,
      })
      return []
    }

    console.log('[Insights] Calculating compatibility for departments:', validDeptData.map(d => d.department))

    const compatibilities: CompatibilityScore[] = []

    for (let i = 0; i < validDeptData.length; i++) {
      for (let j = i + 1; j < validDeptData.length; j++) {
        try {
          const dept1 = validDeptData[i]
          const dept2 = validDeptData[j]

          // Get primary types
          const dept1Primary = getPrimaryType(dept1.avgNatural)
          const dept2Primary = getPrimaryType(dept2.avgNatural)

          // Validate primary types
          if (!dept1Primary || !dept2Primary) {
            console.warn(`[Insights] Could not determine primary types for ${dept1.department} or ${dept2.department}`)
            continue
          }

          if (!compatibilityMatrix[dept1Primary] || !compatibilityMatrix[dept1Primary][dept2Primary]) {
            console.warn(`[Insights] Invalid compatibility matrix lookup for ${dept1Primary}-${dept2Primary}`)
            continue
          }

          // Calculate compatibility score
          const baseScore = compatibilityMatrix[dept1Primary][dept2Primary]

          // Adjust based on score similarity (more balanced departments work better)
          const dept1Max = Math.max(...Object.values(dept1.avgNatural))
          const dept2Max = Math.max(...Object.values(dept2.avgNatural))
          const dept1Balance = dept1Max > 0 ? 1 - dept1Max / 100 : 0
          const dept2Balance = dept2Max > 0 ? 1 - dept2Max / 100 : 0
          const balanceBonus = (dept1Balance + dept2Balance) / 2 * 0.2

          const finalScore = Math.min(1, Math.max(0, baseScore + balanceBonus))

          compatibilities.push({
            dept1: dept1.department,
            dept2: dept2.department,
            score: Math.round(finalScore * 100),
            reasoning: getCompatibilityReasoning(dept1Primary, dept2Primary),
          })
        } catch (pairError) {
          console.error(`[Insights] Error calculating compatibility for pair ${i}-${j}:`, pairError)
          // Continue with other pairs
        }
      }
    }

    console.log(`[Insights] Calculated ${compatibilities.length} compatibility scores`)
    return compatibilities.sort((a, b) => b.score - a.score)
  } catch (error) {
    console.error('[Insights] Error in calculateDepartmentCompatibility:', error)
    return []
  }
}

export function analyzeTeamComposition(): TeamComposition[] {
  try {
    console.log('[Insights] Starting team composition analysis...')
    const deptData = getDepartmentData()
    const compositions: TeamComposition[] = []

    deptData.forEach((dept) => {
      try {
        // Validate department data
        if (!dept || !dept.department || dept.count === 0) {
          console.warn('[Insights] Skipping invalid department:', dept)
          return
        }

        // Validate scores
        if (!dept.avgNatural || typeof dept.avgNatural.D !== 'number') {
          console.warn('[Insights] Invalid scores for department:', dept.department)
          return
        }

        const primaryType = getPrimaryType(dept.avgNatural)
        const strengths: string[] = []
        const gaps: string[] = []
        const recommendations: string[] = []

        // Analyze strengths
        if (dept.avgNatural.D > 30) {
          strengths.push('Strong drive and results orientation')
        }
        if (dept.avgNatural.I > 30) {
          strengths.push('Excellent collaboration and communication')
        }
        if (dept.avgNatural.S > 30) {
          strengths.push('Reliable and stable team members')
        }
        if (dept.avgNatural.C > 30) {
          strengths.push('High attention to detail and quality')
        }

        // Identify gaps
        if (dept.avgNatural.D < 20) {
          gaps.push('May lack assertiveness and drive')
          recommendations.push('Consider pairing with high-D individuals for projects requiring quick decisions')
        }
        if (dept.avgNatural.I < 20) {
          gaps.push('May struggle with relationship building')
          recommendations.push('Add team members who excel at networking and collaboration')
        }
        if (dept.avgNatural.S < 20) {
          gaps.push('May lack stability and consistency')
          recommendations.push('Include steady team members to provide structure')
        }
        if (dept.avgNatural.C < 20) {
          gaps.push('May overlook details and quality control')
          recommendations.push('Ensure quality checks and detail-oriented processes')
        }

        // Cross-functional recommendations
        if (primaryType === 'D') {
          recommendations.push('Works well with Steadiness-focused teams for balanced execution')
        } else if (primaryType === 'I') {
          recommendations.push('Complements Conscientiousness teams for thorough innovation')
        } else if (primaryType === 'S') {
          recommendations.push('Benefits from Dominance teams for driving change')
        } else if (primaryType === 'C') {
          recommendations.push('Pairs well with Influence teams for creative problem-solving')
        }

        compositions.push({
          department: dept.department,
          strengths,
          gaps,
          recommendations,
        })
      } catch (deptError) {
        console.error(`[Insights] Error analyzing team composition for department ${dept?.department}:`, deptError)
        // Continue with other departments
      }
    })

    console.log(`[Insights] Analyzed ${compositions.length} team compositions`)
    return compositions
  } catch (error) {
    console.error('[Insights] Error in analyzeTeamComposition:', error)
    return []
  }
}

export function getCommunicationInsights(): CommunicationInsight[] {
  try {
    console.log('[Insights] Starting communication insights analysis...')
    const deptData = getDepartmentData()
    const insights: CommunicationInsight[] = []

    const communicationStyles: Record<DISCType, { style: string; preferences: string[] }> = {
      D: {
        style: 'Direct and Results-Focused',
        preferences: [
          'Brief, to-the-point communication',
          'Focus on outcomes and action items',
          'Prefer written summaries over long meetings',
          'Appreciate quick decision-making',
        ],
      },
      I: {
        style: 'Enthusiastic and Relationship-Focused',
        preferences: [
          'Engaging, story-driven communication',
          'Prefer face-to-face or video calls',
          'Value recognition and positive feedback',
          'Enjoy collaborative brainstorming sessions',
        ],
      },
      S: {
        style: 'Patient and Supportive',
        preferences: [
          'Clear, step-by-step instructions',
          'Prefer structured meetings with agendas',
          'Value consistency and follow-through',
          'Appreciate time to process information',
        ],
      },
      C: {
        style: 'Precise and Data-Driven',
        preferences: [
          'Detailed documentation and data',
          'Prefer written communication for accuracy',
          'Value thorough analysis before decisions',
          'Appreciate well-organized information',
        ],
      },
    }

    deptData.forEach((dept) => {
      try {
        // Validate department data
        if (!dept || !dept.department || dept.count === 0) {
          console.warn('[Insights] Skipping invalid department:', dept)
          return
        }

        // Validate scores
        if (!dept.avgNatural || typeof dept.avgNatural.D !== 'number') {
          console.warn('[Insights] Invalid scores for department:', dept.department)
          return
        }

        const primaryType = getPrimaryType(dept.avgNatural)
        const styleInfo = communicationStyles[primaryType]
        
        if (!styleInfo) {
          console.warn(`[Insights] No communication style found for type: ${primaryType}`)
          return
        }

        const recommendations: string[] = []

        // Generate recommendations based on other departments
        deptData.forEach((otherDept) => {
          if (!otherDept || otherDept.department === dept.department) return
          if (!otherDept.avgNatural) return

          try {
            const otherPrimary = getPrimaryType(otherDept.avgNatural)

            if (primaryType === 'D' && otherPrimary === 'S') {
              recommendations.push(
                `When communicating with ${otherDept.department}: Provide context and allow time for processing`
              )
            } else if (primaryType === 'S' && otherPrimary === 'D') {
              recommendations.push(
                `When communicating with ${otherDept.department}: Lead with key points and action items`
              )
            } else if (primaryType === 'I' && otherPrimary === 'C') {
              recommendations.push(
                `When communicating with ${otherDept.department}: Include data and specific details`
              )
            } else if (primaryType === 'C' && otherPrimary === 'I') {
              recommendations.push(
                `When communicating with ${otherDept.department}: Use engaging examples and stories`
              )
            }
          } catch (recError) {
            console.error(`[Insights] Error generating recommendation for ${dept.department} -> ${otherDept.department}:`, recError)
            // Continue with other departments
          }
        })

        insights.push({
          department: dept.department,
          style: styleInfo.style,
          preferences: styleInfo.preferences,
          recommendations: recommendations.length > 0 ? recommendations : ['Standard communication practices apply'],
        })
      } catch (deptError) {
        console.error(`[Insights] Error getting communication insights for department ${dept?.department}:`, deptError)
        // Continue with other departments
      }
    })

    console.log(`[Insights] Generated ${insights.length} communication insights`)
    return insights
  } catch (error) {
    console.error('[Insights] Error in getCommunicationInsights:', error)
    return []
  }
}
