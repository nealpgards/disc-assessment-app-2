'use client'

import React, { useState, useRef, useEffect } from 'react'
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
import { Download, Clock, CheckSquare, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { generatePDFReport } from '@/lib/pdfGenerator'
import {
} from '@/lib/drivingForcesAnalysis'
import DrivingForcesChart from '@/components/DrivingForcesChart'

// Types
type DISCType = 'D' | 'I' | 'S' | 'C'

// Driving Forces Types
type DrivingForceType =
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

type MotivatorType = 'Knowledge' | 'Utility' | 'Surroundings' | 'Others' | 'Power' | 'Methodologies'

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

interface CommunicationGuide {
  styleLabel: string
  howToCommunicate: string[]
  howNotToCommunicate: string[]
  selfPerception: string[]
  othersPerception: string[]
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

interface DrivingForceQuestion {
  id: number
  prompt: string
  option1: { text: string; type: DrivingForceType }
  option2: { text: string; type: DrivingForceType }
}

interface DrivingForceScores {
  KI: number
  KN: number
  US: number
  UR: number
  SO: number
  SH: number
  OI: number
  OA: number
  PC: number
  PD: number
  MR: number
  MS: number
  [key: string]: number
}

interface DrivingForceResult {
  scores: DrivingForceScores
  primaryForces: Record<MotivatorType, DrivingForceType>
}

interface DrivingForceDescription {
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

interface MotivatorDescription {
  name: string
  description: string
  orientations: {
    [key: string]: string
  }
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
      'Share the vision, impact, and “why” behind decisions, not just the details.',
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
      'Some may feel intimidated by your focus on accuracy or fear “being wrong” around you.',
    ],
  },
}

// Communication Checklists - Detailed checklists for communicating with each DISC type
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

// Perceptions Data - How each DISC type sees themselves and how others see them
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

// Driving Forces Questions
const drivingForceQuestions: DrivingForceQuestion[] = [
  {
    id: 1,
    prompt: 'When learning new information, I prefer to...',
    option1: { text: 'Use my experience and intuition to guide me', type: 'KI' },
    option2: { text: 'Seek out new knowledge and discover truth', type: 'KN' },
  },
  {
    id: 2,
    prompt: 'I am most motivated when my work...',
    option1: { text: 'Helps others without expecting personal return', type: 'US' },
    option2: { text: 'Maximizes efficiency and practical results', type: 'UR' },
  },
  {
    id: 3,
    prompt: 'In my ideal workspace, I value...',
    option1: { text: 'Functionality and objective design', type: 'SO' },
    option2: { text: 'Aesthetic balance and harmonious atmosphere', type: 'SH' },
  },
  {
    id: 4,
    prompt: 'When helping others, I am driven by...',
    option1: { text: 'A specific purpose or goal', type: 'OI' },
    option2: { text: 'The benefit I provide to others', type: 'OA' },
  },
  {
    id: 5,
    prompt: 'I prefer to work in roles where I...',
    option1: { text: 'Contribute as part of a team with shared recognition', type: 'PC' },
    option2: { text: 'Have status, recognition, and control', type: 'PD' },
  },
  {
    id: 6,
    prompt: 'When approaching tasks, I prefer...',
    option1: { text: 'New ideas and methods outside traditional systems', type: 'MR' },
    option2: { text: 'Proven methods and structured approaches', type: 'MS' },
  },
  {
    id: 7,
    prompt: 'When making decisions, I rely on...',
    option1: { text: 'Past experiences and gut feelings', type: 'KI' },
    option2: { text: 'Research, data, and logical analysis', type: 'KN' },
  },
  {
    id: 8,
    prompt: 'I feel most fulfilled when I...',
    option1: { text: 'Complete tasks for the sake of helping', type: 'US' },
    option2: { text: 'See measurable returns on my efforts', type: 'UR' },
  },
  {
    id: 9,
    prompt: 'My environment affects me most through its...',
    option1: { text: 'Practical functionality and organization', type: 'SO' },
    option2: { text: 'Visual appeal and emotional atmosphere', type: 'SH' },
  },
  {
    id: 10,
    prompt: 'When supporting others, I focus on...',
    option1: { text: 'Achieving specific outcomes together', type: 'OI' },
    option2: { text: 'Providing genuine care and support', type: 'OA' },
  },
  {
    id: 11,
    prompt: 'In team settings, I am motivated by...',
    option1: { text: 'Contributing to shared success', type: 'PC' },
    option2: { text: 'Leading and being recognized for my contributions', type: 'PD' },
  },
  {
    id: 12,
    prompt: 'I work best with processes that are...',
    option1: { text: 'Flexible and open to innovation', type: 'MR' },
    option2: { text: 'Well-defined and consistently applied', type: 'MS' },
  },
  {
    id: 13,
    prompt: 'When solving problems, I tend to...',
    option1: { text: 'Draw from what has worked before', type: 'KI' },
    option2: { text: 'Explore new solutions and possibilities', type: 'KN' },
  },
  {
    id: 14,
    prompt: 'I measure success by...',
    option1: { text: 'The positive impact on others', type: 'US' },
    option2: { text: 'The efficiency and results achieved', type: 'UR' },
  },
  {
    id: 15,
    prompt: 'My workspace should be...',
    option1: { text: 'Organized and purpose-driven', type: 'SO' },
    option2: { text: 'Pleasant and emotionally comfortable', type: 'SH' },
  },
]

// Driving Forces Descriptions
const drivingForceDescriptions: Record<DrivingForceType, DrivingForceDescription> = {
  KI: {
    name: 'Instinctive',
    fullName: 'Knowledge - Instinctive',
    description: 'Driven by utilizing past experiences and intuition, seeking specific knowledge when necessary.',
    traits: ['Experience-based', 'Intuitive', 'Practical', 'Action-oriented'],
    color: '#7c3aed',
    bgColor: '#f3e8ff',
    examples: [
      'Trusting your gut feeling when making decisions',
      'Drawing on similar past experiences to solve current problems',
      'Learning through hands-on practice rather than theory',
      'Making quick decisions based on accumulated wisdom',
    ],
    workplaceScenarios: [
      'Leading a project similar to one you\'ve done before',
      'Mentoring others based on your experience',
      'Making rapid decisions in familiar situations',
      'Troubleshooting issues using past knowledge',
    ],
    strengths: [
      'Quick decision-making in familiar contexts',
      'Practical problem-solving based on real experience',
      'Reliable judgment in areas of expertise',
      'Ability to act decisively without over-analysis',
    ],
    blindSpots: [
      'May miss new approaches or innovative solutions',
      'Could overlook important details if situation differs from past',
      'May resist learning new methods if old ones worked',
      'Risk of applying outdated solutions to new problems',
    ],
  },
  KN: {
    name: 'Intellectual',
    fullName: 'Knowledge - Intellectual',
    description: 'Driven by opportunities to learn, acquire knowledge, and discover truth.',
    traits: ['Curious', 'Analytical', 'Learning-focused', 'Truth-seeking'],
    color: '#6366f1',
    bgColor: '#eef2ff',
    examples: [
      'Reading extensively about topics that interest you',
      'Asking probing questions to understand deeply',
      'Seeking out training and educational opportunities',
      'Enjoying research and discovery processes',
    ],
    workplaceScenarios: [
      'Taking on projects that require learning new skills',
      'Conducting research and analysis',
      'Participating in training and development programs',
      'Exploring innovative solutions through study',
    ],
    strengths: [
      'Deep understanding of complex topics',
      'Ability to synthesize information from multiple sources',
      'Strong analytical and critical thinking skills',
      'Natural curiosity drives continuous improvement',
    ],
    blindSpots: [
      'May over-analyze and delay action',
      'Could prioritize learning over practical application',
      'May struggle with decisions when information is incomplete',
      'Risk of analysis paralysis',
    ],
  },
  US: {
    name: 'Selfless',
    fullName: 'Utility - Selfless',
    description: 'Driven by completing tasks for the sake of completion, with little expectation of personal return.',
    traits: ['Altruistic', 'Service-oriented', 'Generous', 'Self-sacrificing'],
    color: '#059669',
    bgColor: '#d1fae5',
    examples: [
      'Helping colleagues without expecting anything in return',
      'Volunteering for tasks that benefit the team',
      'Putting others\' needs before your own',
      'Finding satisfaction in contributing to a greater good',
    ],
    workplaceScenarios: [
      'Supporting team members who are struggling',
      'Taking on less desirable tasks for the team\'s benefit',
      'Mentoring and developing others',
      'Contributing to projects where you won\'t receive direct credit',
    ],
    strengths: [
      'Builds strong relationships and trust',
      'Creates positive team culture',
      'Natural mentor and supporter',
      'High level of commitment to collective success',
    ],
    blindSpots: [
      'May neglect your own needs and career development',
      'Could be taken advantage of by others',
      'May struggle to advocate for yourself',
      'Risk of burnout from over-giving',
    ],
  },
  UR: {
    name: 'Resourceful',
    fullName: 'Utility - Resourceful',
    description: 'Driven by practical results, maximizing efficiency and returns for investments of time, talent, energy, and resources.',
    traits: ['Efficient', 'Results-driven', 'Pragmatic', 'ROI-focused'],
    color: '#0891b2',
    bgColor: '#cffafe',
    examples: [
      'Finding ways to accomplish more with less',
      'Evaluating the return on investment before committing',
      'Streamlining processes to increase efficiency',
      'Focusing on outcomes that provide measurable value',
    ],
    workplaceScenarios: [
      'Optimizing workflows and processes',
      'Leading projects with clear ROI expectations',
      'Making resource allocation decisions',
      'Identifying and eliminating waste or inefficiency',
    ],
    strengths: [
      'Excellent at maximizing resources and efficiency',
      'Strong focus on practical outcomes',
      'Ability to identify and eliminate waste',
      'Results-oriented approach drives productivity',
    ],
    blindSpots: [
      'May overlook human or relationship aspects',
      'Could prioritize efficiency over quality',
      'May struggle with tasks that don\'t have clear ROI',
      'Risk of being perceived as transactional',
    ],
  },
  SO: {
    name: 'Objective',
    fullName: 'Surroundings - Objective',
    description: 'Driven by the functionality and objectivity of surroundings.',
    traits: ['Functional', 'Practical', 'Systematic', 'Organized'],
    color: '#dc2626',
    bgColor: '#fee2e2',
    examples: [
      'Preferring organized, clutter-free workspaces',
      'Valuing functionality over aesthetics',
      'Creating systems and structures for efficiency',
      'Focusing on what works rather than how it looks',
    ],
    workplaceScenarios: [
      'Designing efficient office layouts',
      'Organizing information and processes systematically',
      'Creating functional workspaces',
      'Implementing structured workflows',
    ],
    strengths: [
      'Creates organized and efficient environments',
      'Strong focus on functionality and practicality',
      'Excellent at systems thinking',
      'Reliable and consistent approach',
    ],
    blindSpots: [
      'May overlook the importance of aesthetics and atmosphere',
      'Could create environments that feel sterile or impersonal',
      'May not consider emotional or subjective needs',
      'Risk of being too rigid or inflexible',
    ],
  },
  SH: {
    name: 'Harmonious',
    fullName: 'Surroundings - Harmonious',
    description: 'Driven by the experience, subjective viewpoints, and balance in surroundings.',
    traits: ['Aesthetic', 'Balanced', 'Sensory-aware', 'Atmosphere-focused'],
    color: '#ea580c',
    bgColor: '#ffedd5',
    examples: [
      'Creating visually appealing and comfortable spaces',
      'Paying attention to lighting, colors, and ambiance',
      'Valuing balance and harmony in your environment',
      'Being sensitive to the mood and energy of spaces',
    ],
    workplaceScenarios: [
      'Designing welcoming and pleasant workspaces',
      'Creating positive team atmospheres',
      'Organizing events with attention to ambiance',
      'Contributing to workplace culture and environment',
    ],
    strengths: [
      'Creates pleasant and inspiring environments',
      'Sensitive to atmosphere and mood',
      'Strong aesthetic sense',
      'Contributes to positive workplace culture',
    ],
    blindSpots: [
      'May prioritize aesthetics over functionality',
      'Could spend too much time on environment vs. work',
      'May struggle in purely functional or sterile environments',
      'Risk of being perceived as superficial',
    ],
  },
  OI: {
    name: 'Intentional',
    fullName: 'Others - Intentional',
    description: 'Driven to assist others for a specific purpose, not just for the sake of being helpful.',
    traits: ['Purpose-driven', 'Goal-oriented', 'Strategic', 'Outcome-focused'],
    color: '#be185d',
    bgColor: '#fce7f3',
    examples: [
      'Helping others achieve specific goals or outcomes',
      'Providing support that aligns with strategic objectives',
      'Mentoring with clear purpose and direction',
      'Assisting when it serves a larger purpose',
    ],
    workplaceScenarios: [
      'Mentoring others toward specific career goals',
      'Supporting team members to achieve project objectives',
      'Providing strategic guidance and direction',
      'Helping others develop skills needed for success',
    ],
    strengths: [
      'Strategic approach to helping others',
      'Clear focus on outcomes and results',
      'Effective at goal-oriented support',
      'Balances helping with achieving objectives',
    ],
    blindSpots: [
      'May be perceived as transactional or conditional',
      'Could miss opportunities to help without clear purpose',
      'May struggle with purely emotional support',
      'Risk of being seen as less genuine',
    ],
  },
  OA: {
    name: 'Altruistic',
    fullName: 'Others - Altruistic',
    description: 'Driven by the benefits provided to others.',
    traits: ['Caring', 'Empathetic', 'Supportive', 'People-focused'],
    color: '#c2410c',
    bgColor: '#fff7ed',
    examples: [
      'Genuinely caring about others\' wellbeing',
      'Feeling fulfilled when you help others succeed',
      'Naturally empathetic and understanding',
      'Putting people\'s needs and feelings first',
    ],
    workplaceScenarios: [
      'Supporting colleagues through difficult times',
      'Creating inclusive and supportive team environments',
      'Advocating for others\' needs and interests',
      'Building strong relationships based on care',
    ],
    strengths: [
      'Builds deep, meaningful relationships',
      'Creates supportive and caring environments',
      'High emotional intelligence',
      'Natural ability to understand and help others',
    ],
    blindSpots: [
      'May struggle with difficult decisions that affect people',
      'Could have difficulty saying no or setting boundaries',
      'May prioritize relationships over results',
      'Risk of emotional exhaustion from caring too much',
    ],
  },
  PC: {
    name: 'Collaborative',
    fullName: 'Power - Collaborative',
    description: 'Driven by being in a supporting role and contributing with little need for individual recognition.',
    traits: ['Team-oriented', 'Supportive', 'Humble', 'Cooperative'],
    color: '#16a34a',
    bgColor: '#dcfce7',
    examples: [
      'Thriving in team environments where everyone contributes',
      'Finding satisfaction in collective success',
      'Supporting leaders and helping them succeed',
      'Preferring shared recognition over individual accolades',
    ],
    workplaceScenarios: [
      'Working effectively in collaborative teams',
      'Supporting team leaders and contributing to group goals',
      'Facilitating team success through cooperation',
      'Contributing to projects without needing personal credit',
    ],
    strengths: [
      'Excellent team player and collaborator',
      'Builds strong team cohesion',
      'Reliable and supportive team member',
      'Creates positive team dynamics',
    ],
    blindSpots: [
      'May struggle to take individual leadership roles',
      'Could be overlooked for promotions or recognition',
      'May avoid advocating for yourself',
      'Risk of being taken for granted',
    ],
  },
  PD: {
    name: 'Commanding',
    fullName: 'Power - Commanding',
    description: 'Driven by status, recognition, and control over personal freedom.',
    traits: ['Ambitious', 'Leadership-focused', 'Status-driven', 'Autonomous'],
    color: '#ca8a04',
    bgColor: '#fef9c3',
    examples: [
      'Seeking leadership roles and positions of influence',
      'Valuing recognition and status symbols',
      'Wanting control over your work and decisions',
      'Striving for advancement and career growth',
    ],
    workplaceScenarios: [
      'Leading projects and teams',
      'Pursuing promotions and career advancement',
      'Taking on high-visibility assignments',
      'Building your professional reputation and status',
    ],
    strengths: [
      'Natural leadership ability',
      'Strong drive for achievement and success',
      'Comfortable making decisions and taking charge',
      'Ambitious and goal-oriented',
    ],
    blindSpots: [
      'May struggle with collaborative or supporting roles',
      'Could be perceived as overly competitive or self-focused',
      'May have difficulty sharing credit or recognition',
      'Risk of prioritizing status over team success',
    ],
  },
  MR: {
    name: 'Receptive',
    fullName: 'Methodologies - Receptive',
    description: 'Driven by new ideas, methods, and opportunities that fall outside a defined system for living.',
    traits: ['Innovative', 'Flexible', 'Open-minded', 'Change-embracing'],
    color: '#0284c7',
    bgColor: '#e0f2fe',
    examples: [
      'Embracing new technologies and approaches',
      'Seeking out innovative solutions and methods',
      'Adapting quickly to change',
      'Exploring unconventional ideas and approaches',
    ],
    workplaceScenarios: [
      'Leading innovation and change initiatives',
      'Exploring new technologies and processes',
      'Adapting to changing business needs',
      'Championing new ideas and approaches',
    ],
    strengths: [
      'Drives innovation and change',
      'Adaptable and flexible approach',
      'Open to new ideas and possibilities',
      'Comfortable with uncertainty and ambiguity',
    ],
    blindSpots: [
      'May struggle with established processes and systems',
      'Could create instability with constant change',
      'May overlook the value of proven methods',
      'Risk of being perceived as unreliable or inconsistent',
    ],
  },
  MS: {
    name: 'Structured',
    fullName: 'Methodologies - Structured',
    description: 'Driven by traditional approaches, proven methods, and a defined system for living.',
    traits: ['Systematic', 'Traditional', 'Consistent', 'Process-oriented'],
    color: '#1e40af',
    bgColor: '#dbeafe',
    examples: [
      'Following established processes and procedures',
      'Valuing consistency and reliability',
      'Preferring proven methods over experimentation',
      'Creating and maintaining systems and structures',
    ],
    workplaceScenarios: [
      'Maintaining and improving existing processes',
      'Ensuring consistency and quality standards',
      'Implementing structured workflows',
      'Providing stability and reliability',
    ],
    strengths: [
      'Provides stability and consistency',
      'Reliable and predictable approach',
      'Strong at maintaining quality standards',
      'Excellent at process improvement',
    ],
    blindSpots: [
      'May resist necessary change and innovation',
      'Could be perceived as rigid or inflexible',
      'May struggle with ambiguity or uncertainty',
      'Risk of being left behind by innovation',
    ],
  },
}

const motivatorDescriptions: Record<MotivatorType, MotivatorDescription> = {
  Knowledge: {
    name: 'Knowledge',
    description: 'The pursuit of information and understanding.',
    orientations: {
      KI: 'Instinctive: Uses experience and intuition',
      KN: 'Intellectual: Seeks new knowledge and truth',
    },
  },
  Utility: {
    name: 'Utility',
    description: 'The efficient use of resources.',
    orientations: {
      US: 'Selfless: Completes tasks for others',
      UR: 'Resourceful: Maximizes efficiency and returns',
    },
  },
  Surroundings: {
    name: 'Surroundings',
    description: 'One\'s environment and aesthetics.',
    orientations: {
      SO: 'Objective: Focuses on functionality',
      SH: 'Harmonious: Values balance and aesthetics',
    },
  },
  Others: {
    name: 'Others',
    description: 'Interactions and relationships with others.',
    orientations: {
      OI: 'Intentional: Assists with specific purpose',
      OA: 'Altruistic: Driven by benefits to others',
    },
  },
  Power: {
    name: 'Power',
    description: 'Authority and influence.',
    orientations: {
      PC: 'Collaborative: Supporting role, shared recognition',
      PD: 'Commanding: Status, recognition, and control',
    },
  },
  Methodologies: {
    name: 'Methodologies',
    description: 'Systems and processes.',
    orientations: {
      MR: 'Receptive: New ideas outside traditional systems',
      MS: 'Structured: Traditional, proven methods',
    },
  },
}

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
  const [currentView, setCurrentView] = useState<'intro' | 'assessment' | 'driving-forces' | 'results' | 'admin'>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [employeeName, setEmployeeName] = useState('')
  const [employeeEmail, setEmployeeEmail] = useState('')
  const [employeeDept, setEmployeeDept] = useState('')
  const [employeeTeamCode, setEmployeeTeamCode] = useState('')
  const [selectionPhase, setSelectionPhase] = useState<'most' | 'least'>('most')
  const [currentMostSelection, setCurrentMostSelection] = useState<DISCType | null>(null)
  const [scores, setScores] = useState<CalculatedScores | null>(null)
  const [currentDrivingForceQuestion, setCurrentDrivingForceQuestion] = useState(0)
  const [drivingForceAnswers, setDrivingForceAnswers] = useState<Record<number, DrivingForceType>>({})
  const [drivingForceScores, setDrivingForceScores] = useState<DrivingForceResult | null>(null)
  const [allResults, setAllResults] = useState<Result[]>([])
  const [insights, setInsights] = useState<{
    compatibility: Array<{ dept1: string; dept2: string; score: number; reasoning: string }>
    teamComposition: Array<{ department: string; strengths: string[]; gaps: string[]; recommendations: string[] }>
    communicationInsights: Array<{ department: string; style: string; preferences: string[]; recommendations: string[] }>
  } | null>(null)
  const [loadingResults, setLoadingResults] = useState(false)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const reportContainerRef = useRef<HTMLDivElement>(null)

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
      // Transition to Driving Forces assessment instead of results
      setCurrentView('driving-forces')
      setCurrentDrivingForceQuestion(0)
      setDrivingForceAnswers({})
    }
  }

  const handleDrivingForceSelection = async (selectedType: DrivingForceType) => {
    const newAnswers = {
      ...drivingForceAnswers,
      [currentDrivingForceQuestion]: selectedType,
    }
    setDrivingForceAnswers(newAnswers)

    if (currentDrivingForceQuestion < drivingForceQuestions.length - 1) {
      setCurrentDrivingForceQuestion(currentDrivingForceQuestion + 1)
    } else {
      // Calculate Driving Forces scores
      const rawScores: DrivingForceScores = {
        KI: 0,
        KN: 0,
        US: 0,
        UR: 0,
        SO: 0,
        SH: 0,
        OI: 0,
        OA: 0,
        PC: 0,
        PD: 0,
        MR: 0,
        MS: 0,
      }

      Object.values(newAnswers).forEach((answer) => {
        rawScores[answer] += 1
      })

      // Determine primary force for each motivator
      const primaryForces: Record<MotivatorType, DrivingForceType> = {
        Knowledge: rawScores.KI >= rawScores.KN ? 'KI' : 'KN',
        Utility: rawScores.US >= rawScores.UR ? 'US' : 'UR',
        Surroundings: rawScores.SO >= rawScores.SH ? 'SO' : 'SH',
        Others: rawScores.OI >= rawScores.OA ? 'OI' : 'OA',
        Power: rawScores.PC >= rawScores.PD ? 'PC' : 'PD',
        Methodologies: rawScores.MR >= rawScores.MS ? 'MR' : 'MS',
      }

      const drivingForceResult: DrivingForceResult = {
        scores: rawScores,
        primaryForces,
      }

      setDrivingForceScores(drivingForceResult)

      if (!scores) return

      // Prevent duplicate submissions
      if (saveStatus === 'saving') {
        console.log('Save already in progress, skipping duplicate submission')
        return
      }

      // Create final result with both DISC and Driving Forces
      const newResult: Result = {
        name: employeeName,
        email: employeeEmail,
        dept: employeeDept,
        teamCode: employeeTeamCode || undefined,
        ...scores,
        drivingForces: drivingForceResult,
        date: new Date().toISOString().split('T')[0],
      }
      
      // Save to database via API
      setSaveStatus('saving')
      setSaveError(null)
      
      try {
        const response = await fetch('/api/results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: employeeName,
            email: employeeEmail,
            dept: employeeDept,
            teamCode: employeeTeamCode,
            natural: scores.natural,
            adaptive: scores.adaptive,
            primaryNatural: scores.primaryNatural,
            primaryAdaptive: scores.primaryAdaptive,
            drivingForces: drivingForceResult,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('Failed to save result to database:', errorData)
          setSaveStatus('error')
          setSaveError(errorData.error || 'Failed to save results. Please try again.')
        } else {
          const result = await response.json()
          console.log('Result saved successfully:', result)
          setSaveStatus('success')
          // Reset success status after 3 seconds
          setTimeout(() => setSaveStatus('idle'), 3000)
        }
      } catch (error) {
        console.error('Failed to save result to database:', error)
        setSaveStatus('error')
        setSaveError('Failed to save results. Please check your connection and try again.')
      }
      
      setAllResults([...allResults, newResult])
      setCurrentView('results')
    }
  }

  // Fetch results from API when admin view is accessed
  useEffect(() => {
    if (currentView === 'admin') {
      setLoadingResults(true)
      fetch('/api/results')
        .then(async (res) => {
          if (!res.ok) {
            let errorMessage = `Failed to fetch results: ${res.status} ${res.statusText}`
            try {
              const errorData = await res.json()
              if (errorData && (errorData.error || errorData.details)) {
                errorMessage = errorData.error || errorData.details
              }
            } catch {
              // Ignore JSON parse errors and fall back to generic message
            }
            throw new Error(errorMessage)
          }
          return res.json()
        })
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
        .then(async (res) => {
          if (!res.ok) {
            let errorMessage = `Failed to fetch insights: ${res.status} ${res.statusText}`
            try {
              const errorData = await res.json()
              if (errorData && (errorData.error || errorData.details)) {
                errorMessage = errorData.error || errorData.details
              }
            } catch {
              // Ignore JSON parse errors and fall back to generic message
            }
            throw new Error(errorMessage)
          }
          return res.json()
        })
        .then((data) => {
          setInsights(data)
          setLoadingInsights(false)
        })
        .catch((error) => {
          console.error('Failed to fetch insights:', error)
          setLoadingInsights(false)
        })
    }
  }, [currentView])

  const resetAssessment = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setScores(null)
    setEmployeeName('')
    setEmployeeEmail('')
    setEmployeeDept('')
    setEmployeeTeamCode('')
    setSelectionPhase('most')
    setCurrentMostSelection(null)
    setCurrentView('intro')
    setPdfStatus('idle')
    setCurrentDrivingForceQuestion(0)
    setDrivingForceAnswers({})
    setDrivingForceScores(null)
    setShuffledQuestions([])
    setSaveStatus('idle')
    setSaveError(null)
  }

  const handleExportPDF = async () => {
    if (!scores) return

    try {
      setPdfStatus('generating')

      const result: Result = {
        name: employeeName,
        email: employeeEmail,
        dept: employeeDept,
        teamCode: employeeTeamCode || undefined,
        ...scores,
         drivingForces: drivingForceScores || undefined,
        date: new Date().toISOString().split('T')[0],
      }

      // Wait a brief moment to ensure charts are fully rendered
      await new Promise((resolve) => setTimeout(resolve, 500))

      await generatePDFReport(result, scores, reportContainerRef.current)

      setPdfStatus('success')
      // Reset status after 3 seconds
      setTimeout(() => setPdfStatus('idle'), 3000)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      setPdfStatus('error')
      // Reset error status after 5 seconds
      setTimeout(() => setPdfStatus('idle'), 5000)
    }
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
    const formValid = Boolean(employeeName && employeeEmail && employeeDept && employeeTeamCode)

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-stone-100 px-4 py-12 flex items-start sm:items-center justify-center">
        <div className="w-full max-w-2xl space-y-8">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              DISC + Driving Forces
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Discover your natural behaviors and what motivates you.
            </p>
          </div>

          <Card className="border border-slate-100 bg-white/95 shadow-xl shadow-slate-900/5 rounded-3xl">
            <CardContent className="space-y-6 pt-6 sm:pt-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employeeName" className="text-sm font-medium text-slate-800">
                    Your name
                  </Label>
                  <Input
                    id="employeeName"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/60 focus-visible:ring-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeEmail" className="text-sm font-medium text-slate-800">
                    Email
                  </Label>
                  <Input
                    id="employeeEmail"
                    type="email"
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/60 focus-visible:ring-slate-400"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm font-medium text-slate-800">Department</Label>
                  <Select value={employeeDept || undefined} onValueChange={setEmployeeDept}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/60 focus-visible:ring-slate-400">
                      <SelectValue placeholder="Select department" />
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
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="teamCode" className="text-sm font-medium text-slate-800">
                    Team code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="teamCode"
                    type="text"
                    value={employeeTeamCode}
                    onChange={(e) => setEmployeeTeamCode(e.target.value.toUpperCase())}
                    placeholder="DTG01"
                    maxLength={20}
                    required
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/60 focus-visible:ring-slate-400"
                  />
                  <p className="text-xs text-slate-500">Use the code provided by your admin.</p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="inline-flex w-full items-center justify-center gap-2 h-11 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-[0_18px_40px_rgba(15,23,42,0.35)] hover:bg-slate-900/90"
                  onClick={() => {
                    const randomized = questions.map((q) => ({
                      ...q,
                      options: [...q.options].sort(() => Math.random() - 0.5),
                    }))
                    setShuffledQuestions(randomized)
                    setCurrentQuestion(0)
                    setSelectionPhase('most')
                    setCurrentMostSelection(null)
                    setCurrentView('assessment')
                  }}
                  disabled={!formValid}
                >
                  <span>Start assessment</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
            <div className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>10–15 min</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span>{questions.length + drivingForceQuestions.length} questions</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Assessment Screen
  if (currentView === 'assessment') {
    const question = shuffledQuestions[currentQuestion] || questions[currentQuestion]
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

  // Driving Forces Assessment Screen
  if (currentView === 'driving-forces') {
    const question = drivingForceQuestions[currentDrivingForceQuestion]
    const progress = ((currentDrivingForceQuestion + 1) / drivingForceQuestions.length) * 100

    return (
      <div className="min-h-screen bg-muted/20 py-10">
        <div className="container max-w-4xl">
          <Card className="border-border/80">
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Driving Forces Question {currentDrivingForceQuestion + 1} of {drivingForceQuestions.length}
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

              <div className="rounded-lg border p-4 bg-blue-50/60 border-blue-100">
                <p className="text-sm font-semibold text-blue-700">
                  Select the option that best describes you
                </p>
                <p className="text-xs text-muted-foreground">
                  Choose the statement that most accurately reflects your motivations and preferences.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => handleDrivingForceSelection(question.option1.type)}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-base text-foreground font-medium">{question.option1.text}</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => handleDrivingForceSelection(question.option2.type)}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-base text-foreground font-medium">{question.option2.text}</span>
                  </div>
                </Button>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                {currentDrivingForceQuestion > 0 ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCurrentDrivingForceQuestion(currentDrivingForceQuestion - 1)
                    }}
                  >
                    ← Previous
                  </Button>
                ) : (
                  <span />
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
    const hasDrivingForces = drivingForceScores !== null
    const communicationGuide = communicationGuides[scores.primaryNatural]

    return (
      <div className="min-h-screen bg-muted/20 py-4 sm:py-10 px-4">
        <div className="container max-w-5xl mx-auto">
          <div ref={reportContainerRef} className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Your Assessment Results
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                {employeeName} • {employeeDept}
              </p>
              {saveStatus === 'saving' && (
                <div className="mt-4">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Saving results...
                  </span>
                </div>
              )}
              {saveStatus === 'success' && (
                <div className="mt-4">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Results saved successfully!
                  </span>
                </div>
              )}
            </div>

            {/* Primary Types */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div
                className="text-center p-4 sm:p-6 rounded-xl"
                style={{ backgroundColor: naturalProfile.bgColor }}
              >
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
                  Your primary style shifts from <strong>{naturalProfile.name}</strong> to{' '}
                  <strong>{adaptiveProfile.name}</strong> under stress. This is common and indicates you adapt
                  your behavior significantly when facing pressure.
                </p>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-slate-50 rounded-xl p-3 sm:p-5">
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4 text-center">Natural vs Adaptive Comparison</h3>
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
                      <div
                        className="w-16 sm:w-20 text-xs sm:text-sm font-medium"
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
                      <div
                        className="w-16 sm:w-20 text-xs sm:text-sm font-medium"
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
                      <div className="w-10 sm:w-12 text-right text-xs sm:text-sm font-semibold">{scores.adaptive[type]}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="bg-emerald-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-emerald-800 mb-2">💚 Your Natural Strengths</h3>
                <p className="text-emerald-700 text-xs sm:text-sm">{naturalProfile.naturalDesc}</p>
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
              <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-orange-800 mb-2">⚡ Under Stress You May...</h3>
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
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">How to Communicate With You</h2>
                <p className="text-slate-600 text-xs sm:text-sm">
                  Based primarily on your Natural style ({scores.primaryNatural} – {naturalProfile.name}).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-100">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-2">Do this when communicating with you</h3>
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
                  <h3 className="text-sm sm:text-base font-semibold text-rose-800 mb-2">Avoid this when communicating with you</h3>
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
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-2">How you likely see yourself</h3>
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
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-2">How others may see you</h3>
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
                  Most people are aware of and sensitive to the ways with which they prefer to be communicated. Many
                  people find this section to be extremely accurate and important for enhanced interpersonal
                  communication. This page provides other people with a list of things to DO when communicating with{' '}
                  {employeeName}. Read each statement and identify the 3 or 4 statements which are most important to
                  them. We recommend highlighting the most important "DO's" and provide a listing to those who
                  communicate with {employeeName} most frequently.
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
                  This section of the report is a list of things NOT to do while communicating with {employeeName}.
                  Review each statement with {employeeName} and identify those methods of communication that result in
                  frustration or reduced performance. By sharing this information, both parties can negotiate a
                  communication system that is mutually agreeable.
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

            {/* Perceptions: See Yourself as Others See You */}
            <div className="border-t-2 border-slate-200 pt-6 sm:pt-8 mb-6 sm:mb-8">
              <div className="mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Perceptions: See Yourself as Others See You</h2>
                <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  A person's behavior and feelings may be quickly telegraphed to others. This section provides additional
                  information on {employeeName}'s self-perception and how, under certain conditions, others may perceive
                  their behavior. Understanding this section will empower {employeeName} to project the image that will
                  allow them to control the situation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Self-Perception */}
                <div className="bg-sky-50 rounded-xl p-4 sm:p-5 border-2 border-sky-200">
                  <h3 className="text-sm sm:text-base font-semibold text-sky-800 mb-2 bg-sky-100 -m-4 sm:-m-5 mb-2 p-3 rounded-t-xl">
                    Self-Perception
                  </h3>
                  <p className="text-xs text-slate-600 mb-3">{employeeName} usually sees themselves as being:</p>
                  <ul className="space-y-2">
                    {perceptionsData[scores.primaryNatural].selfPerception.map((item, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-sky-600 mt-1 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Others' Perception - Moderate */}
                <div className="bg-amber-50 rounded-xl p-4 sm:p-5 border-2 border-amber-200">
                  <h3 className="text-sm sm:text-base font-semibold text-amber-800 mb-2 bg-amber-100 -m-4 sm:-m-5 mb-2 p-3 rounded-t-xl">
                    Others' Perception - Moderate
                  </h3>
                  <p className="text-xs text-slate-600 mb-3">
                    Under moderate pressure, tension, stress or fatigue, others may see them as being:
                  </p>
                  <ul className="space-y-2">
                    {perceptionsData[scores.primaryNatural].othersPerceptionModerate.map((item, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-amber-600 mt-1 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Others' Perception - Extreme */}
                <div className="bg-red-50 rounded-xl p-4 sm:p-5 border-2 border-red-200">
                  <h3 className="text-sm sm:text-base font-semibold text-red-800 mb-2 bg-red-100 -m-4 sm:-m-5 mb-2 p-3 rounded-t-xl">
                    Others' Perception - Extreme
                  </h3>
                  <p className="text-xs text-slate-600 mb-3">
                    Under extreme pressure, stress or fatigue, others may see them as being:
                  </p>
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
            {hasDrivingForces && drivingForceScores && (
              <div className="border-t-2 border-slate-200 pt-6 sm:pt-8 mb-6 sm:mb-8">
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Your Driving Forces</h2>
                  <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto px-4">
                    These six scales show how strongly you lean toward each side of the core motivators that drive your
                    decisions and priorities.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 sm:p-6">
                  <DrivingForcesChart
                    scores={drivingForceScores.scores}
                    title="Driving Forces Profile"
                    subtitle="Higher numbers indicate a stronger pull toward that side of each motivator."
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 w-full sm:w-auto"
                  onClick={handleExportPDF}
                  disabled={pdfStatus === 'generating'}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {pdfStatus === 'generating' ? 'Generating PDF...' : 'Export to PDF'}
                </Button>
                <Button variant="secondary" className="flex-1 w-full sm:w-auto" onClick={resetAssessment}>
                  Take again
                </Button>
              </div>
              {pdfStatus === 'success' && (
                <div className="text-center">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ PDF downloaded successfully!
                  </span>
                </div>
              )}
              {pdfStatus === 'error' && (
                <div className="text-center">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">
                    Failed to generate PDF. Please try again.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Admin/Analytics Screen
  if (currentView === 'admin') {
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
                <Button onClick={resetAssessment}>+ New Assessment</Button>
              </div>
              <div className="text-center py-20">
                <p className="text-slate-500 mb-4">No assessment results found.</p>
                <Button onClick={resetAssessment}>Start First Assessment</Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-muted/20 py-4 sm:py-10 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Team Analytics Dashboard</h1>
                <p className="text-sm sm:text-base text-slate-600">
                  {allResults.length} assessments • Natural & Adaptive Profiles
                </p>
              </div>
              <Button onClick={resetAssessment} className="w-full sm:w-auto">+ New Assessment</Button>
            </div>

            {/* Team Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-slate-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">
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

              <div className="bg-slate-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Profile Shifters</h3>
                {shifters.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {shifters.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg gap-2">
                        <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">{r.name}</span>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <span
                            className="px-1.5 sm:px-2 py-1 rounded text-white text-xs sm:text-sm font-semibold"
                            style={{ backgroundColor: profileDescriptions[r.primaryNatural].color }}
                          >
                            {r.primaryNatural}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span
                            className="px-1.5 sm:px-2 py-1 rounded text-white text-xs sm:text-sm font-semibold"
                            style={{ backgroundColor: profileDescriptions[r.primaryAdaptive].color }}
                          >
                            {r.primaryAdaptive}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8 text-sm">No profile shifters detected</p>
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
            <div className="bg-slate-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Department Average Scores</h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-semibold text-slate-700">Department</th>
                        <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-slate-500">#</th>
                        <th
                          colSpan={4}
                          className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-emerald-700 bg-emerald-50 text-xs"
                        >
                          Natural
                        </th>
                        <th
                          colSpan={4}
                          className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-orange-700 bg-orange-50 text-xs"
                        >
                          Adaptive
                        </th>
                      </tr>
                      <tr className="border-b border-slate-100 text-xs">
                        <th></th>
                        <th></th>
                        <th className="py-1 sm:py-2 text-center bg-emerald-50" style={{ color: profileDescriptions.D.color }}>
                          D
                        </th>
                        <th className="py-1 sm:py-2 text-center bg-emerald-50" style={{ color: profileDescriptions.I.color }}>
                          I
                        </th>
                        <th className="py-1 sm:py-2 text-center bg-emerald-50" style={{ color: profileDescriptions.S.color }}>
                          S
                        </th>
                        <th className="py-1 sm:py-2 text-center bg-emerald-50" style={{ color: profileDescriptions.C.color }}>
                          C
                        </th>
                        <th className="py-1 sm:py-2 text-center bg-orange-50" style={{ color: profileDescriptions.D.color }}>
                          D
                        </th>
                        <th className="py-1 sm:py-2 text-center bg-orange-50" style={{ color: profileDescriptions.I.color }}>
                          I
                        </th>
                        <th className="py-1 sm:py-2 text-center bg-orange-50" style={{ color: profileDescriptions.S.color }}>
                          S
                        </th>
                        <th className="py-1 sm:py-2 text-center bg-orange-50" style={{ color: profileDescriptions.C.color }}>
                          C
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {avgByDept.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-100">
                          <td className="py-2 sm:py-3 px-2 sm:px-3 font-medium">{row.dept}</td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center text-slate-500">{row.count}</td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center bg-emerald-50/50">{row.D_nat}%</td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center bg-emerald-50/50">{row.I_nat}%</td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center bg-emerald-50/50">{row.S_nat}%</td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center bg-emerald-50/50">{row.C_nat}%</td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center bg-orange-50/50">{row.D_adp}%</td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center bg-orange-50/50">{row.I_adp}%</td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center bg-orange-50/50">{row.S_adp}%</td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center bg-orange-50/50">{row.C_adp}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* All Results Table */}
            <div className="bg-slate-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">All Employee Results</h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-semibold text-slate-700">Name</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-semibold text-slate-700">Dept</th>
                        <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-emerald-700">Natural</th>
                        <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-orange-700">Adaptive</th>
                        <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-slate-500">Shift?</th>
                        <th className="text-center py-2 sm:py-3 px-1 sm:px-2" style={{ color: profileDescriptions.D.color }}>
                          D
                        </th>
                        <th className="text-center py-2 sm:py-3 px-1 sm:px-2" style={{ color: profileDescriptions.I.color }}>
                          I
                        </th>
                        <th className="text-center py-2 sm:py-3 px-1 sm:px-2" style={{ color: profileDescriptions.S.color }}>
                          S
                        </th>
                        <th className="text-center py-2 sm:py-3 px-1 sm:px-2" style={{ color: profileDescriptions.C.color }}>
                          C
                        </th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-semibold text-slate-700 hidden md:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allResults.map((r, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-100">
                          <td className="py-2 sm:py-3 px-2 sm:px-3 font-medium">{r.name}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-3">{r.dept}</td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center">
                            <span
                              className="px-1.5 sm:px-2 py-1 rounded text-white text-xs font-bold"
                              style={{ backgroundColor: profileDescriptions[r.primaryNatural].color }}
                            >
                              {r.primaryNatural}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center">
                            <span
                              className="px-1.5 sm:px-2 py-1 rounded text-white text-xs font-bold"
                              style={{ backgroundColor: profileDescriptions[r.primaryAdaptive].color }}
                            >
                              {r.primaryAdaptive}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center">
                            {r.primaryNatural !== r.primaryAdaptive ? '⚡' : '—'}
                          </td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center text-xs">
                            <span className="text-emerald-600">{r.natural.D}</span>/
                            <span className="text-orange-600">{r.adaptive.D}</span>
                          </td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center text-xs">
                            <span className="text-emerald-600">{r.natural.I}</span>/
                            <span className="text-orange-600">{r.adaptive.I}</span>
                          </td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center text-xs">
                            <span className="text-emerald-600">{r.natural.S}</span>/
                            <span className="text-orange-600">{r.adaptive.S}</span>
                          </td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center text-xs">
                            <span className="text-emerald-600">{r.natural.C}</span>/
                            <span className="text-orange-600">{r.adaptive.C}</span>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-500 hidden md:table-cell">{r.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Driving Forces Analytics */}
            {allResults.some((r) => r.drivingForces) && (
              <>
                <div className="border-t-2 border-slate-200 pt-6 sm:pt-8 mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Driving Forces Analytics</h2>

                  {/* Driving Forces Distribution */}
                  <div className="bg-slate-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Primary Driving Forces Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                            <div key={motivator} className="bg-white rounded-lg p-3 sm:p-4 border">
                              <h4 className="text-sm sm:text-base font-semibold text-slate-700 mb-2 sm:mb-3">{motivator}</h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-24 sm:w-32 text-xs font-medium" style={{ color: option1Desc.color }}>
                                    {option1Desc.name}
                                  </div>
                                  <div className="flex-1 h-3 sm:h-4 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${(distribution.option1 / resultsWithDF.length) * 100}%`,
                                        backgroundColor: option1Desc.color,
                                      }}
                                    />
                                  </div>
                                  <div className="w-10 sm:w-12 text-right text-xs font-semibold">
                                    {distribution.option1} ({Math.round((distribution.option1 / resultsWithDF.length) * 100)}%)
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-24 sm:w-32 text-xs font-medium" style={{ color: option2Desc.color }}>
                                    {option2Desc.name}
                                  </div>
                                  <div className="flex-1 h-3 sm:h-4 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${(distribution.option2 / resultsWithDF.length) * 100}%`,
                                        backgroundColor: option2Desc.color,
                                      }}
                                    />
                                  </div>
                                  <div className="w-10 sm:w-12 text-right text-xs font-semibold">
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

  return null
}
