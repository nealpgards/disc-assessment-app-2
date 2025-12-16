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
  const stmt = dbInstance.prepare('SELECT * FROM results ORDER BY created_at DESC')
  return stmt.all() as ResultRow[]
}

// Normalize department name (trim whitespace and convert to lowercase for comparison)
function normalizeDepartmentName(dept: string): string {
  return dept.trim()
}

// Get canonical department name (use the first occurrence as the canonical name)
function getCanonicalDepartmentName(dept: string, allResults: ResultRow[]): string {
  const normalized = normalizeDepartmentName(dept)
  // Find the first occurrence of this department (case-insensitive, trimmed)
  const firstMatch = allResults.find(
    (r) => normalizeDepartmentName(r.department).toLowerCase() === normalized.toLowerCase()
  )
  return firstMatch ? normalizeDepartmentName(firstMatch.department) : normalized
}

export function getDepartmentData(): DepartmentData[] {
  const results = getAllResults()
  
  // Filter out empty or null departments
  const validResults = results.filter((r) => r.department && r.department.trim().length > 0)
  
  if (validResults.length === 0) {
    return []
  }
  
  // Group departments by normalized name (case-insensitive, trimmed)
  const departmentMap = new Map<string, ResultRow[]>()
  
  validResults.forEach((r) => {
    const normalized = normalizeDepartmentName(r.department).toLowerCase()
    if (!departmentMap.has(normalized)) {
      departmentMap.set(normalized, [])
    }
    departmentMap.get(normalized)!.push(r)
  })
  
  // Get canonical names for each normalized department
  const departments = Array.from(departmentMap.keys()).map((normalized) => {
    const firstResult = departmentMap.get(normalized)![0]
    return getCanonicalDepartmentName(firstResult.department, validResults)
  })

  return departments.map((dept) => {
    // Filter results that match this department (case-insensitive, trimmed)
    const normalizedDept = normalizeDepartmentName(dept).toLowerCase()
    const deptResults = validResults.filter(
      (r) => normalizeDepartmentName(r.department).toLowerCase() === normalizedDept
    )
    const count = deptResults.length

    // Calculate averages
    const avgNatural: Scores = {
      D: Math.round(deptResults.reduce((sum, r) => sum + r.natural_D, 0) / count),
      I: Math.round(deptResults.reduce((sum, r) => sum + r.natural_I, 0) / count),
      S: Math.round(deptResults.reduce((sum, r) => sum + r.natural_S, 0) / count),
      C: Math.round(deptResults.reduce((sum, r) => sum + r.natural_C, 0) / count),
    }

    const avgAdaptive: Scores = {
      D: Math.round(deptResults.reduce((sum, r) => sum + r.adaptive_D, 0) / count),
      I: Math.round(deptResults.reduce((sum, r) => sum + r.adaptive_I, 0) / count),
      S: Math.round(deptResults.reduce((sum, r) => sum + r.adaptive_S, 0) / count),
      C: Math.round(deptResults.reduce((sum, r) => sum + r.adaptive_C, 0) / count),
    }

    // Primary type distribution
    const primaryNaturalDistribution: Record<DISCType, number> = {
      D: deptResults.filter((r) => r.primary_natural === 'D').length,
      I: deptResults.filter((r) => r.primary_natural === 'I').length,
      S: deptResults.filter((r) => r.primary_natural === 'S').length,
      C: deptResults.filter((r) => r.primary_natural === 'C').length,
    }

    const primaryAdaptiveDistribution: Record<DISCType, number> = {
      D: deptResults.filter((r) => r.primary_adaptive === 'D').length,
      I: deptResults.filter((r) => r.primary_adaptive === 'I').length,
      S: deptResults.filter((r) => r.primary_adaptive === 'S').length,
      C: deptResults.filter((r) => r.primary_adaptive === 'C').length,
    }

    return {
      department: dept,
      count,
      avgNatural,
      avgAdaptive,
      primaryNaturalDistribution,
      primaryAdaptiveDistribution,
    }
  })
}

function getPrimaryType(scores: Scores): DISCType {
  return (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as DISCType)
}

export function calculateDepartmentCompatibility(): CompatibilityScore[] {
  const deptData = getDepartmentData()
  const compatibilities: CompatibilityScore[] = []

  for (let i = 0; i < deptData.length; i++) {
    for (let j = i + 1; j < deptData.length; j++) {
      const dept1 = deptData[i]
      const dept2 = deptData[j]

      // Get primary types
      const dept1Primary = getPrimaryType(dept1.avgNatural)
      const dept2Primary = getPrimaryType(dept2.avgNatural)

      // Calculate compatibility score
      const baseScore = compatibilityMatrix[dept1Primary][dept2Primary]

      // Adjust based on score similarity (more balanced departments work better)
      const dept1Balance = 1 - Math.max(...Object.values(dept1.avgNatural)) / 100
      const dept2Balance = 1 - Math.max(...Object.values(dept2.avgNatural)) / 100
      const balanceBonus = (dept1Balance + dept2Balance) / 2 * 0.2

      const finalScore = Math.min(1, baseScore + balanceBonus)

      compatibilities.push({
        dept1: dept1.department,
        dept2: dept2.department,
        score: Math.round(finalScore * 100),
        reasoning: getCompatibilityReasoning(dept1Primary, dept2Primary),
      })
    }
  }

  return compatibilities.sort((a, b) => b.score - a.score)
}

export function analyzeTeamComposition(): TeamComposition[] {
  const deptData = getDepartmentData()
  const compositions: TeamComposition[] = []

  deptData.forEach((dept) => {
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
  })

  return compositions
}

export function getCommunicationInsights(): CommunicationInsight[] {
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
    const primaryType = getPrimaryType(dept.avgNatural)
    const styleInfo = communicationStyles[primaryType]
    const recommendations: string[] = []

    // Generate recommendations based on other departments
    deptData.forEach((otherDept) => {
      if (otherDept.department === dept.department) return

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
    })

    insights.push({
      department: dept.department,
      style: styleInfo.style,
      preferences: styleInfo.preferences,
      recommendations: recommendations.length > 0 ? recommendations : ['Standard communication practices apply'],
    })
  })

  return insights
}

