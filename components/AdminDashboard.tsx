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
} from 'recharts'
import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { generateAdminDashboardPDF } from '@/lib/pdfGenerator'

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

export default function AdminDashboard() {
  const router = useRouter()
  const [allResults, setAllResults] = useState<Result[]>([])
  const [insights, setInsights] = useState<{
    compatibility: Array<{ dept1: string; dept2: string; score: number; reasoning: string }>
    teamComposition: Array<{ department: string; strengths: string[]; gaps: string[]; recommendations: string[] }>
    communicationInsights: Array<{ department: string; style: string; preferences: string[]; recommendations: string[] }>
  } | null>(null)
  const [loadingResults, setLoadingResults] = useState(false)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle')
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoadingResults(true)
    fetch('/api/results')
      .then((res) => res.json())
      .then((data) => {
        setAllResults(data)
        setLoadingResults(false)
      })
      .catch((error) => {
        console.error('Failed to fetch results:', error)
        setLoadingResults(false)
      })

    setLoadingInsights(true)
    fetch('/api/insights')
      .then((res) => res.json())
      .then((data) => {
        setInsights(data)
        setLoadingInsights(false)
      })
      .catch((error) => {
        console.error('Failed to fetch insights:', error)
        setLoadingInsights(false)
      })
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

  if (allResults.length === 0 && !loadingResults) {
    return (
      <div className="min-h-screen bg-muted/20 py-10">
        <div className="container max-w-7xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Team Analytics Dashboard</h1>
                <p className="text-slate-600">No assessments yet</p>
              </div>
              <Button onClick={() => router.push('/')}>+ New Assessment</Button>
            </div>
            <div className="text-center py-20">
              <p className="text-slate-500 mb-4">No assessment results found.</p>
              <Button onClick={() => router.push('/')}>Start First Assessment</Button>
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
                {allResults.length} assessments • Natural & Adaptive Profiles
              </p>
            </div>
            <div className="flex gap-3">
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

          {/* All Results Table */}
          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-slate-800 mb-4">All Employee Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Name</th>
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
          {allResults.some((r) => r.drivingForces) && (
            <>
              <div className="border-t-2 border-slate-200 pt-8 mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Driving Forces Analytics</h2>

                {/* Driving Forces Distribution */}
                <div className="bg-slate-50 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-slate-800 mb-4">Primary Driving Forces Distribution</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {(['Knowledge', 'Utility', 'Surroundings', 'Others', 'Power', 'Methodologies'] as MotivatorType[]).map(
                      (motivator) => {
                        const resultsWithDF = allResults.filter((r) => r.drivingForces)
                        const distribution = {
                          option1: 0,
                          option2: 0,
                        }
                        resultsWithDF.forEach((r) => {
                          const primary = r.drivingForces!.primaryForces[motivator]
                          if (
                            (motivator === 'Knowledge' && primary === 'KI') ||
                            (motivator === 'Utility' && primary === 'US') ||
                            (motivator === 'Surroundings' && primary === 'SO') ||
                            (motivator === 'Others' && primary === 'OI') ||
                            (motivator === 'Power' && primary === 'PC') ||
                            (motivator === 'Methodologies' && primary === 'MR')
                          ) {
                            distribution.option1++
                          } else {
                            distribution.option2++
                          }
                        })
                        const option1Type =
                          motivator === 'Knowledge'
                            ? 'KI'
                            : motivator === 'Utility'
                              ? 'US'
                              : motivator === 'Surroundings'
                                ? 'SO'
                                : motivator === 'Others'
                                  ? 'OI'
                                  : motivator === 'Power'
                                    ? 'PC'
                                    : 'MR'
                        const option2Type =
                          motivator === 'Knowledge'
                            ? 'KN'
                            : motivator === 'Utility'
                              ? 'UR'
                              : motivator === 'Surroundings'
                                ? 'SH'
                                : motivator === 'Others'
                                  ? 'OA'
                                  : motivator === 'Power'
                                    ? 'PD'
                                    : 'MS'
                        const option1Desc = drivingForceDescriptions[option1Type as DrivingForceType]
                        const option2Desc = drivingForceDescriptions[option2Type as DrivingForceType]

                        return (
                          <div key={motivator} className="bg-white rounded-lg p-4 border">
                            <h4 className="font-semibold text-slate-700 mb-3">{motivator}</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="w-32 text-xs font-medium" style={{ color: option1Desc.color }}>
                                  {option1Desc.name}
                                </div>
                                <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${(distribution.option1 / resultsWithDF.length) * 100}%`,
                                      backgroundColor: option1Desc.color,
                                    }}
                                  />
                                </div>
                                <div className="w-12 text-right text-xs font-semibold">
                                  {distribution.option1} ({Math.round((distribution.option1 / resultsWithDF.length) * 100)}%)
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-32 text-xs font-medium" style={{ color: option2Desc.color }}>
                                  {option2Desc.name}
                                </div>
                                <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${(distribution.option2 / resultsWithDF.length) * 100}%`,
                                      backgroundColor: option2Desc.color,
                                    }}
                                  />
                                </div>
                                <div className="w-12 text-right text-xs font-semibold">
                                  {distribution.option2} ({Math.round((distribution.option2 / resultsWithDF.length) * 100)}%)
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      }
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Department Collaboration Insights */}
          {insights && (
            <>
              <div className="border-t-2 border-slate-200 pt-8 mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Department Collaboration Insights</h2>

                {/* Compatibility Matrix */}
                <div className="bg-slate-50 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-slate-800 mb-4">Department Compatibility Matrix</h3>
                  {loadingInsights ? (
                    <p className="text-slate-500">Loading compatibility analysis...</p>
                  ) : insights.compatibility.length > 0 ? (
                    <div className="space-y-4">
                      {insights.compatibility.map((comp, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-700">{comp.dept1}</span>
                              <span className="text-slate-400">↔</span>
                              <span className="font-semibold text-slate-700">{comp.dept2}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-2xl font-bold" style={{ color: comp.score >= 80 ? '#10b981' : comp.score >= 60 ? '#f59e0b' : '#ef4444' }}>
                                {comp.score}%
                              </div>
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold ${
                                comp.score >= 80 ? 'bg-emerald-500' : comp.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}>
                                {comp.score >= 80 ? '✓' : comp.score >= 60 ? '~' : '!'}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600">{comp.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">Need at least 2 departments for compatibility analysis</p>
                  )}
                </div>

                {/* Team Composition Analysis */}
                <div className="bg-slate-50 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-slate-800 mb-4">Team Composition Analysis</h3>
                  {loadingInsights ? (
                    <p className="text-slate-500">Loading team composition analysis...</p>
                  ) : insights.teamComposition.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {insights.teamComposition.map((comp, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border">
                          <h4 className="font-semibold text-slate-700 mb-3">{comp.department}</h4>
                          
                          {comp.strengths.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-emerald-700 mb-1">Strengths:</p>
                              <ul className="text-sm text-slate-600 space-y-1">
                                {comp.strengths.map((strength, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-emerald-500">✓</span>
                                    <span>{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {comp.gaps.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-amber-700 mb-1">Potential Gaps:</p>
                              <ul className="text-sm text-slate-600 space-y-1">
                                {comp.gaps.map((gap, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-amber-500">⚠</span>
                                    <span>{gap}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {comp.recommendations.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-blue-700 mb-1">Recommendations:</p>
                              <ul className="text-sm text-slate-600 space-y-1">
                                {comp.recommendations.map((rec, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-blue-500">💡</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">No team composition data available</p>
                  )}
                </div>

                {/* Communication Style Insights */}
                <div className="bg-slate-50 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-slate-800 mb-4">Communication Style Insights</h3>
                  {loadingInsights ? (
                    <p className="text-slate-500">Loading communication insights...</p>
                  ) : insights.communicationInsights.length > 0 ? (
                    <div className="space-y-4">
                      {insights.communicationInsights.map((insight, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-semibold text-slate-700">{insight.department}</h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {insight.style}
                            </span>
                          </div>

                          <div className="mb-3">
                            <p className="text-xs font-semibold text-slate-600 mb-2">Communication Preferences:</p>
                            <ul className="text-sm text-slate-600 space-y-1">
                              {insight.preferences.map((pref, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-slate-400">•</span>
                                  <span>{pref}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-purple-700 mb-2">Inter-Department Recommendations:</p>
                            <ul className="text-sm text-slate-600 space-y-1">
                              {insight.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-purple-500">→</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">No communication insights available</p>
                  )}
                </div>
              </div>
            </>
          )}

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

