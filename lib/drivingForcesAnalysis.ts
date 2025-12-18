// Client-safe driving forces analysis functions
// These functions don't depend on database or Node.js modules

// Driving Forces Types
export type DrivingForceType =
  | 'KI' // Knowledge - Instinctive
  | 'KN' // Knowledge - Intellectual
  | 'US' // Utility - Selfless
  | 'UR' // Utility - Resourceful
  | 'SO' // Surroundings - Objective
  | 'SH' // Surroundings - Harmonious
  | 'OI' // Others - Intentional
  | 'OA' // Others - Altruistic
  | 'PC' // Power - Collaborative
  | 'PD' // Power - Commanding
  | 'MR' // Methodologies - Receptive
  | 'MS' // Methodologies - Structured

export type DISCType = 'D' | 'I' | 'S' | 'C'

export interface DrivingForceScores {
  [key: string]: number
}

export interface DrivingForceDescription {
  name: string
  fullName: string
  description: string
  traits: string[]
  color: string
  bgColor: string
  examples?: string[]
  workplaceScenarios?: string[]
  strengths?: string[]
  blindSpots?: string[]
}

export interface ForceClassification {
  primary: Array<{ type: DrivingForceType; score: number; description: DrivingForceDescription }>
  situational: Array<{ type: DrivingForceType; score: number; description: DrivingForceDescription }>
  indifferent: Array<{ type: DrivingForceType; score: number; description: DrivingForceDescription }>
}

export interface DISCIntegration {
  alignment: 'strong' | 'moderate' | 'conflict'
  insights: string[]
  recommendations: string[]
}

export interface TeamDynamics {
  collaborationStyle: string
  complementaryProfiles: string[]
  communicationPreferences: string[]
  potentialFrictions: string[]
}

export interface DevelopmentRecommendations {
  leveragePrimary: string[]
  developSituational: string[]
  workWithIndifferent: string[]
  personalGoals: string[]
}

// Classify driving forces into primary, situational, and indifferent
export function classifyDrivingForces(
  scores: DrivingForceScores,
  descriptions: Record<DrivingForceType, DrivingForceDescription>
): ForceClassification {
  const allForces = Object.entries(scores) as [DrivingForceType, number][]
  
  const primary: Array<{ type: DrivingForceType; score: number; description: DrivingForceDescription }> = []
  const situational: Array<{ type: DrivingForceType; score: number; description: DrivingForceDescription }> = []
  const indifferent: Array<{ type: DrivingForceType; score: number; description: DrivingForceDescription }> = []

  allForces.forEach(([type, score]) => {
    const description = descriptions[type]
    if (!description) return

    const forceData = { type, score, description }

    if (score >= 8) {
      primary.push(forceData)
    } else if (score >= 4) {
      situational.push(forceData)
    } else {
      indifferent.push(forceData)
    }
  })

  // Sort by score (highest first)
  primary.sort((a, b) => b.score - a.score)
  situational.sort((a, b) => b.score - a.score)
  indifferent.sort((a, b) => b.score - a.score)

  return { primary, situational, indifferent }
}

// Analyze how DISC style integrates with driving forces
export function analyzeDISCIntegration(
  discType: DISCType,
  primaryForces: DrivingForceType[],
  forceDescriptions: Record<DrivingForceType, DrivingForceDescription>
): DISCIntegration {
  const insights: string[] = []
  const recommendations: string[] = []
  let alignment: 'strong' | 'moderate' | 'conflict' = 'moderate'

  // Map DISC types to compatible driving forces
  const discForceAlignment: Record<DISCType, DrivingForceType[]> = {
    D: ['PD', 'UR', 'SO', 'OI'], // Commanding, Resourceful, Objective, Intentional
    I: ['OA', 'SH', 'PC', 'MR'], // Altruistic, Harmonious, Collaborative, Receptive
    S: ['OA', 'PC', 'SH', 'MS'], // Altruistic, Collaborative, Harmonious, Structured
    C: ['KN', 'SO', 'MS', 'UR'], // Intellectual, Objective, Structured, Resourceful
  }

  const compatibleForces = discForceAlignment[discType]
  const alignedCount = primaryForces.filter(f => compatibleForces.includes(f)).length
  const totalPrimary = primaryForces.length

  if (alignedCount === totalPrimary && totalPrimary > 0) {
    alignment = 'strong'
    insights.push(`Your ${discType} behavioral style strongly aligns with your primary driving forces, creating a cohesive and consistent approach.`)
  } else if (alignedCount >= totalPrimary / 2) {
    alignment = 'moderate'
    insights.push(`Your ${discType} style generally complements your driving forces, with some areas that may require conscious integration.`)
  } else {
    alignment = 'conflict'
    insights.push(`Your ${discType} behavioral style and driving forces show some tension, which may require awareness and adaptation.`)
  }

  // Generate specific insights based on combinations
  if (discType === 'D') {
    if (primaryForces.includes('PD')) {
      insights.push('Your dominant style combined with Commanding power creates strong leadership potential.')
    }
    if (primaryForces.includes('US')) {
      insights.push('Your direct approach may contrast with Selfless utility - be mindful of balancing assertiveness with service.')
      recommendations.push('Practice active listening and consider others\' perspectives before making decisions')
    }
  } else if (discType === 'I') {
    if (primaryForces.includes('OA')) {
      insights.push('Your influence style paired with Altruistic orientation makes you excellent at building relationships and supporting others.')
    }
    if (primaryForces.includes('PD')) {
      insights.push('Your collaborative nature may conflict with Commanding power - you may struggle with needing individual recognition.')
      recommendations.push('Find ways to contribute that allow for both team success and personal acknowledgment')
    }
  } else if (discType === 'S') {
    if (primaryForces.includes('PC')) {
      insights.push('Your steady approach combined with Collaborative power creates a reliable and supportive team member.')
    }
    if (primaryForces.includes('PD')) {
      insights.push('Your preference for stability may conflict with Commanding power - you may feel uncomfortable in leadership roles.')
      recommendations.push('Consider taking on supportive leadership roles that align with your collaborative nature')
    }
  } else if (discType === 'C') {
    if (primaryForces.includes('KN')) {
      insights.push('Your conscientious style paired with Intellectual knowledge creates a strong analytical and learning-focused approach.')
    }
    if (primaryForces.includes('MR')) {
      insights.push('Your systematic nature may contrast with Receptive methodologies - you may resist change and new ideas.')
      recommendations.push('Practice being open to new approaches while maintaining your quality standards')
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue leveraging the natural alignment between your behavior and motivations')
    recommendations.push('Be aware of situations where your DISC style and driving forces may create internal tension')
  }

  return { alignment, insights, recommendations }
}

// Get team dynamics insights based on driving forces
export function getTeamDynamicsInsights(
  primaryForces: DrivingForceType[],
  forceDescriptions: Record<DrivingForceType, DrivingForceDescription>
): TeamDynamics {
  const collaborationStyle: string[] = []
  const complementaryProfiles: string[] = []
  const communicationPreferences: string[] = []
  const potentialFrictions: string[] = []

  // Analyze collaboration style
  if (primaryForces.includes('PC')) {
    collaborationStyle.push('You thrive in collaborative, team-oriented environments where everyone contributes equally.')
  } else if (primaryForces.includes('PD')) {
    collaborationStyle.push('You prefer taking leadership roles and driving team outcomes.')
  } else {
    collaborationStyle.push('You adapt your collaboration style based on the situation and team needs.')
  }

  if (primaryForces.includes('OA') || primaryForces.includes('US')) {
    collaborationStyle.push('You naturally support others and prioritize team success over individual recognition.')
  }

  // Identify complementary profiles
  if (primaryForces.includes('PD')) {
    complementaryProfiles.push('People with Collaborative (PC) power who can support your leadership')
    complementaryProfiles.push('Those with Structured (MS) methodologies who provide organization')
  }
  if (primaryForces.includes('PC')) {
    complementaryProfiles.push('People with Commanding (PD) power who can provide direction')
    complementaryProfiles.push('Those with Objective (SO) surroundings who bring structure')
  }
  if (primaryForces.includes('KN')) {
    complementaryProfiles.push('People with Instinctive (KI) knowledge who can provide practical experience')
  }
  if (primaryForces.includes('KI')) {
    complementaryProfiles.push('People with Intellectual (KN) knowledge who can provide research and analysis')
  }
  if (primaryForces.includes('MR')) {
    complementaryProfiles.push('People with Structured (MS) methodologies who can provide stability')
  }
  if (primaryForces.includes('MS')) {
    complementaryProfiles.push('People with Receptive (MR) methodologies who can bring innovation')
  }

  // Communication preferences
  if (primaryForces.includes('KN')) {
    communicationPreferences.push('You appreciate detailed explanations and data-driven discussions')
  }
  if (primaryForces.includes('OA') || primaryForces.includes('US')) {
    communicationPreferences.push('You value communication that focuses on people and relationships')
  }
  if (primaryForces.includes('SO')) {
    communicationPreferences.push('You prefer clear, organized, and functional communication')
  }
  if (primaryForces.includes('SH')) {
    communicationPreferences.push('You appreciate communication that considers feelings and creates harmony')
  }

  // Potential friction points
  if (primaryForces.includes('PD') && !primaryForces.includes('PC')) {
    potentialFrictions.push('You may clash with others who also want to lead or control outcomes')
  }
  if (primaryForces.includes('MS') && !primaryForces.includes('MR')) {
    potentialFrictions.push('You may struggle with team members who constantly want to change processes')
  }
  if (primaryForces.includes('UR') && !primaryForces.includes('US')) {
    potentialFrictions.push('You may conflict with those who prioritize helping others over efficiency')
  }
  if (primaryForces.includes('SO') && !primaryForces.includes('SH')) {
    potentialFrictions.push('You may find it difficult to work with those who prioritize aesthetics over function')
  }

  return {
    collaborationStyle: collaborationStyle.join(' '),
    complementaryProfiles: complementaryProfiles.length > 0 ? complementaryProfiles : ['You work well with diverse team members'],
    communicationPreferences: communicationPreferences.length > 0 ? communicationPreferences : ['Standard communication practices work well'],
    potentialFrictions: potentialFrictions.length > 0 ? potentialFrictions : ['Minimal friction expected with most team members'],
  }
}

// Get development recommendations
export function getDevelopmentRecommendations(
  classification: ForceClassification
): DevelopmentRecommendations {
  const leveragePrimary: string[] = []
  const developSituational: string[] = []
  const workWithIndifferent: string[] = []
  const personalGoals: string[] = []

  // Leverage primary forces
  if (classification.primary.length > 0) {
    leveragePrimary.push(`Focus on opportunities that align with your primary forces: ${classification.primary.map(f => f.description.name).join(', ')}`)
    leveragePrimary.push('Seek roles and projects that naturally engage these motivators')
    leveragePrimary.push('Use these forces as your foundation for decision-making and goal-setting')
  }

  // Develop situational forces
  if (classification.situational.length > 0) {
    developSituational.push(`Practice activating your situational forces when needed: ${classification.situational.map(f => f.description.name).join(', ')}`)
    developSituational.push('Look for opportunities to develop these motivators in relevant contexts')
    developSituational.push('Be aware of situations where these forces could be valuable')
  } else {
    developSituational.push('You have a clear distinction between primary and indifferent forces')
    developSituational.push('Consider exploring middle-ground motivators to increase flexibility')
  }

  // Work with indifferent forces
  if (classification.indifferent.length > 0) {
    workWithIndifferent.push(`Recognize that these forces have minimal impact: ${classification.indifferent.map(f => f.description.name).join(', ')}`)
    workWithIndifferent.push('Don\'t expect these factors to motivate you significantly')
    workWithIndifferent.push('When these forces are required, partner with others who are naturally motivated by them')
  }

  // Personal goals
  personalGoals.push('Continue developing self-awareness around what truly motivates you')
  if (classification.primary.length >= 3) {
    personalGoals.push('Focus on integrating your multiple primary forces for maximum impact')
  }
  if (classification.situational.length > 0) {
    personalGoals.push('Practice flexing your situational forces to become more adaptable')
  }
  personalGoals.push('Regularly reflect on how your driving forces align with your current activities and goals')

  return {
    leveragePrimary,
    developSituational,
    workWithIndifferent,
    personalGoals,
  }
}

