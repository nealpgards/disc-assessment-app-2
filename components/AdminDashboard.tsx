'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import { Download, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { generateAdminDashboardPDF } from '@/lib/pdfGenerator'
import DrivingForcesChart from '@/components/DrivingForcesChart'

// Types
type DISCType = 'D' | 'I' | 'S' | 'C'

type DrivingForceType =
  | 'KI'
  | 'KN'
  | 'US'
  | 'UR'
  | 'SO'
  | 'SH'
  | 'OI'
  | 'OA'
  | 'PC'
  | 'PD'
  | 'MR'
  | 'MS'

type MotivatorType = 'Knowledge' | 'Utility' | 'Surroundings' | 'Others' | 'Power' | 'Methodologies'

interface Scores {
  D: number
  I: number
  S: number
  C: number
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

interface DrivingForceResult {
  scores: Record<DrivingForceType, number>
  primaryForces: Record<MotivatorType, DrivingForceType>
}

interface Result {
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

interface DrivingForceDescription {
  name: string
  fullName: string
  description: string
  traits: string[]
  color: string
  bgColor: string
}

interface CommunicationGuide {
  styleLabel: string
  howToCommunicate: string[]
  howNotToCommunicate: string[]
}

interface AdminDashboardProps {
  initialTeamCode?: string
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
    styleLabel: 'Direct, fast-paced, and results-focused',
    howToCommunicate: [
      'Lead with the bottom line, key decision, or outcome needed.',
      'Keep communication brief, clear, and focused on results and ownership.',
      'Provide options and autonomy rather than prescribing every step.',
    ],
    howNotToCommunicate: [
      'Avoid long, unfocused discussions with no clear decision.',
      'Do not be vague or indecisive about priorities and accountability.',
      'Avoid taking their directness personally or responding emotionally.',
    ],
  },
  I: {
    styleLabel: 'Enthusiastic, relational, and expressive',
    howToCommunicate: [
      'Start with connection and context before diving into details.',
      'Use collaborative discussions, stories, and examples.',
      'Offer recognition, encouragement, and visible enthusiasm.',
    ],
    howNotToCommunicate: [
      'Avoid overly formal, purely transactional communication.',
      'Do not shut down ideas too quickly without acknowledging them.',
      'Avoid isolating them with only one-way, written updates for important topics.',
    ],
  },
  S: {
    styleLabel: 'Calm, steady, and supportive',
    howToCommunicate: [
      'Provide clear expectations and allow time to process and respond.',
      'Explain how decisions will impact people, routines, and stability.',
      'Invite their input in a safe, low-pressure way.',
    ],
    howNotToCommunicate: [
      'Avoid last-minute changes and surprise demands.',
      'Do not use aggressive, confrontational, or high-pressure tactics.',
      'Avoid dismissing concerns about team morale or harmony.',
    ],
  },
  C: {
    styleLabel: 'Precise, thoughtful, and data-driven',
    howToCommunicate: [
      'Come prepared with data, structure, and clear reasoning.',
      'Give time for questions, analysis, and clarification.',
      'Be specific about standards, definitions, and processes.',
    ],
    howNotToCommunicate: [
      'Avoid vague requests, shifting expectations, or missing details.',
      'Do not pressure for instant decisions without sufficient information.',
      'Avoid taking their questions as criticism – they are seeking clarity.',
    ],
  },
}

const drivingForceDescriptions: Record<DrivingForceType, DrivingForceDescription> = {
  KI: {
    name: 'Instinctive',
    fullName: 'Knowledge - Instinctive',
    description: 'Driven by utilizing past experiences and intuition, seeking specific knowledge when necessary.',
    traits: ['Experience-based', 'Intuitive', 'Practical', 'Action-oriented'],
    color: '#7c3aed',
    bgColor: '#f3e8ff',
  },
  KN: {
    name: 'Intellectual',
    fullName: 'Knowledge - Intellectual',
    description: 'Driven by opportunities to learn, acquire knowledge, and discover truth.',
    traits: ['Curious', 'Analytical', 'Learning-focused', 'Truth-seeking'],
    color: '#6366f1',
    bgColor: '#eef2ff',
  },
  US: {
    name: 'Selfless',
    fullName: 'Utility - Selfless',
    description: 'Driven by completing tasks for the sake of completion, with little expectation of personal return.',
    traits: ['Altruistic', 'Service-oriented', 'Generous', 'Self-sacrificing'],
    color: '#059669',
    bgColor: '#d1fae5',
  },
  UR: {
    name: 'Resourceful',
    fullName: 'Utility - Resourceful',
    description: 'Driven by practical results, maximizing efficiency and returns for investments of time, talent, energy, and resources.',
    traits: ['Efficient', 'Results-driven', 'Pragmatic', 'ROI-focused'],
    color: '#0891b2',
    bgColor: '#cffafe',
  },
  SO: {
    name: 'Objective',
    fullName: 'Surroundings - Objective',
    description: 'Driven by the functionality and objectivity of surroundings.',
    traits: ['Functional', 'Practical', 'Systematic', 'Organized'],
    color: '#dc2626',
    bgColor: '#fee2e2',
  },
  SH: {
    name: 'Harmonious',
    fullName: 'Surroundings - Harmonious',
    description: 'Driven by the experience, subjective viewpoints, and balance in surroundings.',
    traits: ['Aesthetic', 'Balanced', 'Sensory-aware', 'Atmosphere-focused'],
    color: '#ea580c',
    bgColor: '#ffedd5',
  },
  OI: {
    name: 'Intentional',
    fullName: 'Others - Intentional',
    description: 'Driven to assist others for a specific purpose, not just for the sake of being helpful.',
    traits: ['Purpose-driven', 'Goal-oriented', 'Strategic', 'Outcome-focused'],
    color: '#be185d',
    bgColor: '#fce7f3',
  },
  OA: {
    name: 'Altruistic',
    fullName: 'Others - Altruistic',
    description: 'Driven by the benefits provided to others.',
    traits: ['Caring', 'Empathetic', 'Supportive', 'People-focused'],
    color: '#c2410c',
    bgColor: '#fff7ed',
  },
  PC: {
    name: 'Collaborative',
    fullName: 'Power - Collaborative',
    description: 'Driven by being in a supporting role and contributing with little need for individual recognition.',
    traits: ['Team-oriented', 'Supportive', 'Humble', 'Cooperative'],
    color: '#16a34a',
    bgColor: '#dcfce7',
  },
  PD: {
    name: 'Commanding',
    fullName: 'Power - Commanding',
    description: 'Driven by status, recognition, and control over personal freedom.',
    traits: ['Ambitious', 'Leadership-focused', 'Status-driven', 'Autonomous'],
    color: '#ca8a04',
    bgColor: '#fef9c3',
  },
  MR: {
    name: 'Receptive',
    fullName: 'Methodologies - Receptive',
    description: 'Driven by new ideas, methods, and opportunities that fall outside a defined system for living.',
    traits: ['Innovative', 'Flexible', 'Open-minded', 'Change-embracing'],
    color: '#0284c7',
    bgColor: '#e0f2fe',
  },
  MS: {
    name: 'Structured',
    fullName: 'Methodologies - Structured',
    description: 'Driven by traditional approaches, proven methods, and a defined system for living.',
    traits: ['Systematic', 'Traditional', 'Consistent', 'Process-oriented'],
    color: '#1e40af',
    bgColor: '#dbeafe',
  },
}

export default function AdminDashboard({ initialTeamCode }: AdminDashboardProps) {
  const router = useRouter()
  const [allResults, setAllResults] = useState<Result[]>([])
  const [selectedTeamCode, setSelectedTeamCode] = useState<string>(initialTeamCode || '')
  const [availableTeamCodes, setAvailableTeamCodes] = useState<string[]>([])
  const [totalResultCount, setTotalResultCount] = useState<number>(0)
  const [insights, setInsights] = useState<{
    compatibility: Array<{ dept1: string; dept2: string; score: number; reasoning: string }>
    teamComposition: Array<{ department: string; strengths: string[]; gaps: string[]; recommendations: string[] }>
    communicationInsights: Array<{ department: string; style: string; preferences: string[]; recommendations: string[] }>
    departmentCollaboration?: {
      compatibilityMatrix: Array<{ dept1: string; dept2: string; score: number; details: any }>
      profileComparisons: Array<{ dept1: string; dept2: string; comparison: any }>
      recommendations: Array<{ dept1: string; dept2: string; recommendations: any[] }>
      metadata: { departmentCount: number; totalPairs: number; available: boolean }
    }
    metadata?: {
      departmentCount: number
      totalResults: number
      compatibilityAvailable: boolean
      compatibilityReason?: string
    }
  } | null>(null)
  const [loadingResults, setLoadingResults] = useState(false)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle')
  const [resultsError, setResultsError] = useState<string | null>(null)
  const [insightsError, setInsightsError] = useState<string | null>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)

  const loadResults = async () => {
    setLoadingResults(true)
    setResultsError(null)
    try {
      // First, fetch all results to get available team codes
      const allRes = await fetch('/api/results')
      if (!allRes.ok) {
        throw new Error(`Failed to fetch results: ${allRes.status} ${allRes.statusText}`)
      }
      const allData = await allRes.json()
      setTotalResultCount(Array.isArray(allData) ? allData.length : 0)
      
      // Extract unique team codes from all results
      const teamCodes = [...new Set(allData.map((r: Result) => r.teamCode).filter(Boolean))] as string[]
      setAvailableTeamCodes(teamCodes.sort())
      
      // Then fetch filtered results if team code is selected
      const url = selectedTeamCode 
        ? `/api/results?teamCode=${encodeURIComponent(selectedTeamCode)}`
        : '/api/results'
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`Failed to fetch results: ${res.status} ${res.statusText}`)
      }
      const data = await res.json()
      setAllResults(data)
      setLoadingResults(false)
    } catch (error) {
      console.error('Failed to fetch results:', error)
      setResultsError(error instanceof Error ? error.message : 'Failed to load results. Please try refreshing.')
      setLoadingResults(false)
    }
  }

  const loadInsights = async () => {
    setLoadingInsights(true)
    setInsightsError(null)
    try {
      const res = await fetch('/api/insights')
      if (!res.ok) {
        let errorMessage = `Failed to fetch insights: ${res.status} ${res.statusText}`
        try {
          const errorData = await res.json()
          if (errorData && (errorData.error || errorData.details)) {
            errorMessage = errorData.error || errorData.details
          }
        } catch {
          // Ignore JSON parse errors and use generic message
        }
        throw new Error(errorMessage)
      }
      const data = await res.json()
      
      console.log('Insights API response:', {
        status: res.status,
        ok: res.ok,
        data: data,
        compatibility: data.compatibility?.length || 0,
        teamComposition: data.teamComposition?.length || 0,
        communicationInsights: data.communicationInsights?.length || 0,
        metadata: data.metadata,
      })
      
      // Ensure we have the expected structure
      const insightsData = {
        compatibility: Array.isArray(data.compatibility) ? data.compatibility : [],
        teamComposition: Array.isArray(data.teamComposition) ? data.teamComposition : [],
        communicationInsights: Array.isArray(data.communicationInsights) ? data.communicationInsights : [],
        departmentCollaboration: data.departmentCollaboration || undefined,
        metadata: data.metadata || {
          departmentCount: 0,
          totalResults: 0,
          compatibilityAvailable: false,
          compatibilityReason: 'No metadata available',
        },
      }
      
      console.log('Processed insights data:', insightsData)
      setInsights(insightsData)
      setLoadingInsights(false)
    } catch (error) {
      console.error('Failed to fetch insights:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load insights. Please try refreshing.'
      setInsightsError(errorMessage)
      setLoadingInsights(false)
      
      // Set empty insights on error so UI doesn't break
      setInsights({
        compatibility: [],
        teamComposition: [],
        communicationInsights: [],
        departmentCollaboration: undefined,
        metadata: {
          departmentCount: 0,
          totalResults: 0,
          compatibilityAvailable: false,
          compatibilityReason: errorMessage,
        },
      })
    }
  }

  const refreshData = () => {
    loadResults()
    loadInsights()
  }

  useEffect(() => {
    loadResults()
    loadInsights()
  }, [selectedTeamCode]) // Reload when team code changes

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      refreshData()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleExportPDF = async () => {
    try {
      setPdfStatus('generating')

      // Wait a brief moment to ensure charts are fully rendered
      await new Promise((resolve) => setTimeout(resolve, 500))

      await generateAdminDashboardPDF(
        allResults,
        insights,
        {
          teamNaturalDist: (['D', 'I', 'S', 'C'] as DISCType[]).map((type) => ({
            name: type,
            fullName: profileDescriptions[type].name,
            natural: allResults.filter((r) => r.primaryNatural === type).length,
            adaptive: allResults.filter((r) => r.primaryAdaptive === type).length,
            fill: profileDescriptions[type].color,
          })),
          avgByDept: [...new Set(allResults.map((r) => r.dept))].map((dept) => {
            const deptResults = allResults.filter((r) => r.dept === dept)
            const avg = (key: 'natural' | 'adaptive', subKey: DISCType) =>
              Math.round(deptResults.reduce((sum, r) => sum + r[key][subKey], 0) / deptResults.length)
            return {
              dept,
              count: deptResults.length,
              D_nat: avg('natural', 'D'),
              I_nat: avg('natural', 'I'),
              S_nat: avg('natural', 'S'),
              C_nat: avg('natural', 'C'),
              D_adp: avg('adaptive', 'D'),
              I_adp: avg('adaptive', 'I'),
              S_adp: avg('adaptive', 'S'),
              C_adp: avg('adaptive', 'C'),
            }
          }),
          shifters: allResults.filter((r) => r.primaryNatural !== r.primaryAdaptive),
        },
        dashboardRef.current
      )

      setPdfStatus('success')
      setTimeout(() => setPdfStatus('idle'), 3000)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      setPdfStatus('error')
      setTimeout(() => setPdfStatus('idle'), 5000)
    }
  }

  if (loadingResults) {
    return (
      <div className="min-h-screen bg-muted/20 py-10">
        <div className="container max-w-7xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center py-20">
              <p className="text-slate-600">Loading team analytics...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const teamNaturalDist = (['D', 'I', 'S', 'C'] as DISCType[]).map((type) => ({
    name: type,
    fullName: profileDescriptions[type].name,
    natural: allResults.filter((r) => r.primaryNatural === type).length,
    adaptive: allResults.filter((r) => r.primaryAdaptive === type).length,
    fill: profileDescriptions[type].color,
  }))

  const avgByDept = [...new Set(allResults.map((r) => r.dept))].map((dept) => {
    const deptResults = allResults.filter((r) => r.dept === dept)
    const avg = (key: 'natural' | 'adaptive', subKey: DISCType) =>
      Math.round(deptResults.reduce((sum, r) => sum + r[key][subKey], 0) / deptResults.length)
    return {
      dept,
      count: deptResults.length,
      D_nat: avg('natural', 'D'),
      I_nat: avg('natural', 'I'),
      S_nat: avg('natural', 'S'),
      C_nat: avg('natural', 'C'),
      D_adp: avg('adaptive', 'D'),
      I_adp: avg('adaptive', 'I'),
      S_adp: avg('adaptive', 'S'),
      C_adp: avg('adaptive', 'C'),
    }
  })

  const shifters = allResults.filter((r) => r.primaryNatural !== r.primaryAdaptive)
  const departmentCollaboration = insights?.departmentCollaboration

  const hasDrivingForces = allResults.some((r) => r.drivingForces)
  const aggregatedDrivingForcesScores = hasDrivingForces
    ? allResults
        .filter((r) => r.drivingForces && r.drivingForces.scores)
        .reduce<Record<string, number>>((acc, result) => {
          const scores = result.drivingForces!.scores
          Object.entries(scores).forEach(([key, value]) => {
            acc[key] = (acc[key] || 0) + (value || 0)
          })
          return acc
        }, {})
    : null

  if (!loadingResults && allResults.length === 0) {
    const hasAnyResults = totalResultCount > 0

    return (
      <div className="min-h-screen bg-muted/20 py-10">
        <div className="container max-w-7xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Team Analytics Dashboard</h1>
                <p className="text-slate-600">
                  {hasAnyResults
                    ? selectedTeamCode
                      ? `No assessments found for team ${selectedTeamCode}.`
                      : 'No assessments found for the current filter.'
                    : 'No assessments yet'}
                </p>
              </div>
              <Button onClick={() => router.push('/')}>+ New Assessment</Button>
            </div>
            <div className="text-center py-20">
              <p className="text-slate-500 mb-4">
                {hasAnyResults && selectedTeamCode
                  ? `We found ${totalResultCount} assessment${totalResultCount === 1 ? '' : 's'} overall, but none for team ${selectedTeamCode}.`
                  : 'No assessment results found.'}
              </p>
              {hasAnyResults ? (
                <div className="flex flex-col items-center gap-3">
                  <Button variant="outline" onClick={() => setSelectedTeamCode('')}>
                    View all teams
                  </Button>
                  <p className="text-xs text-slate-500">
                    Double-check the team code used in the assessment (for example, DTG01) or clear the filter to see all
                    results.
                  </p>
                </div>
              ) : (
                <Button onClick={() => router.push('/')}>Start First Assessment</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={dashboardRef} className="min-h-screen bg-muted/20 py-10">
      <div className="container max-w-7xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Team Analytics Dashboard</h1>
              <p className="text-slate-600">
                {allResults.length} assessments {selectedTeamCode ? `for team ${selectedTeamCode}` : '(all teams)'} • Natural & Adaptive Profiles
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <select
                  value={selectedTeamCode}
                  onChange={(e) => setSelectedTeamCode(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All Teams</option>
                  {availableTeamCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                onClick={refreshData}
                disabled={loadingResults || loadingInsights}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loadingResults || loadingInsights ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPDF}
                disabled={pdfStatus === 'generating'}
              >
                <Download className="mr-2 h-4 w-4" />
                {pdfStatus === 'generating' ? 'Generating PDF...' : 'Export to PDF'}
              </Button>
              <Button onClick={() => router.push('/')}>+ New Assessment</Button>
            </div>
          </div>

          {pdfStatus === 'success' && (
            <div className="mb-4 text-center">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✓ PDF downloaded successfully!
              </span>
            </div>
          )}
          {pdfStatus === 'error' && (
            <div className="mb-4 text-center">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">
                Failed to generate PDF. Please try again.
              </span>
            </div>
          )}

          {resultsError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-800 mb-1">Error Loading Results</p>
              <p className="text-sm text-red-700">{resultsError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadResults}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          )}

          {insightsError && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-semibold text-amber-800 mb-1">Error Loading Insights</p>
              <p className="text-sm text-amber-700">{insightsError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadInsights}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Team Distribution */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="font-semibold text-slate-800 mb-4">
                Primary Type Distribution (Natural vs Adaptive)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={teamNaturalDist} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="natural" name="Natural Primary" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="adaptive" name="Adaptive Primary" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Profile Shifters</h3>
              {shifters.length > 0 ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {shifters.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="font-medium text-slate-700">{r.name}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-1 rounded text-white text-sm font-semibold"
                          style={{ backgroundColor: profileDescriptions[r.primaryNatural].color }}
                        >
                          {r.primaryNatural}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span
                          className="px-2 py-1 rounded text-white text-sm font-semibold"
                          style={{ backgroundColor: profileDescriptions[r.primaryAdaptive].color }}
                        >
                          {r.primaryAdaptive}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No profile shifters detected</p>
              )}
              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-700">
                  <strong>
                    {shifters.length} of {allResults.length}
                  </strong>{' '}
                  employees ({Math.round((shifters.length / allResults.length) * 100)}%) shift their primary
                  DISC type under stress
                </p>
              </div>
            </div>
          </div>

          {/* Department Analysis */}
          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-slate-800 mb-4">Department Average Scores</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Department</th>
                    <th className="text-center py-3 px-2 font-semibold text-slate-500">#</th>
                    <th
                      colSpan={4}
                      className="text-center py-3 px-2 font-semibold text-emerald-700 bg-emerald-50"
                    >
                      Natural
                    </th>
                    <th
                      colSpan={4}
                      className="text-center py-3 px-2 font-semibold text-orange-700 bg-orange-50"
                    >
                      Adaptive
                    </th>
                  </tr>
                  <tr className="border-b border-slate-100 text-xs">
                    <th></th>
                    <th></th>
                    <th className="py-2 text-center bg-emerald-50" style={{ color: profileDescriptions.D.color }}>
                      D
                    </th>
                    <th className="py-2 text-center bg-emerald-50" style={{ color: profileDescriptions.I.color }}>
                      I
                    </th>
                    <th className="py-2 text-center bg-emerald-50" style={{ color: profileDescriptions.S.color }}>
                      S
                    </th>
                    <th className="py-2 text-center bg-emerald-50" style={{ color: profileDescriptions.C.color }}>
                      C
                    </th>
                    <th className="py-2 text-center bg-orange-50" style={{ color: profileDescriptions.D.color }}>
                      D
                    </th>
                    <th className="py-2 text-center bg-orange-50" style={{ color: profileDescriptions.I.color }}>
                      I
                    </th>
                    <th className="py-2 text-center bg-orange-50" style={{ color: profileDescriptions.S.color }}>
                      S
                    </th>
                    <th className="py-2 text-center bg-orange-50" style={{ color: profileDescriptions.C.color }}>
                      C
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {avgByDept.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-100">
                      <td className="py-3 px-3 font-medium">{row.dept}</td>
                      <td className="py-3 px-2 text-center text-slate-500">{row.count}</td>
                      <td className="py-3 px-2 text-center bg-emerald-50/50">{row.D_nat}%</td>
                      <td className="py-3 px-2 text-center bg-emerald-50/50">{row.I_nat}%</td>
                      <td className="py-3 px-2 text-center bg-emerald-50/50">{row.S_nat}%</td>
                      <td className="py-3 px-2 text-center bg-emerald-50/50">{row.C_nat}%</td>
                      <td className="py-3 px-2 text-center bg-orange-50/50">{row.D_adp}%</td>
                      <td className="py-3 px-2 text-center bg-orange-50/50">{row.I_adp}%</td>
                      <td className="py-3 px-2 text-center bg-orange-50/50">{row.S_adp}%</td>
                      <td className="py-3 px-2 text-center bg-orange-50/50">{row.C_adp}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Communication Styles */}
          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-slate-800 mb-2">How Your Team Likes to Communicate</h3>
            <p className="text-slate-600 text-sm mb-4">
              Based on each person&apos;s Natural DISC style. Use this view to tailor meetings, feedback, and messaging.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={(['D', 'I', 'S', 'C'] as DISCType[]).map((type) => ({
                      type,
                      label: communicationGuides[type].styleLabel,
                      count: allResults.filter((r) => r.primaryNatural === type).length,
                      fill: profileDescriptions[type].color,
                    }))}
                    barGap={6}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value, _name, props) => [
                        value,
                        (props && 'label' in props.payload ? props.payload.label : 'Style') as string,
                      ]}
                    />
                    <Bar dataKey="count" name="People" radius={[4, 4, 0, 0]}>
                      {(['D', 'I', 'S', 'C'] as DISCType[]).map((type) => (
                        <Cell key={type} fill={profileDescriptions[type].color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {(['D', 'I', 'S', 'C'] as DISCType[]).map((type) => {
                  const count = allResults.filter((r) => r.primaryNatural === type).length
                  const guide = communicationGuides[type]
                  return (
                    <div key={type} className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white"
                            style={{ backgroundColor: profileDescriptions[type].color }}
                          >
                            {type}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {profileDescriptions[type].name}
                            </p>
                            <p className="text-xs text-slate-500">{guide.styleLabel}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          {count} {count === 1 ? 'person' : 'people'}
                        </span>
                      </div>
                      <ul className="mt-1 space-y-1 text-xs text-slate-600">
                        {guide.howToCommunicate.slice(0, 2).map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="mt-[2px] text-emerald-500">✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* All Results Table */}
          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-slate-800 mb-4">All Employee Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Name</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Team Code</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Dept</th>
                    <th className="text-center py-3 px-2 font-semibold text-emerald-700">Natural</th>
                    <th className="text-center py-3 px-2 font-semibold text-orange-700">Adaptive</th>
                    <th className="text-center py-3 px-2 font-semibold text-slate-500">Shift?</th>
                    <th className="text-center py-3 px-2" style={{ color: profileDescriptions.D.color }}>
                      D
                    </th>
                    <th className="text-center py-3 px-2" style={{ color: profileDescriptions.I.color }}>
                      I
                    </th>
                    <th className="text-center py-3 px-2" style={{ color: profileDescriptions.S.color }}>
                      S
                    </th>
                    <th className="text-center py-3 px-2" style={{ color: profileDescriptions.C.color }}>
                      C
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allResults.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-100">
                      <td className="py-3 px-3 font-medium">{r.name}</td>
                      <td className="py-3 px-3">
                        {r.teamCode ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            {r.teamCode}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3">{r.dept}</td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className="px-2 py-1 rounded text-white text-xs font-bold"
                          style={{ backgroundColor: profileDescriptions[r.primaryNatural].color }}
                        >
                          {r.primaryNatural}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className="px-2 py-1 rounded text-white text-xs font-bold"
                          style={{ backgroundColor: profileDescriptions[r.primaryAdaptive].color }}
                        >
                          {r.primaryAdaptive}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {r.primaryNatural !== r.primaryAdaptive ? '⚡' : '—'}
                      </td>
                      <td className="py-3 px-2 text-center text-xs">
                        <span className="text-emerald-600">{r.natural.D}</span>/
                        <span className="text-orange-600">{r.adaptive.D}</span>
                      </td>
                      <td className="py-3 px-2 text-center text-xs">
                        <span className="text-emerald-600">{r.natural.I}</span>/
                        <span className="text-orange-600">{r.adaptive.I}</span>
                      </td>
                      <td className="py-3 px-2 text-center text-xs">
                        <span className="text-emerald-600">{r.natural.S}</span>/
                        <span className="text-orange-600">{r.adaptive.S}</span>
                      </td>
                      <td className="py-3 px-2 text-center text-xs">
                        <span className="text-emerald-600">{r.natural.C}</span>/
                        <span className="text-orange-600">{r.adaptive.C}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Driving Forces Analytics */}
          {hasDrivingForces && aggregatedDrivingForcesScores && (
            <div className="border-t-2 border-slate-200 pt-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Team Driving Forces Profile</h2>
              <p className="text-slate-600 text-sm mb-6 max-w-3xl">
                Aggregated Driving Forces scores across all employees with Driving Forces data, showing where your team
                collectively leans on each motivator pair.
              </p>
              <div className="bg-slate-50 rounded-xl p-6">
                <DrivingForcesChart
                  scores={aggregatedDrivingForcesScores}
                  title="Driving Forces (Team View)"
                  subtitle="Each row shows your team’s relative pull toward each side of the motivator."
                />
              </div>
            </div>
          )}

          {/* Department Collaboration Analysis */}
          <div className="border-t-2 border-slate-200 pt-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Department Collaboration Analysis</h2>
            
            {loadingInsights && (
              <div className="bg-slate-50 rounded-xl p-6 mb-8">
                <p className="text-slate-500 text-center py-8">Loading department collaboration analysis...</p>
              </div>
            )}

            {!loadingInsights && !departmentCollaboration && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-amber-800 mb-1">Analysis Not Available</p>
                <p className="text-sm text-amber-700">
                  {insights?.metadata?.departmentCount === 0
                    ? 'No department data available. Complete assessments to see collaboration analysis.'
                    : insights?.metadata?.departmentCount === 1
                      ? 'Need at least 2 departments with results to analyze collaboration.'
                      : 'Department collaboration data has not been loaded. Click refresh to load analysis.'}
                </p>
              </div>
            )}

            {!loadingInsights && departmentCollaboration && (
              <>
                {!departmentCollaboration.metadata?.available ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-blue-800 mb-1">Insufficient Data</p>
                    <p className="text-sm text-blue-700">
                      Need at least 2 departments with results to analyze collaboration. Currently have{' '}
                      {departmentCollaboration.metadata?.departmentCount || 0} department(s).
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Tab Navigation */}
                    <div className="flex gap-2 mb-6 border-b border-slate-200">
                      <button
                        className="px-4 py-2 font-medium text-sm border-b-2 border-blue-500 text-blue-600"
                        onClick={() => {}}
                      >
                        Compatibility Matrix
                      </button>
                    </div>

                    {/* Compatibility Matrix Heatmap */}
                    <div className="bg-slate-50 rounded-xl p-6 mb-8">
                      <h3 className="font-semibold text-slate-800 mb-4">Compatibility Matrix</h3>
                      {departmentCollaboration.compatibilityMatrix &&
                      Array.isArray(departmentCollaboration.compatibilityMatrix) &&
                      departmentCollaboration.compatibilityMatrix.length > 0 ? (
                        <div className="space-y-4">
                          {/* Heatmap Grid */}
                          <div className="bg-white rounded-lg p-4 border border-slate-200 overflow-x-auto">
                            <div className="min-w-[600px]">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr>
                                    <th className="text-left py-2 px-3 font-semibold text-slate-700"></th>
                                    {Array.from(
                                      new Set(
                                        departmentCollaboration.compatibilityMatrix.flatMap((m) => [
                                          m.dept1,
                                          m.dept2,
                                        ])
                                      )
                                    )
                                      .sort()
                                      .map((dept) => (
                                        <th
                                          key={dept}
                                          className="text-center py-2 px-2 font-semibold text-slate-700 text-xs"
                                        >
                                          {dept}
                                        </th>
                                      ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {Array.from(
                                    new Set(
                                      departmentCollaboration.compatibilityMatrix.flatMap((m) => [
                                        m.dept1,
                                        m.dept2,
                                      ])
                                    )
                                  )
                                    .sort()
                                    .map((dept1) => (
                                      <tr key={dept1}>
                                        <td className="py-2 px-3 font-medium text-slate-700 text-xs">{dept1}</td>
                                        {Array.from(
                                          new Set(
                                            departmentCollaboration.compatibilityMatrix.flatMap((m) => [
                                              m.dept1,
                                              m.dept2,
                                            ])
                                          )
                                        )
                                          .sort()
                                          .map((dept2) => {
                                            if (dept1 === dept2) {
                                              return (
                                                <td key={dept2} className="py-2 px-2 text-center">
                                                  <div className="w-12 h-12 rounded bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold">
                                                    —
                                                  </div>
                                                </td>
                                              )
                                            }
                                            const entry = departmentCollaboration.compatibilityMatrix.find(
                                              (m) =>
                                                (m.dept1 === dept1 && m.dept2 === dept2) ||
                                                (m.dept1 === dept2 && m.dept2 === dept1)
                                            )
                                            if (!entry) {
                                              return (
                                                <td key={dept2} className="py-2 px-2 text-center">
                                                  <div className="w-12 h-12 rounded bg-slate-100"></div>
                                                </td>
                                              )
                                            }
                                            const colorClass =
                                              entry.score >= 80
                                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                                : entry.score >= 60
                                                  ? 'bg-amber-500 hover:bg-amber-600'
                                                  : 'bg-red-500 hover:bg-red-600'
                                            return (
                                              <td key={dept2} className="py-2 px-2 text-center">
                                                <div
                                                  className={`w-12 h-12 rounded ${colorClass} flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-colors`}
                                                  title={`${entry.dept1} ↔ ${entry.dept2}: ${entry.score}% - ${entry.details.reasoning}`}
                                                >
                                                  {entry.score}
                                                </div>
                                              </td>
                                            )
                                          })}
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Detailed List */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-slate-700 text-sm">Detailed Compatibility Scores</h4>
                            {departmentCollaboration.compatibilityMatrix
                              .sort((a, b) => b.score - a.score)
                              .map((entry, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold text-slate-700">{entry.dept1}</span>
                                      <span className="text-slate-400">↔</span>
                                      <span className="font-semibold text-slate-700">{entry.dept2}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="text-2xl font-bold"
                                        style={{
                                          color:
                                            entry.score >= 80 ? '#10b981' : entry.score >= 60 ? '#f59e0b' : '#ef4444',
                                        }}
                                      >
                                        {entry.score}%
                                      </div>
                                      <div
                                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold ${
                                          entry.score >= 80
                                            ? 'bg-emerald-500'
                                            : entry.score >= 60
                                              ? 'bg-amber-500'
                                              : 'bg-red-500'
                                        }`}
                                      >
                                        {entry.score >= 80 ? '✓' : entry.score >= 60 ? '~' : '!'}
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-sm text-slate-600 mb-2">{entry.details.reasoning}</p>
                                  <div className="flex gap-4 text-xs text-slate-500">
                                    <span>
                                      Natural: {entry.details.primaryType1} ↔ {entry.details.primaryType2} (
                                      {entry.details.naturalCompatibility}%)
                                    </span>
                                    <span>
                                      Adaptive: {entry.details.adaptiveCompatibility}% | Diff:{' '}
                                      {entry.details.scoreDifference}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-700">No compatibility data available.</p>
                        </div>
                      )}
                    </div>

                    {/* Profile Comparisons */}
                    <div className="bg-slate-50 rounded-xl p-6 mb-8">
                      <h3 className="font-semibold text-slate-800 mb-4">Department Profile Comparisons</h3>
                      {departmentCollaboration.profileComparisons &&
                      Array.isArray(departmentCollaboration.profileComparisons) &&
                      departmentCollaboration.profileComparisons.length > 0 ? (
                        <div className="space-y-6">
                          {departmentCollaboration.profileComparisons.map((comp, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-slate-700">
                                  {comp.dept1} vs {comp.dept2}
                                </h4>
                                <div className="flex gap-2">
                                  <span
                                    className="px-3 py-1 rounded text-white text-sm font-bold"
                                    style={{
                                      backgroundColor:
                                        profileDescriptions[comp.comparison.natural.primaryType1 as DISCType].color,
                                    }}
                                  >
                                    {comp.comparison.natural.primaryType1}
                                  </span>
                                  <span className="text-slate-400">vs</span>
                                  <span
                                    className="px-3 py-1 rounded text-white text-sm font-bold"
                                    style={{
                                      backgroundColor:
                                        profileDescriptions[comp.comparison.natural.primaryType2 as DISCType].color,
                                    }}
                                  >
                                    {comp.comparison.natural.primaryType2}
                                  </span>
                                </div>
                              </div>

                              <p className="text-sm text-slate-600 mb-4">{comp.comparison.summary}</p>

                              {/* Natural Profile Comparison Chart */}
                              <div className="mb-6">
                                <h5 className="text-sm font-semibold text-emerald-700 mb-3">Natural Profiles</h5>
                                <ResponsiveContainer width="100%" height={200}>
                                  <BarChart data={[
                                    {
                                      type: 'D',
                                      dept1: comp.comparison.natural.dept1Scores.D,
                                      dept2: comp.comparison.natural.dept2Scores.D,
                                    },
                                    {
                                      type: 'I',
                                      dept1: comp.comparison.natural.dept1Scores.I,
                                      dept2: comp.comparison.natural.dept2Scores.I,
                                    },
                                    {
                                      type: 'S',
                                      dept1: comp.comparison.natural.dept1Scores.S,
                                      dept2: comp.comparison.natural.dept2Scores.S,
                                    },
                                    {
                                      type: 'C',
                                      dept1: comp.comparison.natural.dept1Scores.C,
                                      dept2: comp.comparison.natural.dept2Scores.C,
                                    },
                                  ]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="dept1" name={comp.dept1} fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="dept2" name={comp.dept2} fill="#f97316" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>

                              {/* Adaptive Profile Comparison Chart */}
                              <div>
                                <h5 className="text-sm font-semibold text-orange-700 mb-3">Adaptive Profiles</h5>
                                <ResponsiveContainer width="100%" height={200}>
                                  <BarChart data={[
                                    {
                                      type: 'D',
                                      dept1: comp.comparison.adaptive.dept1Scores.D,
                                      dept2: comp.comparison.adaptive.dept2Scores.D,
                                    },
                                    {
                                      type: 'I',
                                      dept1: comp.comparison.adaptive.dept1Scores.I,
                                      dept2: comp.comparison.adaptive.dept2Scores.I,
                                    },
                                    {
                                      type: 'S',
                                      dept1: comp.comparison.adaptive.dept1Scores.S,
                                      dept2: comp.comparison.adaptive.dept2Scores.S,
                                    },
                                    {
                                      type: 'C',
                                      dept1: comp.comparison.adaptive.dept1Scores.C,
                                      dept2: comp.comparison.adaptive.dept2Scores.C,
                                    },
                                  ]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="dept1" name={comp.dept1} fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="dept2" name={comp.dept2} fill="#f97316" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-700">No profile comparison data available.</p>
                        </div>
                      )}
                    </div>

                    {/* Collaboration Recommendations */}
                    <div className="bg-slate-50 rounded-xl p-6 mb-8">
                      <h3 className="font-semibold text-slate-800 mb-4">Collaboration Recommendations</h3>
                      {departmentCollaboration.recommendations &&
                      Array.isArray(departmentCollaboration.recommendations) &&
                      departmentCollaboration.recommendations.length > 0 ? (
                        <div className="space-y-4">
                          {departmentCollaboration.recommendations.map((rec, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
                              <div className="flex items-center gap-3 mb-4">
                                <h4 className="font-semibold text-slate-700">
                                  {rec.dept1} ↔ {rec.dept2}
                                </h4>
                              </div>
                              <div className="space-y-3">
                                {rec.recommendations
                                  .sort((a, b) => {
                                    const priorityOrder: Record<'high' | 'medium' | 'low', number> = {
                                      high: 0,
                                      medium: 1,
                                      low: 2,
                                    }
                                    const aPriority = a.priority as 'high' | 'medium' | 'low'
                                    const bPriority = b.priority as 'high' | 'medium' | 'low'
                                    return priorityOrder[aPriority] - priorityOrder[bPriority]
                                  })
                                  .map((recommendation, i) => (
                                    <div
                                      key={i}
                                      className={`p-3 rounded-lg border-l-4 ${
                                        recommendation.priority === 'high'
                                          ? 'bg-red-50 border-red-500'
                                          : recommendation.priority === 'medium'
                                            ? 'bg-amber-50 border-amber-500'
                                            : 'bg-blue-50 border-blue-500'
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <span
                                          className={`text-xs font-semibold px-2 py-1 rounded ${
                                            recommendation.priority === 'high'
                                              ? 'bg-red-100 text-red-700'
                                              : recommendation.priority === 'medium'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-blue-100 text-blue-700'
                                          }`}
                                        >
                                          {recommendation.priority.toUpperCase()}
                                        </span>
                                        <span
                                          className={`text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600`}
                                        >
                                          {recommendation.category}
                                        </span>
                                      </div>
                                      <p className="text-sm text-slate-700 mt-2">{recommendation.text}</p>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-700">No recommendations available.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Export */}
          <div className="bg-blue-50 rounded-xl p-5">
            <h3 className="font-semibold text-blue-800 mb-2">Export Data</h3>
            <p className="text-blue-700 text-sm mb-3">Copy this JSON for Notion import or further analysis:</p>
            <textarea
              readOnly
              className="w-full h-32 p-3 text-xs font-mono bg-white border border-blue-200 rounded-lg"
              value={JSON.stringify(
                allResults.map((r) => ({
                  name: r.name,
                  email: r.email || '',
                  department: r.dept,
                  date: r.date,
                  natural_primary: r.primaryNatural,
                  adaptive_primary: r.primaryAdaptive,
                  profile_shifts: r.primaryNatural !== r.primaryAdaptive,
                  natural_D: r.natural.D,
                  natural_I: r.natural.I,
                  natural_S: r.natural.S,
                  natural_C: r.natural.C,
                  adaptive_D: r.adaptive.D,
                  adaptive_I: r.adaptive.I,
                  adaptive_S: r.adaptive.S,
                  adaptive_C: r.adaptive.C,
                  ...(r.drivingForces
                    ? {
                        driving_forces_knowledge: r.drivingForces.primaryForces.Knowledge,
                        driving_forces_utility: r.drivingForces.primaryForces.Utility,
                        driving_forces_surroundings: r.drivingForces.primaryForces.Surroundings,
                        driving_forces_others: r.drivingForces.primaryForces.Others,
                        driving_forces_power: r.drivingForces.primaryForces.Power,
                        driving_forces_methodologies: r.drivingForces.primaryForces.Methodologies,
                      }
                    : {}),
                })),
                null,
                2
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

