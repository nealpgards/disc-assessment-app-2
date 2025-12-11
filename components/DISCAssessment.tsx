'use client'

import React, { useState } from 'react'
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

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Types
type DISCType = 'D' | 'I' | 'S' | 'C'

interface QuestionOption {
  text: string
  type: DISCType
}

interface Question {
  id: number
  prompt: string
  options: QuestionOption[]
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

interface Result {
  name: string
  email?: string
  dept: string
  natural: Scores
  adaptive: Scores
  primaryNatural: DISCType
  primaryAdaptive: DISCType
  date: string
}

interface Answer {
  most: DISCType
  least: DISCType
}

// DISC Assessment Questions
const questions: Question[] = [
  {
    id: 1,
    prompt: 'When approaching a new project...',
    options: [
      { text: 'I take charge and drive toward results quickly', type: 'D' },
      { text: 'I get excited and share ideas with everyone', type: 'I' },
      { text: 'I prefer to understand the process and work steadily', type: 'S' },
      { text: 'I research thoroughly before taking any action', type: 'C' },
    ],
  },
  {
    id: 2,
    prompt: 'In team discussions, I typically...',
    options: [
      { text: 'Push for quick decisions and action', type: 'D' },
      { text: 'Encourage participation and keep energy high', type: 'I' },
      { text: "Listen carefully and support others' contributions", type: 'S' },
      { text: 'Ask detailed questions to ensure accuracy', type: 'C' },
    ],
  },
  {
    id: 3,
    prompt: 'When communicating with others...',
    options: [
      { text: "I'm direct, brief, and focused on outcomes", type: 'D' },
      { text: "I'm enthusiastic, expressive, and persuasive", type: 'I' },
      { text: "I'm warm, patient, and encouraging", type: 'S' },
      { text: "I'm precise, logical, and fact-based", type: 'C' },
    ],
  },
  {
    id: 4,
    prompt: 'I feel most energized when...',
    options: [
      { text: 'Overcoming challenges and achieving big goals', type: 'D' },
      { text: 'Collaborating with others and being recognized', type: 'I' },
      { text: 'Working in a stable, harmonious environment', type: 'S' },
      { text: 'Solving complex problems with precision', type: 'C' },
    ],
  },
  {
    id: 5,
    prompt: 'When making decisions...',
    options: [
      { text: 'I decide quickly and move forward', type: 'D' },
      { text: 'I consider how it affects people and relationships', type: 'I' },
      { text: 'I take time to ensure everyone is comfortable', type: 'S' },
      { text: 'I analyze all data before committing', type: 'C' },
    ],
  },
  {
    id: 6,
    prompt: 'Others would describe me as...',
    options: [
      { text: 'Competitive, determined, and results-driven', type: 'D' },
      { text: 'Optimistic, inspiring, and people-oriented', type: 'I' },
      { text: 'Reliable, patient, and easy-going', type: 'S' },
      { text: 'Analytical, careful, and quality-focused', type: 'C' },
    ],
  },
  {
    id: 7,
    prompt: 'My approach to rules and procedures is...',
    options: [
      { text: "Rules are guidelines - I'll bend them to get results", type: 'D' },
      { text: "Rules shouldn't block creativity or relationships", type: 'I' },
      { text: 'Rules provide helpful structure and stability', type: 'S' },
      { text: 'Rules exist for good reasons and should be followed', type: 'C' },
    ],
  },
  {
    id: 8,
    prompt: "When there's conflict...",
    options: [
      { text: 'I address it directly and push for resolution', type: 'D' },
      { text: 'I try to smooth things over and find common ground', type: 'I' },
      { text: 'I avoid confrontation and wait for things to settle', type: 'S' },
      { text: 'I analyze the facts to find the objectively right answer', type: 'C' },
    ],
  },
  {
    id: 9,
    prompt: "I'm most motivated by...",
    options: [
      { text: 'Authority, challenges, and winning', type: 'D' },
      { text: 'Recognition, variety, and social interaction', type: 'I' },
      { text: 'Security, appreciation, and teamwork', type: 'S' },
      { text: 'Expertise, accuracy, and quality standards', type: 'C' },
    ],
  },
  {
    id: 10,
    prompt: 'My biggest concern at work is...',
    options: [
      { text: 'Losing control or being taken advantage of', type: 'D' },
      { text: 'Being rejected or losing social approval', type: 'I' },
      { text: 'Sudden change or loss of stability', type: 'S' },
      { text: 'Being criticized for mistakes or poor quality', type: 'C' },
    ],
  },
  {
    id: 11,
    prompt: 'When learning something new...',
    options: [
      { text: 'I jump in and learn through trial and error', type: 'D' },
      { text: 'I prefer learning with others through discussion', type: 'I' },
      { text: 'I take my time and learn at a steady pace', type: 'S' },
      { text: 'I study the material thoroughly before attempting it', type: 'C' },
    ],
  },
  {
    id: 12,
    prompt: 'My ideal work environment is...',
    options: [
      { text: 'Fast-paced with autonomy and advancement opportunities', type: 'D' },
      { text: 'Collaborative, creative, and socially engaging', type: 'I' },
      { text: 'Stable, friendly, and predictable', type: 'S' },
      { text: 'Organized, structured, and focused on quality', type: 'C' },
    ],
  },
  {
    id: 13,
    prompt: 'When giving feedback to others...',
    options: [
      { text: "I'm direct and focus on what needs to improve", type: 'D' },
      { text: "I'm encouraging and emphasize the positives", type: 'I' },
      { text: "I'm gentle and considerate of their feelings", type: 'S' },
      { text: "I'm specific and focus on facts and data", type: 'C' },
    ],
  },
  {
    id: 14,
    prompt: 'I handle deadlines by...',
    options: [
      { text: 'Pushing hard to beat them and exceed expectations', type: 'D' },
      { text: 'Rallying the team and making the work enjoyable', type: 'I' },
      { text: 'Planning ahead to avoid last-minute stress', type: 'S' },
      { text: 'Creating detailed schedules to ensure nothing is missed', type: 'C' },
    ],
  },
  {
    id: 15,
    prompt: 'My natural strength is...',
    options: [
      { text: 'Getting things done and overcoming obstacles', type: 'D' },
      { text: 'Inspiring and motivating others', type: 'I' },
      { text: 'Being a steady, dependable team player', type: 'S' },
      { text: 'Ensuring quality and catching errors', type: 'C' },
    ],
  },
  {
    id: 16,
    prompt: 'In conversations, I typically...',
    options: [
      { text: 'Get to the point quickly and stay focused', type: 'D' },
      { text: 'Share stories and connect on a personal level', type: 'I' },
      { text: 'Listen more than I talk', type: 'S' },
      { text: 'Ask detailed questions and seek specifics', type: 'C' },
    ],
  },
]

// Profile descriptions
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

export default function DISCAssessment() {
  const [currentView, setCurrentView] = useState<'intro' | 'assessment' | 'results' | 'admin'>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [employeeName, setEmployeeName] = useState('')
  const [employeeEmail, setEmployeeEmail] = useState('')
  const [employeeDept, setEmployeeDept] = useState('')
  const [selectionPhase, setSelectionPhase] = useState<'most' | 'least'>('most')
  const [currentMostSelection, setCurrentMostSelection] = useState<DISCType | null>(null)
  const [scores, setScores] = useState<CalculatedScores | null>(null)
  const [allResults, setAllResults] = useState<Result[]>([
    // Sample data for demo
    {
      name: 'Alex Chen',
      dept: 'Engineering',
      natural: { D: 40, I: 20, S: 15, C: 25 },
      adaptive: { D: 55, I: 15, S: 10, C: 20 },
      primaryNatural: 'D',
      primaryAdaptive: 'D',
      date: '2025-01-15',
    },
    {
      name: 'Jordan Smith',
      dept: 'Marketing',
      natural: { D: 15, I: 45, S: 25, C: 15 },
      adaptive: { D: 20, I: 35, S: 30, C: 15 },
      primaryNatural: 'I',
      primaryAdaptive: 'I',
      date: '2025-01-14',
    },
    {
      name: 'Sam Williams',
      dept: 'Operations',
      natural: { D: 20, I: 15, S: 45, C: 20 },
      adaptive: { D: 15, I: 10, S: 55, C: 20 },
      primaryNatural: 'S',
      primaryAdaptive: 'S',
      date: '2025-01-13',
    },
    {
      name: 'Taylor Brown',
      dept: 'Finance',
      natural: { D: 15, I: 15, S: 20, C: 50 },
      adaptive: { D: 10, I: 10, S: 15, C: 65 },
      primaryNatural: 'C',
      primaryAdaptive: 'C',
      date: '2025-01-12',
    },
    {
      name: 'Morgan Davis',
      dept: 'Sales',
      natural: { D: 35, I: 35, S: 15, C: 15 },
      adaptive: { D: 45, I: 25, S: 15, C: 15 },
      primaryNatural: 'D',
      primaryAdaptive: 'D',
      date: '2025-01-11',
    },
  ])
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const sendResultsEmail = async (result: Result) => {
    try {
      setEmailStatus('sending')
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      })

      if (!response.ok) throw new Error('Failed to send email')
      setEmailStatus('success')
    } catch (error) {
      console.error('Failed to send report email', error)
      setEmailStatus('error')
    }
  }

  const handleMostSelection = (type: DISCType) => {
    setCurrentMostSelection(type)
    setSelectionPhase('least')
  }

  const handleLeastSelection = async (type: DISCType) => {
    const newAnswers = {
      ...answers,
      [currentQuestion]: { most: currentMostSelection!, least: type },
    }
    setAnswers(newAnswers)
    setCurrentMostSelection(null)
    setSelectionPhase('most')

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate final scores
      const naturalRaw: Scores = { D: 0, I: 0, S: 0, C: 0 }
      const adaptiveRaw: Scores = { D: 0, I: 0, S: 0, C: 0 }

      Object.values(newAnswers).forEach((answer) => {
        naturalRaw[answer.most] += 2
        ;(['D', 'I', 'S', 'C'] as DISCType[]).forEach((t) => {
          if (t !== answer.least) adaptiveRaw[t] += 0.5
        })
        adaptiveRaw[answer.most] += 1
      })

      const normalize = (raw: Scores): Scores => {
        const total = Object.values(raw).reduce((a, b) => a + b, 0)
        if (total === 0) return { D: 25, I: 25, S: 25, C: 25 }
        return {
          D: Math.round((raw.D / total) * 100),
          I: Math.round((raw.I / total) * 100),
          S: Math.round((raw.S / total) * 100),
          C: Math.round((raw.C / total) * 100),
        }
      }

      const natural = normalize(naturalRaw)
      const adaptive = normalize(adaptiveRaw)
      const getPrimary = (s: Scores): DISCType =>
        (Object.entries(s).sort((a, b) => b[1] - a[1])[0][0] as DISCType)

      const calculatedScores: CalculatedScores = {
        natural,
        adaptive,
        primaryNatural: getPrimary(natural),
        primaryAdaptive: getPrimary(adaptive),
      }

      setScores(calculatedScores)

      const newResult: Result = {
        name: employeeName,
        email: employeeEmail,
        dept: employeeDept,
        ...calculatedScores,
        date: new Date().toISOString().split('T')[0],
      }
      setAllResults([...allResults, newResult])
      sendResultsEmail(newResult)
      setCurrentView('results')
    }
  }

  const resetAssessment = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setScores(null)
    setEmployeeName('')
    setEmployeeEmail('')
    setEmployeeDept('')
    setSelectionPhase('most')
    setCurrentMostSelection(null)
    setCurrentView('intro')
    setEmailStatus('idle')
  }

  // Chart data helpers
  const getComparisonData = (s: CalculatedScores) => [
    { trait: 'D', name: 'Dominance', natural: s.natural.D, adaptive: s.adaptive.D },
    { trait: 'I', name: 'Influence', natural: s.natural.I, adaptive: s.adaptive.I },
    { trait: 'S', name: 'Steadiness', natural: s.natural.S, adaptive: s.adaptive.S },
    { trait: 'C', name: 'Conscientiousness', natural: s.natural.C, adaptive: s.adaptive.C },
  ]

  const getRadarData = (s: CalculatedScores) => [
    { trait: 'D', natural: s.natural.D, adaptive: s.adaptive.D, fullMark: 100 },
    { trait: 'I', natural: s.natural.I, adaptive: s.adaptive.I, fullMark: 100 },
    { trait: 'S', natural: s.natural.S, adaptive: s.adaptive.S, fullMark: 100 },
    { trait: 'C', natural: s.natural.C, adaptive: s.adaptive.C, fullMark: 100 },
  ]

  const getShiftAnalysis = (s: CalculatedScores) =>
    (['D', 'I', 'S', 'C'] as DISCType[]).map((type) => ({
      type,
      name: profileDescriptions[type].name,
      shift: s.adaptive[type] - s.natural[type],
      natural: s.natural[type],
      adaptive: s.adaptive[type],
      color: profileDescriptions[type].color,
    }))

  // Intro Screen
  if (currentView === 'intro') {
    const formValid = Boolean(employeeName && employeeEmail && employeeDept)

    return (
      <div className="min-h-screen bg-muted/20 py-10">
        <div className="container max-w-5xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Assessment</p>
              <h1 className="text-3xl font-semibold">DISC Natural & Adaptive styles</h1>
              <p className="text-muted-foreground">Discover how you show up day-to-day and under pressure.</p>
            </div>
            <div className="flex gap-2">
              {(['D', 'I', 'S', 'C'] as DISCType[]).map((type) => (
                <div
                  key={type}
                  className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold shadow"
                  style={{
                    backgroundColor: profileDescriptions[type].bgColor,
                    color: profileDescriptions[type].color,
                  }}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>Tell us about you</CardTitle>
                <CardDescription>We will use this to personalize your results.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employeeName">Your Name</Label>
                    <Input
                      id="employeeName"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeEmail">Email Address</Label>
                    <Input
                      id="employeeEmail"
                      type="email"
                      value={employeeEmail}
                      onChange={(e) => setEmployeeEmail(e.target.value)}
                      placeholder="name@company.com"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Department</Label>
                    <Select value={employeeDept || undefined} onValueChange={setEmployeeDept}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Engineering', 'Marketing', 'Sales', 'Operations', 'Finance', 'HR', 'Executive', 'Other'].map(
                          (dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Natural style</p>
                    <p className="text-sm text-muted-foreground">
                      How you behave when relaxed and in your comfort zone.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-700">Adaptive style</p>
                    <p className="text-sm text-muted-foreground">
                      How you flex under stress, pressure, or challenging situations.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground">How it works</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• {questions.length} questions, each with 4 options.</li>
                    <li>• Choose the statement MOST like you, then LEAST like you.</li>
                    <li>• Answer based on your natural tendencies (5-10 minutes).</li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button className="flex-1 sm:flex-none" onClick={() => setCurrentView('assessment')} disabled={!formValid}>
                    Start assessment
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentView('admin')}>
                    View analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>What we measure</CardTitle>
                <CardDescription>Quick view of the four DISC styles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(['D', 'I', 'S', 'C'] as DISCType[]).map((type) => (
                  <div key={type} className="flex items-start gap-3 rounded-lg border p-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold"
                      style={{
                        backgroundColor: profileDescriptions[type].bgColor,
                        color: profileDescriptions[type].color,
                      }}
                    >
                      {type}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{profileDescriptions[type].name}</p>
                      <p className="text-sm text-muted-foreground">{profileDescriptions[type].traits.join(' • ')}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Assessment Screen
  if (currentView === 'assessment') {
    const question = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100
    const availableOptions =
      selectionPhase === 'least'
        ? question.options.filter((o) => o.type !== currentMostSelection)
        : question.options

    return (
      <div className="min-h-screen bg-muted/20 py-10">
        <div className="container max-w-4xl">
          <Card className="border-border/80">
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                  <h2 className="text-xl font-semibold text-foreground">{question.prompt}</h2>
                </div>
                <div className="min-w-[180px]">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="mt-2" />
                </div>
              </div>

              <div
                className={`rounded-lg border p-4 ${
                  selectionPhase === 'most' ? 'bg-emerald-50/60 border-emerald-100' : 'bg-amber-50/70 border-amber-100'
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    selectionPhase === 'most' ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {selectionPhase === 'most' ? 'Select the option MOST like you' : 'Now pick the option LEAST like you'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectionPhase === 'most'
                    ? 'Choose the statement that best describes your natural tendency.'
                    : 'From the remaining statements, which is least like you?'}
                </p>
              </div>

              <div className="space-y-3">
                {(selectionPhase === 'most' ? question.options : availableOptions).map((option, index) => {
                  const isSelected = selectionPhase === 'least' && currentMostSelection === option.type
                  if (isSelected) return null

                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left"
                      onClick={() =>
                        selectionPhase === 'most' ? handleMostSelection(option.type) : handleLeastSelection(option.type)
                      }
                    >
                      <span className="text-base text-foreground">{option.text}</span>
                    </Button>
                  )
                })}
              </div>

              {selectionPhase === 'least' && currentMostSelection && (
                <div className="rounded-md border border-emerald-100 bg-emerald-50/70 p-3 text-sm text-emerald-700">
                  ✓ Most like you:{' '}
                  <strong>{question.options.find((o) => o.type === currentMostSelection)?.text}</strong>
                </div>
              )}

              <div className="flex justify-between text-sm text-muted-foreground">
                {currentQuestion > 0 && selectionPhase === 'most' ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCurrentQuestion(currentQuestion - 1)
                      setCurrentMostSelection(null)
                      setSelectionPhase('most')
                    }}
                  >
                    ← Previous
                  </Button>
                ) : (
                  <span />
                )}

                {selectionPhase === 'least' && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectionPhase('most')
                      setCurrentMostSelection(null)
                    }}
                  >
                    ← Change “Most” selection
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Results Screen
  if (currentView === 'results' && scores) {
    const comparisonData = getComparisonData(scores)
    const radarData = getRadarData(scores)
    const shiftAnalysis = getShiftAnalysis(scores)
    const naturalProfile = profileDescriptions[scores.primaryNatural]
    const adaptiveProfile = profileDescriptions[scores.primaryAdaptive]
    const profileShifted = scores.primaryNatural !== scores.primaryAdaptive

    return (
      <div className="min-h-screen bg-muted/20 py-10">
        <div className="container max-w-5xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Your DISC Profile</h1>
              <p className="text-slate-600">
                {employeeName} • {employeeDept}
              </p>
              <div className="mt-3 flex justify-center">
                {emailStatus === 'sending' && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Emailing results to ngardner@dtgpower.com...
                  </span>
                )}
                {emailStatus === 'success' && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Report emailed to ngardner@dtgpower.com
                  </span>
                )}
                {emailStatus === 'error' && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Email failed. Please retry after checking server email settings.
                  </span>
                )}
              </div>
            </div>

            {/* Primary Types */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div
                className="text-center p-6 rounded-xl"
                style={{ backgroundColor: naturalProfile.bgColor }}
              >
                <div className="text-sm font-semibold text-slate-600 mb-2">NATURAL STYLE</div>
                <div className="text-5xl font-bold mb-2" style={{ color: naturalProfile.color }}>
                  {scores.primaryNatural}
                </div>
                <div className="text-lg font-semibold text-slate-800">{naturalProfile.name}</div>
                <p className="text-sm text-slate-600 mt-2">{naturalProfile.naturalDesc}</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-dashed border-slate-300">
                <div className="text-sm font-semibold text-slate-600 mb-2">ADAPTIVE STYLE (Under Stress)</div>
                <div className="text-5xl font-bold mb-2" style={{ color: adaptiveProfile.color }}>
                  {scores.primaryAdaptive}
                </div>
                <div className="text-lg font-semibold text-slate-800">{adaptiveProfile.name}</div>
                <p className="text-sm text-slate-600 mt-2">{adaptiveProfile.stressResponse}</p>
              </div>
            </div>

            {/* Profile Shift Alert */}
            {profileShifted && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                <div className="font-semibold text-amber-800 mb-1">⚡ Profile Shift Detected</div>
                <p className="text-sm text-amber-700">
                  Your primary style shifts from <strong>{naturalProfile.name}</strong> to{' '}
                  <strong>{adaptiveProfile.name}</strong> under stress. This is common and indicates you adapt
                  your behavior significantly when facing pressure.
                </p>
              </div>
            )}

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="font-semibold text-slate-800 mb-4 text-center">Natural vs Adaptive Comparison</h3>
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

              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="font-semibold text-slate-800 mb-4 text-center">Profile Radar</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="trait" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Natural"
                      dataKey="natural"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Adaptive"
                      dataKey="adaptive"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Shift Analysis */}
            <div className="bg-slate-50 rounded-xl p-5 mb-8">
              <h3 className="font-semibold text-slate-800 mb-4">Stress Response Analysis</h3>
              <div className="grid grid-cols-4 gap-4">
                {shiftAnalysis.map((item) => (
                  <div key={item.type} className="text-center">
                    <div className="text-sm font-medium text-slate-600 mb-1">{item.name}</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-emerald-600 font-semibold">{item.natural}%</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-orange-600 font-semibold">{item.adaptive}%</span>
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
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-xl p-4">
                <h4 className="font-semibold text-emerald-800 mb-3">Natural Style Scores</h4>
                <div className="space-y-2">
                  {(['D', 'I', 'S', 'C'] as DISCType[]).map((type) => (
                    <div key={type} className="flex items-center gap-3">
                      <div
                        className="w-20 text-sm font-medium"
                        style={{ color: profileDescriptions[type].color }}
                      >
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
                      <div className="w-12 text-right text-sm font-semibold">{scores.natural[type]}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <h4 className="font-semibold text-orange-800 mb-3">Adaptive Style Scores</h4>
                <div className="space-y-2">
                  {(['D', 'I', 'S', 'C'] as DISCType[]).map((type) => (
                    <div key={type} className="flex items-center gap-3">
                      <div
                        className="w-20 text-sm font-medium"
                        style={{ color: profileDescriptions[type].color }}
                      >
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
                      <div className="w-12 text-right text-sm font-semibold">{scores.adaptive[type]}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="space-y-4 mb-8">
              <div className="bg-emerald-50 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-800 mb-2">💚 Your Natural Strengths</h3>
                <p className="text-emerald-700 text-sm">{naturalProfile.naturalDesc}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {naturalProfile.traits.map((trait) => (
                    <span
                      key={trait}
                      className="px-2 py-1 bg-white rounded text-xs font-medium text-emerald-700"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">⚡ Under Stress You May...</h3>
                <p className="text-orange-700 text-sm">{adaptiveProfile.adaptiveDesc}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">🎯 Growth Opportunities</h3>
                <p className="text-blue-700 text-sm">{naturalProfile.growth}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={resetAssessment}>
                Take again
              </Button>
              <Button className="flex-1" onClick={() => setCurrentView('admin')}>
                View team analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Admin/Analytics Screen
  if (currentView === 'admin') {
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

    return (
      <div className="min-h-screen bg-muted/20 py-10">
        <div className="container max-w-7xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Team Analytics Dashboard</h1>
                <p className="text-slate-600">
                  {allResults.length} assessments • Natural & Adaptive Profiles
                </p>
              </div>
              <Button onClick={resetAssessment}>+ New Assessment</Button>
            </div>

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

  return null
}
