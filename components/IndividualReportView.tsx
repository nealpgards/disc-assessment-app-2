'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts'
import { Download, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { generatePDFReport } from '@/lib/pdfGenerator'
import DrivingForcesChart from '@/components/DrivingForcesChart'

// Types
type DISCType = 'D' | 'I' | 'S' | 'C'

interface Scores {
  D: number
  I: number
  S: number
  C: number
}

interface CalculatedScores {
  natural: Scores
  adaptive: Scores
  primaryNatural: DISCType
  primaryAdaptive: DISCType
}

interface DrivingForceResult {
  scores: Record<string, number>
  primaryForces: Record<string, string>
}

interface Result {
  id?: number
  name: string
  email?: string
  dept: string
  teamCode?: string
  natural: Scores
  adaptive: Scores
  primaryNatural: DISCType
  primaryAdaptive: DISCType
  date: string
  drivingForces?: DrivingForceResult
}

interface ProfileDescription {
  name: string
  color: string
  bgColor: string
  traits: string[]
  naturalDesc: string
  adaptiveDesc: string
  stressResponse: string
  growth: string
}

interface CommunicationGuide {
  styleLabel: string
  howToCommunicate: string[]
  howNotToCommunicate: string[]
  selfPerception: string[]
  othersPerception: string[]
}

const profileDescriptions: Record<DISCType, ProfileDescription> = {
  D: {
    name: 'Dominance',
    color: '#dc2626',
    bgColor: '#fef2f2',
    traits: ['Direct', 'Results-oriented', 'Decisive', 'Competitive', 'Independent'],
    naturalDesc:
      'Naturally driven to take charge, make quick decisions, and focus on results. Thrives on challenges and autonomy.',
    adaptiveDesc:
      'Under stress, may become more demanding, impatient, or aggressive. May push harder for control and results.',
    stressResponse: 'Becomes more forceful and demanding',
    growth: "Practice patience, listen more, consider others' perspectives",
  },
  I: {
    name: 'Influence',
    color: '#d97706',
    bgColor: '#fef3c7',
    traits: ['Enthusiastic', 'Optimistic', 'Collaborative', 'Creative', 'Persuasive'],
    naturalDesc:
      'Naturally drawn to people, creativity, and recognition. Energized by social interaction and new ideas.',
    adaptiveDesc:
      'Under stress, may become disorganized, overly talkative, or emotional. May seek more approval from others.',
    stressResponse: 'Becomes more talkative and emotional',
    growth: 'Focus on follow-through, organize priorities, balance optimism with realism',
  },
  S: {
    name: 'Steadiness',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    traits: ['Patient', 'Reliable', 'Team-oriented', 'Calm', 'Supportive'],
    naturalDesc:
      'Naturally values stability, cooperation, and supporting others. Prefers predictable environments and harmonious relationships.',
    adaptiveDesc:
      'Under stress, may become passive, indecisive, or overly accommodating. May avoid necessary confrontation.',
    stressResponse: 'Becomes more passive and accommodating',
    growth: 'Embrace change, speak up more, set boundaries',
  },
  C: {
    name: 'Conscientiousness',
    color: '#2563eb',
    bgColor: '#eff6ff',
    traits: ['Analytical', 'Detail-oriented', 'Systematic', 'Accurate', 'Quality-focused'],
    naturalDesc:
      'Naturally focused on quality, accuracy, and systematic thinking. Values expertise and doing things correctly.',
    adaptiveDesc:
      'Under stress, may become overly critical, perfectionistic, or withdrawn. May over-analyze and delay decisions.',
    stressResponse: 'Becomes more critical and withdrawn',
    growth: 'Accept imperfection, make faster decisions, share concerns openly',
  },
}

const communicationGuides: Record<DISCType, CommunicationGuide> = {
  D: {
    styleLabel: 'Direct, fast-paced, and results-focused communicator',
    howToCommunicate: [
      'Get to the point quickly and lead with the bottom line or decision needed.',
      'Be clear about goals, ownership, and timelines – focus on outcomes more than process.',
      'Offer options and autonomy rather than prescribing every step.',
    ],
    howNotToCommunicate: [
      'Do not bury key points in long stories or excessive background.',
      'Avoid indecisive language, mixed messages, or lack of follow-through.',
      'Do not take direct questions personally or respond with overly emotional reactions.',
    ],
    selfPerception: [
      'You likely see yourself as confident, decisive, and driven to get results.',
      'You may view your directness as efficient and helpful to the team.',
    ],
    othersPerception: [
      'Others may see you as impatient, demanding, or overly blunt when under pressure.',
      'Some may hesitate to challenge you or share concerns if they feel rushed or dismissed.',
    ],
  },
  I: {
    styleLabel: 'Enthusiastic, people-oriented, and expressive communicator',
    howToCommunicate: [
      'Start with connection – be warm, positive, and conversational.',
      'Share the vision, impact, and "why" behind decisions, not just the details.',
      'Give space for brainstorming, questions, and verbal processing.',
    ],
    howNotToCommunicate: [
      'Do not be overly formal, distant, or purely data-only with no context.',
      'Avoid shutting down ideas too quickly or focusing only on what is wrong.',
      'Do not ignore their need for interaction by relying only on one-way communication.',
    ],
    selfPerception: [
      'You likely see yourself as friendly, encouraging, and good with people.',
      'You may view your optimism and energy as a key contribution to the team.',
    ],
    othersPerception: [
      'Others may see you as scattered, overly talkative, or lacking follow-through at times.',
      'Some may feel you overpromise or move on too quickly from details and commitments.',
    ],
  },
  S: {
    styleLabel: 'Calm, steady, and supportive communicator',
    howToCommunicate: [
      'Provide a safe, respectful space and avoid putting them on the spot unexpectedly.',
      'Be clear, patient, and consistent – allow time to process and ask questions.',
      'Explain how changes will affect people, stability, and day-to-day routines.',
    ],
    howNotToCommunicate: [
      'Do not surprise them with last-minute changes or abrupt confrontations.',
      'Avoid aggressive, high-pressure tactics or rapid-fire decisions with no input.',
      'Do not dismiss their concerns about impact on people or team harmony.',
    ],
    selfPerception: [
      'You likely see yourself as loyal, dependable, and a good listener.',
      'You may view your calm presence as a stabilizing force for the team.',
    ],
    othersPerception: [
      'Others may see you as resistant to change, quiet, or slow to decide.',
      'Some may underestimate your opinions because you do not always speak first.',
    ],
  },
  C: {
    styleLabel: 'Thoughtful, precise, and data-driven communicator',
    howToCommunicate: [
      'Come prepared with facts, structure, and clear reasoning behind your message.',
      'Give time to analyze information and ask detailed questions.',
      'Be specific about expectations, quality standards, and processes.',
    ],
    howNotToCommunicate: [
      'Do not be vague, inconsistent, or dismissive of details and risks.',
      'Avoid pressuring for instant decisions without sufficient information.',
      'Do not take critical questions as personal attacks – they are seeking clarity.',
    ],
    selfPerception: [
      'You likely see yourself as careful, thorough, and committed to doing things right.',
      'You may view your questions and critique as protecting quality and reducing risk.',
    ],
    othersPerception: [
      'Others may see you as overly critical, slow, or rigid when standards feel too high.',
      'Some may feel intimidated by your focus on accuracy or fear "being wrong" around you.',
    ],
  },
}

const communicationChecklists: Record<DISCType, { waysToCommunicate: string[]; waysNotToCommunicate: string[] }> = {
  D: {
    waysToCommunicate: [
      'Understand their sporadic listening skills.',
      'Put projects in writing, with deadlines.',
      'Be specific and leave nothing to chance.',
      'Be open, honest and informal.',
      'Expect acceptance without a lot of questions.',
      'Be isolated from interruptions.',
      'Ask specific (preferably "what?") questions.',
      'Support the results, not the person, if you agree.',
      'Provide time for fun and relaxing.',
      'Use their jargon.',
      'Provide questions, alternatives and choices for making their own decisions.',
      'Read the body language--look for impatience or disapproval.',
      'Stick to business--let them decide if they want to talk socially.',
    ],
    waysNotToCommunicate: [
      'Ask rhetorical questions, or useless ones.',
      'Try to build personal relationships.',
      'Try to convince by "personal" means.',
      'Reinforce agreement with "I\'m with you."',
      'Let them change the topic until you are finished.',
      'Be put off by their "cockiness."',
      'Ramble on, or waste their time.',
      'Dictate to them.',
      'Forget or lose things, be disorganized or messy, confuse or distract their mind from business.',
      'Let disagreement reflect on them personally.',
      'Direct or order.',
      'Assume they heard what you said.',
    ],
  },
  I: {
    waysToCommunicate: [
      'Provide testimonials from people they see as important.',
      'Provide a forum for them to verbalize their thoughts.',
      'Be enthusiastic and optimistic.',
      'Allow time for relating and socializing.',
      'Put details in writing.',
      'Focus on people benefits.',
      'Provide ideas for implementing action.',
      'Be stimulating, fun-loving and fast-moving.',
      'Give them public recognition.',
      'Support their dreams and intentions.',
      'Allow them to move at a rapid pace.',
      'Talk about "who" more than "what" or "how".',
      'Provide incentives for others to work with them.',
      'Be open to their non-verbal communication.',
      'Provide them with names and faces of other people involved.',
    ],
    waysNotToCommunicate: [
      'Be cold, aloof or tight-lipped.',
      'Be overly task-oriented.',
      'Leave decisions hanging in the air.',
      'Drive on facts and figures, alternatives or abstractions.',
      'Forget to include them in the decision-making process.',
      'Be pessimistic or critical.',
      'Be impersonal or task-oriented.',
      'Leave them out of the social loop.',
      'Forget to provide testimonials and social proof.',
      'Be boring or too low-key.',
      'Forget to recognize their contributions.',
      'Be overly structured or rigid.',
    ],
  },
  S: {
    waysToCommunicate: [
      'Begin with personal comments--break the ice.',
      'Show sincere interest in them as people.',
      'Listen and be responsive to them.',
      'Be patient, helpful and show appreciation.',
      'Give them time to think things over.',
      'Provide personal assurances and guarantees.',
      'Give them time to adjust to change.',
      'Present your case softly, non-threateningly.',
      'Ask "how" questions to draw out their opinions.',
      'Find out about their personal and family interests.',
      'Be consistent and regular in your follow-through.',
      'Provide clarification if needed.',
      'Give them advance notice so they can prepare.',
      'Reassure them that support will be available.',
    ],
    waysNotToCommunicate: [
      'Be pushy, gimmicky or manipulative.',
      'Be rude, aggressive or overly assertive.',
      'Forget to be personal and friendly.',
      'Rush them or force quick decisions.',
      'Be overly businesslike or task-oriented.',
      'Forget to follow through on commitments.',
      'Change things suddenly or unexpectedly.',
      'Forget to provide personal assurances.',
      'Be impatient or demanding.',
      'Forget to show appreciation for their contributions.',
      'Be cold or impersonal.',
      'Forget to give them time to process information.',
    ],
  },
  C: {
    waysToCommunicate: [
      'Be systematic, logical, well prepared and organized.',
      'Be accurate and realistic.',
      'List advantages and disadvantages of any plan.',
      'Give them time to verify and check information.',
      'Provide them with detailed, written data.',
      'Be patient with the decision-making process.',
      'Be precise and specific about expectations.',
      'Provide clarification and answers to questions.',
      'Present information in an orderly manner.',
      'Support their organized, thoughtful approach.',
      'Give them time to analyze and process.',
      'Be diplomatic and tactful.',
      'Provide documentation and follow-up in writing.',
      'Respect their need for accuracy and quality.',
    ],
    waysNotToCommunicate: [
      'Be disorganized or messy.',
      'Be giddy, casual, informal or loud.',
      'Be vague or ambiguous.',
      'Force quick decisions or responses.',
      'Be confrontational or demanding.',
      'Forget to provide detailed information.',
      'Be overly optimistic or unrealistic.',
      'Forget to follow through on commitments.',
      'Be inconsistent or unpredictable.',
      'Forget to provide written documentation.',
      'Be overly emotional or dramatic.',
      'Forget to allow time for analysis and verification.',
    ],
  },
}

const perceptionsData: Record<DISCType, { selfPerception: string[]; othersPerceptionModerate: string[]; othersPerceptionExtreme: string[] }> = {
  D: {
    selfPerception: ['Pioneering', 'Competitive', 'Positive', 'Assertive', 'Confident', 'Winner'],
    othersPerceptionModerate: ['Demanding', 'Egotistical', 'Nervy', 'Aggressive'],
    othersPerceptionExtreme: ['Abrasive', 'Arbitrary', 'Controlling', 'Opinionated'],
  },
  I: {
    selfPerception: ['Enthusiastic', 'Optimistic', 'Friendly', 'Persuasive', 'Inspiring', 'Energetic'],
    othersPerceptionModerate: ['Disorganized', 'Overly Talkative', 'Emotional', 'Unrealistic'],
    othersPerceptionExtreme: ['Manipulative', 'Superficial', 'Undisciplined', 'Reckless'],
  },
  S: {
    selfPerception: ['Patient', 'Loyal', 'Dependable', 'Calm', 'Supportive', 'Stable'],
    othersPerceptionModerate: ['Resistant', 'Indecisive', 'Passive', 'Slow'],
    othersPerceptionExtreme: ['Stubborn', 'Unresponsive', 'Inflexible', 'Unmotivated'],
  },
  C: {
    selfPerception: ['Analytical', 'Precise', 'Thorough', 'Systematic', 'Quality-focused', 'Careful'],
    othersPerceptionModerate: ['Overly Critical', 'Perfectionistic', 'Withdrawn', 'Rigid'],
    othersPerceptionExtreme: ['Pessimistic', 'Indecisive', 'Isolated', 'Stubborn'],
  },
}

interface IndividualReportViewProps {
  result: Result
}

export default function IndividualReportView({ result }: IndividualReportViewProps) {
  const router = useRouter()
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle')
  const reportContainerRef = useRef<HTMLDivElement>(null)

  const scores: CalculatedScores = {
    natural: result.natural,
    adaptive: result.adaptive,
    primaryNatural: result.primaryNatural,
    primaryAdaptive: result.primaryAdaptive,
  }

  const comparisonData = [
    { trait: 'D', name: 'Dominance', natural: scores.natural.D, adaptive: scores.adaptive.D },
    { trait: 'I', name: 'Influence', natural: scores.natural.I, adaptive: scores.adaptive.I },
    { trait: 'S', name: 'Steadiness', natural: scores.natural.S, adaptive: scores.adaptive.S },
    { trait: 'C', name: 'Conscientiousness', natural: scores.natural.C, adaptive: scores.adaptive.C },
  ]

  const radarData = [
    { trait: 'D', natural: scores.natural.D, adaptive: scores.adaptive.D, fullMark: 100 },
    { trait: 'I', natural: scores.natural.I, adaptive: scores.adaptive.I, fullMark: 100 },
    { trait: 'S', natural: scores.natural.S, adaptive: scores.adaptive.S, fullMark: 100 },
    { trait: 'C', natural: scores.natural.C, adaptive: scores.adaptive.C, fullMark: 100 },
  ]

  const shiftAnalysis = (['D', 'I', 'S', 'C'] as DISCType[]).map((type) => ({
    type,
    name: profileDescriptions[type].name,
    shift: scores.adaptive[type] - scores.natural[type],
    natural: scores.natural[type],
    adaptive: scores.adaptive[type],
    color: profileDescriptions[type].color,
  }))

  const naturalProfile = profileDescriptions[scores.primaryNatural]
  const adaptiveProfile = profileDescriptions[scores.primaryAdaptive]
  const profileShifted = scores.primaryNatural !== scores.primaryAdaptive
  const hasDrivingForces = !!result.drivingForces
  const communicationGuide = communicationGuides[scores.primaryNatural]

  const handleExportPDF = async () => {
    try {
      setPdfStatus('generating')

      // Wait a brief moment to ensure charts are fully rendered
      await new Promise((resolve) => setTimeout(resolve, 500))

      await generatePDFReport(result, scores, reportContainerRef.current)

      setPdfStatus('success')
      setTimeout(() => setPdfStatus('idle'), 3000)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      setPdfStatus('error')
      setTimeout(() => setPdfStatus('idle'), 5000)
    }
  }

  const handleBack = () => {
    // Get team code from sessionStorage or use empty string
    const teamCode = typeof window !== 'undefined' ? sessionStorage.getItem('adminTeamCode') || '' : ''
    if (teamCode) {
      router.push(`/admin?teamCode=${encodeURIComponent(teamCode)}`)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 py-4 sm:py-10 px-4">
      <div className="container max-w-5xl mx-auto">
        <div ref={reportContainerRef} className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          {/* Header with back button */}
          <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={pdfStatus === 'generating'}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {pdfStatus === 'generating' ? 'Generating PDF...' : 'Export to PDF'}
            </Button>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Assessment Results</h1>
            <p className="text-sm sm:text-base text-slate-600">
              {result.name} • {result.dept}
              {result.teamCode && ` • ${result.teamCode}`}
            </p>
            {pdfStatus === 'success' && (
              <div className="mt-4">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ PDF downloaded successfully!
                </span>
              </div>
            )}
            {pdfStatus === 'error' && (
              <div className="mt-4">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">
                  Failed to generate PDF. Please try again.
                </span>
              </div>
            )}
          </div>

          {/* Primary Types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="text-center p-4 sm:p-6 rounded-xl" style={{ backgroundColor: naturalProfile.bgColor }}>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mb-2">NATURAL STYLE</div>
              <div className="text-4xl sm:text-5xl font-bold mb-2" style={{ color: naturalProfile.color }}>
                {scores.primaryNatural}
              </div>
              <div className="text-base sm:text-lg font-semibold text-slate-800">{naturalProfile.name}</div>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">{naturalProfile.naturalDesc}</p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-dashed border-slate-300">
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mb-2">ADAPTIVE STYLE (Under Stress)</div>
              <div className="text-4xl sm:text-5xl font-bold mb-2" style={{ color: adaptiveProfile.color }}>
                {scores.primaryAdaptive}
              </div>
              <div className="text-base sm:text-lg font-semibold text-slate-800">{adaptiveProfile.name}</div>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">{adaptiveProfile.stressResponse}</p>
            </div>
          </div>

          {/* Profile Shift Alert */}
          {profileShifted && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
              <div className="text-sm sm:text-base font-semibold text-amber-800 mb-1">⚡ Profile Shift Detected</div>
              <p className="text-xs sm:text-sm text-amber-700">
                Primary style shifts from <strong>{naturalProfile.name}</strong> to <strong>{adaptiveProfile.name}</strong> under
                stress. This is common and indicates adaptation under pressure.
              </p>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-slate-50 rounded-xl p-3 sm:p-5">
              <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4 text-center">
                Natural vs Adaptive Comparison
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={comparisonData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="trait" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="natural" name="Natural" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="adaptive" name="Adaptive" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 sm:p-5">
              <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4 text-center">Profile Radar</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="trait" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="Natural" dataKey="natural" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Radar name="Adaptive" dataKey="adaptive" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shift Analysis */}
          <div className="bg-slate-50 rounded-xl p-3 sm:p-5 mb-6 sm:mb-8">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Stress Response Analysis</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {shiftAnalysis.map((item) => (
                <div key={item.type} className="text-center">
                  <div className="text-xs sm:text-sm font-medium text-slate-600 mb-1">{item.name}</div>
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm text-emerald-600 font-semibold">{item.natural}%</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-xs sm:text-sm text-orange-600 font-semibold">{item.adaptive}%</span>
                  </div>
                  <div
                    className={`text-xs font-semibold mt-1 ${
                      item.shift > 0 ? 'text-red-500' : item.shift < 0 ? 'text-blue-500' : 'text-slate-400'
                    }`}
                  >
                    {item.shift > 0 ? `+${item.shift}` : item.shift < 0 ? item.shift : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 sm:mb-8">
            <div className="bg-emerald-50 rounded-xl p-3 sm:p-4">
              <h4 className="text-sm sm:text-base font-semibold text-emerald-800 mb-3">Natural Style Scores</h4>
              <div className="space-y-2">
                {(['D', 'I', 'S', 'C'] as DISCType[]).map((type) => (
                  <div key={type} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-16 sm:w-20 text-xs sm:text-sm font-medium" style={{ color: profileDescriptions[type].color }}>
                      {profileDescriptions[type].name}
                    </div>
                    <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${scores.natural[type]}%`,
                          backgroundColor: profileDescriptions[type].color,
                        }}
                      />
                    </div>
                    <div className="w-10 sm:w-12 text-right text-xs sm:text-sm font-semibold">{scores.natural[type]}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 sm:p-4">
              <h4 className="text-sm sm:text-base font-semibold text-orange-800 mb-3">Adaptive Style Scores</h4>
              <div className="space-y-2">
                {(['D', 'I', 'S', 'C'] as DISCType[]).map((type) => (
                  <div key={type} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-16 sm:w-20 text-xs sm:text-sm font-medium" style={{ color: profileDescriptions[type].color }}>
                      {profileDescriptions[type].name}
                    </div>
                    <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${scores.adaptive[type]}%`,
                          backgroundColor: profileDescriptions[type].color,
                        }}
                      />
                    </div>
                    <div className="w-10 sm:w-12 text-right text-xs sm:text-sm font-semibold">{scores.adaptive[type]}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <div className="bg-emerald-50 rounded-lg p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-emerald-800 mb-2">💚 Natural Strengths</h3>
              <p className="text-emerald-700 text-xs sm:text-sm">{naturalProfile.naturalDesc}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {naturalProfile.traits.map((trait) => (
                  <span key={trait} className="px-2 py-1 bg-white rounded text-xs font-medium text-emerald-700">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-orange-800 mb-2">⚡ Under Stress</h3>
              <p className="text-orange-700 text-xs sm:text-sm">{adaptiveProfile.adaptiveDesc}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-blue-800 mb-2">🎯 Growth Opportunities</h3>
              <p className="text-blue-700 text-xs sm:text-sm">{naturalProfile.growth}</p>
            </div>
          </div>

          {/* Communication Guidance */}
          <div className="border-t-2 border-slate-200 pt-6 sm:pt-8 mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">How to Communicate</h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Based primarily on Natural style ({scores.primaryNatural} – {naturalProfile.name}).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-100">
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-2">Do this when communicating</h3>
                <ul className="mt-2 space-y-2 text-xs sm:text-sm text-slate-700">
                  {communicationGuide.howToCommunicate.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-[3px] text-emerald-500 flex-shrink-0">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50 rounded-xl p-3 sm:p-4 border border-rose-100">
                <h3 className="text-sm sm:text-base font-semibold text-rose-800 mb-2">Avoid this when communicating</h3>
                <ul className="mt-2 space-y-2 text-xs sm:text-sm text-rose-800">
                  {communicationGuide.howNotToCommunicate.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-[3px] text-rose-500 flex-shrink-0">✕</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200">
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-2">Self-perception</h3>
                <ul className="mt-1 space-y-2 text-xs sm:text-sm text-slate-700">
                  {communicationGuide.selfPerception.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-[3px] text-slate-400 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200">
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-2">Others' perception</h3>
                <ul className="mt-1 space-y-2 text-xs sm:text-sm text-slate-700">
                  {communicationGuide.othersPerception.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-[3px] text-slate-400 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Checklist for Communicating */}
          <div className="border-t-2 border-slate-200 pt-6 sm:pt-8 mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Checklist for Communicating</h2>
              <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4">
                Most people are aware of and sensitive to the ways with which they prefer to be communicated. Many people find
                this section to be extremely accurate and important for enhanced interpersonal communication. This page provides
                other people with a list of things to DO when communicating with {result.name}. Read each statement and identify
                the 3 or 4 statements which are most important to them.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-200">
              <h3 className="text-base sm:text-lg font-semibold text-sky-600 mb-3 sm:mb-4">Ways to Communicate:</h3>
              <ul className="space-y-2 sm:space-y-3">
                {communicationChecklists[scores.primaryNatural].waysToCommunicate.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 flex-shrink-0"
                      readOnly
                    />
                    <span className="text-xs sm:text-sm text-slate-700 flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Checklist for Communicating Continued */}
          <div className="border-t-2 border-slate-200 pt-6 sm:pt-8 mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Checklist for Communicating Continued</h2>
              <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4">
                This section of the report is a list of things NOT to do while communicating with {result.name}. Review each
                statement with {result.name} and identify those methods of communication that result in frustration or reduced
                performance.
              </p>
            </div>

            <div className="bg-rose-50 rounded-xl p-4 sm:p-6 border border-rose-200">
              <h3 className="text-base sm:text-lg font-semibold text-rose-600 mb-3 sm:mb-4">Ways NOT to Communicate:</h3>
              <ul className="space-y-2 sm:space-y-3">
                {communicationChecklists[scores.primaryNatural].waysNotToCommunicate.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500 flex-shrink-0"
                      readOnly
                    />
                    <span className="text-xs sm:text-sm text-rose-800 flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Perceptions */}
          <div className="border-t-2 border-slate-200 pt-6 sm:pt-8 mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Perceptions: See Yourself as Others See You</h2>
              <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4">
                A person's behavior and feelings may be quickly telegraphed to others. This section provides additional
                information on {result.name}'s self-perception and how, under certain conditions, others may perceive their
                behavior.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-sky-50 rounded-xl p-4 sm:p-5 border-2 border-sky-200">
                <h3 className="text-sm sm:text-base font-semibold text-sky-800 mb-2 bg-sky-100 -m-4 sm:-m-5 mb-2 p-3 rounded-t-xl">
                  Self-Perception
                </h3>
                <p className="text-xs text-slate-600 mb-3">{result.name} usually sees themselves as being:</p>
                <ul className="space-y-2">
                  {perceptionsData[scores.primaryNatural].selfPerception.map((item, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-sky-600 mt-1 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 sm:p-5 border-2 border-amber-200">
                <h3 className="text-sm sm:text-base font-semibold text-amber-800 mb-2 bg-amber-100 -m-4 sm:-m-5 mb-2 p-3 rounded-t-xl">
                  Others' Perception - Moderate
                </h3>
                <p className="text-xs text-slate-600 mb-3">Under moderate pressure, tension, stress or fatigue, others may see them as being:</p>
                <ul className="space-y-2">
                  {perceptionsData[scores.primaryNatural].othersPerceptionModerate.map((item, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-amber-600 mt-1 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 rounded-xl p-4 sm:p-5 border-2 border-red-200">
                <h3 className="text-sm sm:text-base font-semibold text-red-800 mb-2 bg-red-100 -m-4 sm:-m-5 mb-2 p-3 rounded-t-xl">
                  Others' Perception - Extreme
                </h3>
                <p className="text-xs text-slate-600 mb-3">Under extreme pressure, stress or fatigue, others may see them as being:</p>
                <ul className="space-y-2">
                  {perceptionsData[scores.primaryNatural].othersPerceptionExtreme.map((item, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-red-600 mt-1 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Driving Forces Section */}
          {hasDrivingForces && result.drivingForces && (
            <div className="border-t-2 border-slate-200 pt-6 sm:pt-8 mb-6 sm:mb-8">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Driving Forces</h2>
                <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto px-4">
                  These six scales show how strongly they lean toward each side of the core motivators that drive decisions and
                  priorities.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 sm:p-6">
                <DrivingForcesChart
                  scores={result.drivingForces.scores}
                  title="Driving Forces Profile"
                  subtitle="Higher numbers indicate a stronger pull toward that side of each motivator."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

