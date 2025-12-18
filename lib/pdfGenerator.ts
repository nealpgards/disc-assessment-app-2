import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Types matching the component
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
      'Lead with the bottom line or decision needed, then add only the most relevant context.',
      'Be clear about goals, ownership, and timelines – focus on outcomes more than process.',
      'Offer options and autonomy rather than prescribing every detail.',
    ],
    howNotToCommunicate: [
      'Do not bury key points in long stories or excessive background.',
      'Avoid vague expectations, indecisive language, or constant revisiting of decisions.',
      'Do not take their direct questions personally or respond with defensiveness.',
    ],
    selfPerception: [
      'Sees self as confident, decisive, and efficient at getting things done.',
      'Believes that directness and speed help the team move forward.',
    ],
    othersPerception: [
      'Others may see them as impatient, demanding, or overly blunt when under pressure.',
      'Some may hesitate to push back or share concerns if they feel rushed or dismissed.',
    ],
  },
  I: {
    styleLabel: 'Enthusiastic, relational, and expressive communicator',
    howToCommunicate: [
      'Start with connection – be warm, positive, and conversational.',
      'Explain the vision, impact, and “why” behind decisions, not just the facts.',
      'Invite dialogue, questions, and brainstorming to keep them engaged.',
    ],
    howNotToCommunicate: [
      'Do not be overly formal, distant, or purely transactional.',
      'Avoid shutting down ideas too quickly or focusing only on problems.',
      'Do not rely only on one-way communication for important topics.',
    ],
    selfPerception: [
      'Sees self as friendly, encouraging, and good at building relationships.',
      'Believes their optimism and energy make work more enjoyable for others.',
    ],
    othersPerception: [
      'Others may see them as scattered, overly talkative, or light on follow-through at times.',
      'Some may feel commitments are made enthusiastically but not always completed.',
    ],
  },
  S: {
    styleLabel: 'Calm, steady, and supportive communicator',
    howToCommunicate: [
      'Provide clear expectations and allow time to process before expecting a response.',
      'Explain how changes will affect people, routines, and stability.',
      'Invite their perspective in a low-pressure way and show appreciation for their support.',
    ],
    howNotToCommunicate: [
      'Do not surprise them with last-minute changes or abrupt confrontations.',
      'Avoid aggressive, high-pressure tactics or rapid-fire decisions with no input.',
      'Do not minimize their concerns about team harmony or workload.',
    ],
    selfPerception: [
      'Sees self as loyal, dependable, and a calming presence on the team.',
      'Believes their patience and consistency help others feel safe and supported.',
    ],
    othersPerception: [
      'Others may see them as resistant to change, quiet, or slow to decide.',
      'Some may underestimate their opinions because they do not always speak first.',
    ],
  },
  C: {
    styleLabel: 'Thoughtful, precise, and data-driven communicator',
    howToCommunicate: [
      'Come prepared with data, structure, and clear reasoning.',
      'Be specific about expectations, definitions, and quality standards.',
      'Give time for questions and analysis before requiring a firm decision.',
    ],
    howNotToCommunicate: [
      'Do not be vague, inconsistent, or dismissive of details and risks.',
      'Avoid pressuring for instant decisions without enough information.',
      'Do not take their critical questions as personal attacks – they are seeking clarity.',
    ],
    selfPerception: [
      'Sees self as careful, thorough, and committed to doing things right.',
      'Believes their questions and critique protect quality and reduce risk.',
    ],
    othersPerception: [
      'Others may see them as overly critical, slow, or rigid when standards feel very high.',
      'Some may feel anxious about “being wrong” in front of them because of their precision.',
    ],
  },
}

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

// Helper function to add page numbers
const addPageNumber = (doc: jsPDF, pageNum: number, totalPages: number) => {
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 30, doc.internal.pageSize.getHeight() - 10, {
    align: 'right',
  })
}

// Helper function to add header
const addHeader = (doc: jsPDF, title: string) => {
  doc.setFontSize(16)
  doc.setTextColor(30, 41, 59) // slate-800
  doc.setFont('helvetica', 'bold')
  doc.text(title, 20, 25)
  doc.setLineWidth(0.5)
  doc.setDrawColor(200, 200, 200)
  doc.line(20, 30, doc.internal.pageSize.getWidth() - 20, 30)
}

// Helper function to wrap text
const addWrappedText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 7,
  fontSize: number = 11
): number => {
  doc.setFontSize(fontSize)
  doc.setTextColor(51, 65, 85) // slate-700
  const lines = doc.splitTextToSize(text, maxWidth)
  doc.text(lines, x, y)
  return y + lines.length * lineHeight
}

export async function generatePDFReport(
  result: Result,
  scores: CalculatedScores,
  chartElements?: { barChart?: HTMLElement | null; radarChart?: HTMLElement | null }
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPos = margin
  let currentPage = 1

  // Capture chart images if provided
  let barChartImage: { src: string; width: number; height: number } | null = null
  let radarChartImage: { src: string; width: number; height: number } | null = null

  if (chartElements?.barChart) {
    try {
      const canvas = await html2canvas(chartElements.barChart, {
        backgroundColor: '#f8fafc',
        scale: 2,
      })
      barChartImage = {
        src: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height,
      }
    } catch (error) {
      console.error('Failed to capture bar chart:', error)
    }
  }

  if (chartElements?.radarChart) {
    try {
      const canvas = await html2canvas(chartElements.radarChart, {
        backgroundColor: '#f8fafc',
        scale: 2,
      })
      radarChartImage = {
        src: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height,
      }
    } catch (error) {
      console.error('Failed to capture radar chart:', error)
    }
  }

  const naturalProfile = profileDescriptions[scores.primaryNatural]
  const adaptiveProfile = profileDescriptions[scores.primaryAdaptive]
  const profileShifted = scores.primaryNatural !== scores.primaryAdaptive

  const hasDrivingForces = !!result.drivingForces

  // Base page count (may slightly undercount if content flows onto extra pages)
  const totalPages = hasDrivingForces ? 9 : 8

  // ========== PAGE 1: COVER PAGE ==========
  doc.setFillColor(248, 250, 252) // slate-50
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Title
  doc.setFontSize(32)
  doc.setTextColor(30, 41, 59) // slate-800
  doc.setFont('helvetica', 'bold')
  doc.text('DISC Assessment', pageWidth / 2, 60, { align: 'center' })

  doc.setFontSize(20)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105) // slate-600
  doc.text('Natural & Adaptive Styles Report', pageWidth / 2, 75, { align: 'center' })

  // User Info Box
  yPos = 100
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'F')
  doc.setDrawColor(226, 232, 240) // slate-200
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'S')

  yPos += 15
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text(`Name: ${result.name}`, margin + 10, yPos)
  yPos += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(`Department: ${result.dept}`, margin + 10, yPos)
  yPos += 10
  doc.text(`Assessment Date: ${new Date(result.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`, margin + 10, yPos)

  // Primary Styles
  yPos = 180
  const boxWidth = (contentWidth - 10) / 2

  // Natural Style Box
  const [nr, ng, nb] = hexToRgb(naturalProfile.color)
  doc.setFillColor(240, 253, 244) // emerald-50
  doc.roundedRect(margin, yPos, boxWidth, 40, 3, 3, 'F')
  doc.setDrawColor(nr, ng, nb)
  doc.setLineWidth(1)
  doc.roundedRect(margin, yPos, boxWidth, 40, 3, 3, 'S')

  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text('NATURAL STYLE', margin + 10, yPos + 10)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(nr, ng, nb)
  doc.text(scores.primaryNatural, margin + 10, yPos + 25)
  doc.setFontSize(12)
  doc.setTextColor(30, 41, 59)
  doc.text(naturalProfile.name, margin + 10, yPos + 35)

  // Adaptive Style Box
  const [ar, ag, ab] = hexToRgb(adaptiveProfile.color)
  doc.setFillColor(255, 247, 237) // orange-50
  doc.roundedRect(margin + boxWidth + 10, yPos, boxWidth, 40, 3, 3, 'F')
  doc.setDrawColor(ar, ag, ab)
  doc.roundedRect(margin + boxWidth + 10, yPos, boxWidth, 40, 3, 3, 'S')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text('ADAPTIVE STYLE', margin + boxWidth + 20, yPos + 10)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(ar, ag, ab)
  doc.text(scores.primaryAdaptive, margin + boxWidth + 20, yPos + 25)
  doc.setFontSize(12)
  doc.setTextColor(30, 41, 59)
  doc.text(adaptiveProfile.name, margin + boxWidth + 20, yPos + 35)

  addPageNumber(doc, currentPage, totalPages)
  currentPage++

  // ========== PAGE 2: EXECUTIVE SUMMARY ==========
  doc.addPage()
  yPos = margin
  addHeader(doc, 'Executive Summary')

  yPos = 40
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Your Primary Styles', margin, yPos)
  yPos += 15

  // Natural Style Description
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(5, 150, 105) // emerald-600
  doc.text('Natural Style (Your Comfort Zone)', margin, yPos)
  yPos += 8
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)
  yPos = addWrappedText(doc, naturalProfile.naturalDesc, margin, yPos, contentWidth, 7, 11) + 5

  // Traits
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text('Key Traits: ', margin, yPos)
  const traitsText = naturalProfile.traits.join(' • ')
  doc.text(traitsText, margin + 25, yPos)
  yPos += 15

  // Adaptive Style Description
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(234, 88, 12) // orange-600
  doc.text('Adaptive Style (Under Stress)', margin, yPos)
  yPos += 8
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)
  yPos = addWrappedText(doc, adaptiveProfile.adaptiveDesc, margin, yPos, contentWidth, 7, 11) + 5

  // Profile Shift Alert
  if (profileShifted) {
    yPos += 5
    doc.setFillColor(255, 251, 235) // amber-50
    doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F')
    doc.setDrawColor(253, 224, 71) // amber-300
    doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'S')
    yPos += 8
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(180, 83, 9) // amber-700
    doc.text('⚡ Profile Shift Detected', margin + 5, yPos)
    yPos += 8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(146, 64, 14) // amber-800
    const shiftText = `Your primary style shifts from ${naturalProfile.name} to ${adaptiveProfile.name} under stress. This indicates you adapt your behavior significantly when facing pressure.`
    addWrappedText(doc, shiftText, margin + 5, yPos, contentWidth - 10, 6, 10)
  }

  addPageNumber(doc, currentPage, totalPages)
  currentPage++

  // ========== PAGE 3: SCORE BREAKDOWN ==========
  doc.addPage()
  yPos = margin
  addHeader(doc, 'Detailed Score Breakdown')

  yPos = 40
  // Natural Scores Table
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(5, 150, 105) // emerald-600
  doc.text('Natural Style Scores', margin, yPos)
  yPos += 10

  // Table header
  doc.setFillColor(240, 253, 244) // emerald-50
  doc.rect(margin, yPos, contentWidth, 10, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Style', margin + 5, yPos + 7)
  doc.text('Score', margin + contentWidth - 30, yPos + 7, { align: 'right' })
  yPos += 10

  // Table rows
  const discTypes: DISCType[] = ['D', 'I', 'S', 'C']
  discTypes.forEach((type, index) => {
    const profile = profileDescriptions[type]
    const score = scores.natural[type]
    const [r, g, b] = hexToRgb(profile.color)

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252) // slate-50
      doc.rect(margin, yPos, contentWidth, 8, 'F')
    }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(r, g, b)
    doc.text(profile.name, margin + 5, yPos + 6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    doc.text(`${score}%`, margin + contentWidth - 30, yPos + 6, { align: 'right' })

    // Progress bar
    const barWidth = (score / 100) * (contentWidth - 60)
    doc.setFillColor(r, g, b)
    doc.rect(margin + 50, yPos + 3, barWidth, 4, 'F')

    yPos += 8
  })

  yPos += 10

  // Adaptive Scores Table
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(234, 88, 12) // orange-600
  doc.text('Adaptive Style Scores', margin, yPos)
  yPos += 10

  // Table header
  doc.setFillColor(255, 247, 237) // orange-50
  doc.rect(margin, yPos, contentWidth, 10, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Style', margin + 5, yPos + 7)
  doc.text('Score', margin + contentWidth - 30, yPos + 7, { align: 'right' })
  yPos += 10

  // Table rows
  discTypes.forEach((type, index) => {
    const profile = profileDescriptions[type]
    const score = scores.adaptive[type]
    const [r, g, b] = hexToRgb(profile.color)

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252) // slate-50
      doc.rect(margin, yPos, contentWidth, 8, 'F')
    }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(r, g, b)
    doc.text(profile.name, margin + 5, yPos + 6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    doc.text(`${score}%`, margin + contentWidth - 30, yPos + 6, { align: 'right' })

    // Progress bar
    const barWidth = (score / 100) * (contentWidth - 60)
    doc.setFillColor(r, g, b)
    doc.rect(margin + 50, yPos + 3, barWidth, 4, 'F')

    yPos += 8
  })

  addPageNumber(doc, currentPage, totalPages)
  currentPage++

  // ========== PAGE 4: VISUALIZATIONS ==========
  doc.addPage()
  yPos = margin
  addHeader(doc, 'Visual Analysis')

  yPos = 40
  if (barChartImage) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    doc.text('Natural vs Adaptive Comparison', margin, yPos)
    yPos += 10

    // Scale chart to fit width while preserving original aspect ratio
    let imgWidth = contentWidth
    let imgHeight = (barChartImage.height / barChartImage.width) * imgWidth
    const maxHeight = pageHeight - margin - yPos - 20
    if (imgHeight > maxHeight) {
      const scale = maxHeight / imgHeight
      imgHeight *= scale
      imgWidth *= scale
    }

    doc.addImage(barChartImage.src, 'PNG', margin, yPos, imgWidth, imgHeight)
    yPos += imgHeight + 15
  }

  if (radarChartImage && yPos < pageHeight - 80) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    doc.text('Profile Radar Chart', margin, yPos)
    yPos += 10

    let imgWidth = contentWidth
    let imgHeight = (radarChartImage.height / radarChartImage.width) * imgWidth
    const maxHeight = pageHeight - margin - yPos - 20
    if (imgHeight > maxHeight) {
      const scale = maxHeight / imgHeight
      imgHeight *= scale
      imgWidth *= scale
    }

    if (yPos + imgHeight < pageHeight - 20) {
      doc.addImage(radarChartImage.src, 'PNG', margin, yPos, imgWidth, imgHeight)
    } else {
      // Move to next page if not enough space
      doc.addPage()
      currentPage++
      yPos = margin + 20
      addHeader(doc, 'Profile Radar Chart')
      yPos = 40
      doc.addImage(radarChartImage.src, 'PNG', margin, yPos, imgWidth, imgHeight)
    }
  }

  addPageNumber(doc, currentPage, totalPages)
  currentPage++

  // ========== PAGE 5: PROFILE DESCRIPTIONS ==========
  doc.addPage()
  yPos = margin
  addHeader(doc, 'Understanding DISC Styles')

  yPos = 40
  doc.setFontSize(11)
  doc.setTextColor(51, 65, 85)
  yPos = addWrappedText(
    doc,
    'The DISC model identifies four primary behavioral styles. Understanding these styles helps you recognize your natural tendencies and how you adapt under pressure.',
    margin,
    yPos,
    contentWidth,
    7,
    11
  )
  yPos += 10

  discTypes.forEach((type) => {
    const profile = profileDescriptions[type]
    const [r, g, b] = hexToRgb(profile.color)

    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage()
      currentPage++
      yPos = margin + 20
    }

    // Style header
    doc.setFillColor(248, 250, 252) // slate-50
    doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(r, g, b)
    doc.text(`${type} - ${profile.name}`, margin + 5, yPos + 8)
    yPos += 15

    // Description
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    yPos = addWrappedText(doc, profile.naturalDesc, margin, yPos, contentWidth, 6, 10) + 5

    // Traits
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text('Traits: ' + profile.traits.join(', '), margin, yPos)
    yPos += 12
  })

  addPageNumber(doc, currentPage, totalPages)
  currentPage++

  // ========== PAGE 6: YOUR PERSONALIZED INSIGHTS ==========
  doc.addPage()
  yPos = margin
  addHeader(doc, 'Your Personalized Insights')

  yPos = 40

  // Natural Strengths
  doc.setFillColor(240, 253, 244) // emerald-50
  doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'F')
  doc.setDrawColor(5, 150, 105) // emerald-600
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'S')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(5, 150, 105)
  doc.text('💚 Your Natural Strengths', margin + 5, yPos + 10)
  yPos += 12
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  yPos = addWrappedText(doc, naturalProfile.naturalDesc, margin + 5, yPos, contentWidth - 10, 6, 10) + 5
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text('Key Traits: ' + naturalProfile.traits.join(', '), margin + 5, yPos)
  yPos += 60

  // Under Stress
  doc.setFillColor(255, 247, 237) // orange-50
  doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'F')
  doc.setDrawColor(234, 88, 12) // orange-600
  doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'S')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(234, 88, 12)
  doc.text('⚡ Under Stress You May...', margin + 5, yPos + 10)
  yPos += 12
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  yPos = addWrappedText(doc, adaptiveProfile.adaptiveDesc, margin + 5, yPos, contentWidth - 10, 6, 10) + 15

  // Growth Opportunities
  doc.setFillColor(239, 246, 255) // blue-50
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F')
  doc.setDrawColor(37, 99, 235) // blue-600
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'S')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(37, 99, 235)
  doc.text('🎯 Growth Opportunities', margin + 5, yPos + 10)
  yPos += 12
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  addWrappedText(doc, naturalProfile.growth, margin + 5, yPos, contentWidth - 10, 6, 10)

  addPageNumber(doc, currentPage, totalPages)
  currentPage++

  // ========== PAGE 7: COMMUNICATION PREFERENCES ==========
  doc.addPage()
  yPos = margin
  addHeader(doc, 'How to Communicate With You')

  yPos = 40
  const commGuide = communicationGuides[scores.primaryNatural]

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)
  yPos = addWrappedText(
    doc,
    `These guidelines are based primarily on your Natural style (${scores.primaryNatural} – ${naturalProfile.name}). Share this page with your manager and teammates to help them communicate with you more effectively.`,
    margin,
    yPos,
    contentWidth,
    7,
    11
  ) + 6

  // How to communicate
  doc.setFillColor(248, 250, 252) // slate-50
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F')
  doc.setDrawColor(22, 163, 74) // emerald-600
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'S')
  yPos += 8
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(22, 163, 74)
  doc.text('Do this when communicating with you', margin + 5, yPos)
  yPos += 8
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)
  commGuide.howToCommunicate.forEach((tip) => {
    yPos = addWrappedText(doc, `• ${tip}`, margin + 7, yPos, contentWidth - 12, 5, 9) + 1
  })
  yPos += 4

  // How not to communicate
  if (yPos > pageHeight - 60) {
    addPageNumber(doc, currentPage, totalPages)
    currentPage++
    doc.addPage()
    yPos = margin
    addHeader(doc, 'How to Communicate With You (cont.)')
    yPos = 40
  }

  doc.setFillColor(254, 242, 242) // red-50
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F')
  doc.setDrawColor(239, 68, 68) // red-500
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'S')
  yPos += 8
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(185, 28, 28)
  doc.text('Avoid this when communicating with you', margin + 5, yPos)
  yPos += 8
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)
  commGuide.howNotToCommunicate.forEach((tip) => {
    yPos = addWrappedText(doc, `• ${tip}`, margin + 7, yPos, contentWidth - 12, 5, 9) + 1
  })
  yPos += 4

  // Self vs others perception
  if (yPos > pageHeight - 60) {
    addPageNumber(doc, currentPage, totalPages)
    currentPage++
    doc.addPage()
    yPos = margin
    addHeader(doc, 'How to Communicate With You (cont.)')
    yPos = 40
  }

  const columnWidth = (contentWidth - 10) / 2
  const leftX = margin
  const rightX = margin + columnWidth + 10

  // Self-perception column
  doc.setFillColor(239, 246, 255) // blue-50
  doc.roundedRect(leftX, yPos, columnWidth, 40, 3, 3, 'F')
  doc.setDrawColor(37, 99, 235) // blue-600
  doc.roundedRect(leftX, yPos, columnWidth, 40, 3, 3, 'S')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(37, 99, 235)
  doc.text('How you likely see yourself', leftX + 4, yPos + 8)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)
  let innerY = yPos + 13
  commGuide.selfPerception.forEach((item) => {
    innerY = addWrappedText(doc, `• ${item}`, leftX + 5, innerY, columnWidth - 8, 5, 9) + 1
  })

  // Others-perception column
  doc.setFillColor(248, 250, 252) // slate-50
  doc.roundedRect(rightX, yPos, columnWidth, 40, 3, 3, 'F')
  doc.setDrawColor(148, 163, 184) // slate-400
  doc.roundedRect(rightX, yPos, columnWidth, 40, 3, 3, 'S')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('How others may see you', rightX + 4, yPos + 8)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  innerY = yPos + 13
  commGuide.othersPerception.forEach((item) => {
    innerY = addWrappedText(doc, `• ${item}`, rightX + 5, innerY, columnWidth - 8, 5, 9) + 1
  })

  addPageNumber(doc, currentPage, totalPages)
  currentPage++

  // ========== PAGE 8: UNDERSTANDING YOUR SCORES & NEXT STEPS ==========
  doc.addPage()
  yPos = margin
  addHeader(doc, 'Understanding Your Scores & Next Steps')

  yPos = 40

  // Understanding Scores Section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('What Do These Scores Mean?', margin, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)
  const understandingText = `Your Natural Style (shown in green) represents how you typically behave when you're relaxed and in your comfort zone. This is your default way of interacting with the world.

Your Adaptive Style (shown in orange) shows how you respond under stress, pressure, or challenging situations. When facing difficulties, you may shift your behavior patterns.

The percentages indicate the relative strength of each DISC dimension in your profile. Higher percentages mean that dimension plays a more significant role in your behavioral style.`

  yPos = addWrappedText(doc, understandingText, margin, yPos, contentWidth, 7, 10) + 10

  // Next Steps Section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Next Steps', margin, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)

  const nextSteps = [
    'Review your natural strengths and consider how to leverage them in your work',
    'Be aware of your stress responses and develop strategies to manage them effectively',
    'Share your profile with your team to improve communication and collaboration',
    'Use your understanding of adaptive behaviors to recognize when you\'re under stress',
    'Focus on the growth opportunities identified to continue your personal development',
    'Consider retaking this assessment in 6-12 months to track your development',
  ]

  nextSteps.forEach((step, index) => {
    if (yPos > pageHeight - 30) {
      doc.addPage()
      currentPage++
      yPos = margin + 20
    }
    doc.text(`${index + 1}. ${step}`, margin + 5, yPos)
    yPos += 8
  })

  yPos += 10

  // Closing
  if (yPos < pageHeight - 40) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(71, 85, 105)
    doc.text(
      'Thank you for completing the DISC Assessment. Use these insights to enhance your self-awareness and professional growth.',
      margin,
      yPos,
      { maxWidth: contentWidth }
    )
  }

  addPageNumber(doc, currentPage, totalPages)
  currentPage++

  // ========== DRIVING FORCES SECTION (if available) ==========
  if (hasDrivingForces && result.drivingForces) {
    const dfScores = result.drivingForces.scores || {}

    type PairConfig = {
      motivator: string
      centerLabel: string
      leftCode: string
      rightCode: string
      leftLabel: string
      rightLabel: string
      color: string
      description: string
    }

    const drivingForcePairs: PairConfig[] = [
      {
        motivator: 'Knowledge',
        centerLabel: 'Theoretical',
        leftCode: 'KI',
        rightCode: 'KN',
        leftLabel: 'Instinctive',
        rightLabel: 'Intellectual',
        color: '#b91c1c',
        description:
          'Instinctive relies on past experience and gut feel, while Intellectual is energized by learning, research, and theory.',
      },
      {
        motivator: 'Utility',
        centerLabel: 'Utilitarian',
        leftCode: 'US',
        rightCode: 'UR',
        leftLabel: 'Selfless',
        rightLabel: 'Resourceful',
        color: '#b45309',
        description:
          'Selfless is motivated by helping and completing tasks regardless of personal return, while Resourceful looks for efficiency and strong ROI.',
      },
      {
        motivator: 'Surroundings',
        centerLabel: 'Aesthetic',
        leftCode: 'SO',
        rightCode: 'SH',
        leftLabel: 'Objective',
        rightLabel: 'Harmonious',
        color: '#7e22ce',
        description:
          'Objective cares most about function and practicality, while Harmonious values beauty, balance, and how the environment feels.',
      },
      {
        motivator: 'Others',
        centerLabel: 'Social',
        leftCode: 'OI',
        rightCode: 'OA',
        leftLabel: 'Intentional',
        rightLabel: 'Altruistic',
        color: '#047857',
        description:
          'Intentional helps others to achieve specific outcomes, while Altruistic is driven to support people simply because they care.',
      },
      {
        motivator: 'Power',
        centerLabel: 'Individualistic',
        leftCode: 'PC',
        rightCode: 'PD',
        leftLabel: 'Collaborative',
        rightLabel: 'Commanding',
        color: '#111827',
        description:
          'Collaborative prefers shared influence and supporting the team, while Commanding seeks autonomy, status, and clear authority.',
      },
      {
        motivator: 'Methodologies',
        centerLabel: 'Traditional',
        leftCode: 'MR',
        rightCode: 'MS',
        leftLabel: 'Receptive',
        rightLabel: 'Structured',
        color: '#4b5563',
        description:
          'Receptive embraces new ideas and flexible approaches, while Structured prefers proven systems, traditions, and consistency.',
      },
    ]

    doc.addPage()
    yPos = margin
    addHeader(doc, 'Your Driving Forces Profile')

    yPos = 40
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    yPos = addWrappedText(
      doc,
      'These six scales show how strongly you lean toward each side of the core motivators that influence your decisions and priorities.',
      margin,
      yPos,
      contentWidth,
      7,
      11
    ) + 8

    const trackLeft = margin + 40
    const trackRight = pageWidth - margin - 40
    const trackWidth = trackRight - trackLeft

    drivingForcePairs.forEach((pair) => {
      if (yPos > pageHeight - 30) {
        addPageNumber(doc, currentPage, totalPages)
        currentPage++
        doc.addPage()
        yPos = margin
        addHeader(doc, 'Your Driving Forces Profile (cont.)')
        yPos = 40
      }

      const leftRaw = Number(dfScores[pair.leftCode] || 0)
      const rightRaw = Number(dfScores[pair.rightCode] || 0)
      const total = leftRaw + rightRaw

      let leftPct = 50
      let rightPct = 50

      if (total > 0) {
        leftPct = Math.round((leftRaw / total) * 100)
        rightPct = 100 - leftPct
      }

      const indicatorPosition = trackLeft + (rightPct / 100) * trackWidth

      const [r, g, b] = hexToRgb(pair.color)

      // Row header
      doc.setFontSize(9)
      doc.setTextColor(100, 116, 139)
      doc.text(pair.motivator, margin, yPos)
      doc.text(pair.centerLabel, pageWidth / 2, yPos, { align: 'center' })

      const rowCenterY = yPos + 8

      // Base track
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(1)
      doc.line(trackLeft, rowCenterY, trackRight, rowCenterY)

      // Filled segment
      doc.setDrawColor(r, g, b)
      doc.setLineWidth(2.5)
      doc.line(trackLeft, rowCenterY, indicatorPosition, rowCenterY)

      // Ticks at 0/25/50/75/100
      doc.setDrawColor(209, 213, 219)
      doc.setLineWidth(0.5)
      ;[0, 25, 50, 75, 100].forEach((v) => {
        const x = trackLeft + (v / 100) * trackWidth
        doc.line(x, rowCenterY - 2, x, rowCenterY + 2)
      })

      // Indicator knob
      doc.setFillColor(r, g, b)
      doc.setDrawColor(255, 255, 255)
      doc.circle(indicatorPosition, rowCenterY, 2.5, 'FD')

      // Left circle
      const leftCircleX = margin + 15
      doc.setFillColor(r, g, b)
      doc.setDrawColor(r, g, b)
      doc.circle(leftCircleX, rowCenterY, 6, 'FD')
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      doc.text(String(leftPct), leftCircleX, rowCenterY + 2, { align: 'center' })

      // Right circle
      const rightCircleX = pageWidth - margin - 15
      doc.setFillColor(r, g, b)
      doc.setDrawColor(r, g, b)
      doc.circle(rightCircleX, rowCenterY, 6, 'FD')
      doc.text(String(rightPct), rightCircleX, rowCenterY + 2, { align: 'center' })

      // Labels under circles
      doc.setFontSize(8)
      doc.setTextColor(55, 65, 81)
      doc.text(pair.leftLabel, leftCircleX, rowCenterY + 11, { align: 'center' })
      doc.text(pair.rightLabel, rightCircleX, rowCenterY + 11, { align: 'center' })

      yPos += 20
    })

    yPos += 6

    if (yPos > pageHeight - 40) {
      addPageNumber(doc, currentPage, totalPages)
      currentPage++
      doc.addPage()
      yPos = margin
      addHeader(doc, 'Your Driving Forces Profile (cont.)')
      yPos = 40
    }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    doc.text('What each scale means', margin, yPos)
    yPos += 8

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)

    drivingForcePairs.forEach((pair) => {
      const text = `${pair.leftLabel} → ${pair.rightLabel}: ${pair.description}`
      yPos = addWrappedText(doc, text, margin, yPos, contentWidth, 5, 9) + 2
      if (yPos > pageHeight - 30) {
        addPageNumber(doc, currentPage, totalPages)
        currentPage++
        doc.addPage()
        yPos = margin
        addHeader(doc, 'Your Driving Forces Profile (cont.)')
        yPos = 40
      }
    })

    addPageNumber(doc, currentPage, totalPages)
  }

  // Save the PDF
  const fileName = `DISC_Assessment_${result.name.replace(/\s+/g, '_')}_${result.date}.pdf`
  doc.save(fileName)
}

interface AdminDashboardData {
  teamNaturalDist: Array<{ name: string; fullName: string; natural: number; adaptive: number; fill: string }>
  avgByDept: Array<{
    dept: string
    count: number
    D_nat: number
    I_nat: number
    S_nat: number
    C_nat: number
    D_adp: number
    I_adp: number
    S_adp: number
    C_adp: number
  }>
  shifters: Result[]
}

interface AdminDepartmentCollaboration {
  compatibilityMatrix: Array<{
    dept1: string
    dept2: string
    score: number
    details: {
      primaryType1: DISCType
      primaryType2: DISCType
      naturalCompatibility: number
      adaptiveCompatibility: number
      scoreDifference: number
      reasoning: string
    }
  }>
  profileComparisons: Array<{
    dept1: string
    dept2: string
    comparison: {
      natural: {
        dept1Scores: Scores
        dept2Scores: Scores
        differences: Scores
        primaryType1: DISCType
        primaryType2: DISCType
      }
      adaptive: {
        dept1Scores: Scores
        dept2Scores: Scores
        differences: Scores
        primaryType1: DISCType
        primaryType2: DISCType
      }
      summary: string
    }
  }>
  recommendations: Array<{
    dept1: string
    dept2: string
    recommendations: Array<{
      text: string
      priority: 'high' | 'medium' | 'low'
      category: 'communication' | 'workflow' | 'conflict' | 'synergy'
    }>
  }>
  metadata: {
    departmentCount: number
    totalPairs: number
    available: boolean
  }
}

interface AdminInsights {
  compatibility: Array<{ dept1: string; dept2: string; score: number; reasoning: string }>
  teamComposition: Array<{ department: string; strengths: string[]; gaps: string[]; recommendations: string[] }>
  communicationInsights: Array<{ department: string; style: string; preferences: string[]; recommendations: string[] }>
  departmentCollaboration?: AdminDepartmentCollaboration
}

export async function generateAdminDashboardPDF(
  allResults: Result[],
  insights: AdminInsights | null,
  dashboardData: AdminDashboardData,
  dashboardElement?: HTMLElement | null
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin
  let yPos = margin
  let currentPage = 1

  // Capture dashboard screenshot if provided
  let dashboardImage: { src: string; width: number; height: number } | null = null
  if (dashboardElement) {
    try {
      const canvas = await html2canvas(dashboardElement, {
        backgroundColor: '#ffffff',
        scale: 1.5,
        useCORS: true,
        logging: false,
      })
      dashboardImage = {
        src: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height,
      }
    } catch (error) {
      console.error('Failed to capture dashboard:', error)
    }
  }

  // Helper function to add page numbers
  const addPageNumber = (pageNum: number, totalPages: number) => {
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 30, pageHeight - 10, {
      align: 'right',
    })
  }

  // Helper function to add header
  const addHeader = (title: string) => {
    doc.setFontSize(16)
    doc.setTextColor(30, 41, 59)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin, yPos)
    doc.setLineWidth(0.5)
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPos + 5, pageWidth - margin, yPos + 5)
    yPos += 12
  }

  // Helper function to check if new page needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      addPageNumber(currentPage, 10)
      doc.addPage()
      currentPage++
      yPos = margin
      return true
    }
    return false
  }

  // ========== PAGE 1: COVER PAGE ==========
  doc.setFillColor(248, 250, 252)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  doc.setFontSize(32)
  doc.setTextColor(30, 41, 59)
  doc.setFont('helvetica', 'bold')
  doc.text('Team Analytics Dashboard', pageWidth / 2, 60, { align: 'center' })

  doc.setFontSize(18)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text('DISC Assessment Report', pageWidth / 2, 75, { align: 'center' })

  yPos = 100
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'S')

  yPos += 12
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text(`Total Assessments: ${allResults.length}`, margin + 10, yPos)
  yPos += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(`Report Generated: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`, margin + 10, yPos)

  const departments = [...new Set(allResults.map((r) => r.dept))]
  yPos += 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Departments: ${departments.length}`, margin + 10, yPos)
  yPos += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text(departments.join(', '), margin + 10, yPos, { maxWidth: contentWidth - 20 })

  addPageNumber(currentPage, 10)
  currentPage++

  // ========== PAGE 2: EXECUTIVE SUMMARY ==========
  doc.addPage()
  yPos = margin
  addHeader('Executive Summary')

  yPos += 5
  doc.setFontSize(11)
  doc.setTextColor(51, 65, 85)
  doc.setFont('helvetica', 'normal')

  const summaryText = `This report provides a comprehensive analysis of ${allResults.length} DISC assessments across ${departments.length} department${departments.length > 1 ? 's' : ''}. The analysis includes natural and adaptive behavioral styles, profile shifts, department averages, and team insights.`
  const summaryLines = doc.splitTextToSize(summaryText, contentWidth)
  doc.text(summaryLines, margin, yPos)
  yPos += summaryLines.length * 6 + 10

  // Key Statistics
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Key Statistics', margin, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)

  const shiftPercentage = Math.round((dashboardData.shifters.length / allResults.length) * 100)
  const stats = [
    `Total Employees Assessed: ${allResults.length}`,
    `Departments: ${departments.length}`,
    `Profile Shifters: ${dashboardData.shifters.length} (${shiftPercentage}%)`,
    `Average Natural D: ${Math.round(dashboardData.avgByDept.reduce((sum, d) => sum + d.D_nat, 0) / dashboardData.avgByDept.length)}%`,
    `Average Natural I: ${Math.round(dashboardData.avgByDept.reduce((sum, d) => sum + d.I_nat, 0) / dashboardData.avgByDept.length)}%`,
    `Average Natural S: ${Math.round(dashboardData.avgByDept.reduce((sum, d) => sum + d.S_nat, 0) / dashboardData.avgByDept.length)}%`,
    `Average Natural C: ${Math.round(dashboardData.avgByDept.reduce((sum, d) => sum + d.C_nat, 0) / dashboardData.avgByDept.length)}%`,
  ]

  stats.forEach((stat) => {
    checkNewPage(8)
    doc.text(`• ${stat}`, margin + 5, yPos)
    yPos += 7
  })

  addPageNumber(currentPage, 10)
  currentPage++

  // ========== PAGE 3: PROFILE DISTRIBUTION ==========
  doc.addPage()
  yPos = margin
  addHeader('Profile Distribution Analysis')

  yPos += 5
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Primary Type Distribution (Natural vs Adaptive)', margin, yPos)
  yPos += 10

  // Table header
  doc.setFillColor(240, 253, 244)
  doc.rect(margin, yPos, contentWidth, 8, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Type', margin + 5, yPos + 6)
  doc.text('Natural', margin + 50, yPos + 6)
  doc.text('Adaptive', margin + 90, yPos + 6)
  doc.text('Total', margin + contentWidth - 30, yPos + 6, { align: 'right' })
  yPos += 8

  // Table rows
  dashboardData.teamNaturalDist.forEach((item, index) => {
    checkNewPage(8)
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, yPos, contentWidth, 7, 'F')
    }

    const [r, g, b] = hexToRgb(item.fill)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(r, g, b)
    doc.text(item.name, margin + 5, yPos + 5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    doc.text(`${item.natural}`, margin + 50, yPos + 5)
    doc.text(`${item.adaptive}`, margin + 90, yPos + 5)
    doc.text(`${item.natural + item.adaptive}`, margin + contentWidth - 30, yPos + 5, { align: 'right' })
    yPos += 7
  })

  yPos += 5
  checkNewPage(15)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Profile Shifters', margin, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)
  const shifterText = `${dashboardData.shifters.length} employees (${shiftPercentage}%) shift their primary DISC type under stress. This indicates significant behavioral adaptation when facing pressure.`
  const shifterLines = doc.splitTextToSize(shifterText, contentWidth)
  doc.text(shifterLines, margin, yPos)
  yPos += shifterLines.length * 6 + 5

  if (dashboardData.shifters.length > 0 && dashboardData.shifters.length <= 20) {
    checkNewPage(10)
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    dashboardData.shifters.slice(0, 10).forEach((shifter) => {
      checkNewPage(6)
      const [nr, ng, nb] = hexToRgb(profileDescriptions[shifter.primaryNatural].color)
      const [ar, ag, ab] = hexToRgb(profileDescriptions[shifter.primaryAdaptive].color)
      doc.setTextColor(51, 65, 85)
      doc.text(`${shifter.name} (${shifter.dept}): `, margin + 5, yPos)
      doc.setTextColor(nr, ng, nb)
      doc.text(shifter.primaryNatural, margin + 45, yPos)
      doc.setTextColor(100, 100, 100)
      doc.text('→', margin + 52, yPos)
      doc.setTextColor(ar, ag, ab)
      doc.text(shifter.primaryAdaptive, margin + 58, yPos)
      yPos += 6
    })
  }

  addPageNumber(currentPage, 10)
  currentPage++

  // ========== PAGE 4: DEPARTMENT ANALYSIS ==========
  doc.addPage()
  yPos = margin
  addHeader('Department Average Scores')

  yPos += 5
  // Table header
  doc.setFillColor(240, 253, 244)
  doc.rect(margin, yPos, contentWidth, 10, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Dept', margin + 2, yPos + 7)
  doc.text('#', margin + 35, yPos + 7)
  doc.text('D', margin + 42, yPos + 7)
  doc.text('I', margin + 50, yPos + 7)
  doc.text('S', margin + 58, yPos + 7)
  doc.text('C', margin + 66, yPos + 7)
  doc.setFillColor(255, 247, 237)
  doc.rect(margin + 75, yPos, contentWidth - 75, 10, 'F')
  doc.text('D', margin + 77, yPos + 7)
  doc.text('I', margin + 85, yPos + 7)
  doc.text('S', margin + 93, yPos + 7)
  doc.text('C', margin + 101, yPos + 7)
  yPos += 10

  // Table rows
  dashboardData.avgByDept.forEach((row, index) => {
    checkNewPage(7)
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, yPos, contentWidth, 6, 'F')
    }

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    doc.text(row.dept.substring(0, 12), margin + 2, yPos + 5)
    doc.text(`${row.count}`, margin + 35, yPos + 5)
    doc.text(`${row.D_nat}`, margin + 42, yPos + 5)
    doc.text(`${row.I_nat}`, margin + 50, yPos + 5)
    doc.text(`${row.S_nat}`, margin + 58, yPos + 5)
    doc.text(`${row.C_nat}`, margin + 66, yPos + 5)
    doc.text(`${row.D_adp}`, margin + 77, yPos + 5)
    doc.text(`${row.I_adp}`, margin + 85, yPos + 5)
    doc.text(`${row.S_adp}`, margin + 93, yPos + 5)
    doc.text(`${row.C_adp}`, margin + 101, yPos + 5)
    yPos += 6
  })

  yPos += 5
  checkNewPage(10)
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Natural scores shown in green background, Adaptive scores in orange background', margin, yPos)

  addPageNumber(currentPage, 10)
  currentPage++

  // ========== PAGE 5: ALL RESULTS TABLE ==========
  doc.addPage()
  yPos = margin
  addHeader('All Employee Results')

  yPos += 5
  // Table header
  doc.setFillColor(240, 253, 244)
  doc.rect(margin, yPos, contentWidth, 8, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Name', margin + 2, yPos + 6)
  doc.text('Dept', margin + 35, yPos + 6)
  doc.text('Nat', margin + 50, yPos + 6)
  doc.text('Adp', margin + 58, yPos + 6)
  doc.text('D', margin + 65, yPos + 6)
  doc.text('I', margin + 72, yPos + 6)
  doc.text('S', margin + 79, yPos + 6)
  doc.text('C', margin + 86, yPos + 6)
  doc.text('Date', margin + 93, yPos + 6)
  yPos += 8

  // Table rows (limit to first 30 for space)
  allResults.slice(0, 30).forEach((result, index) => {
    checkNewPage(6)
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, yPos, contentWidth, 5, 'F')
    }

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    doc.text(result.name.substring(0, 12), margin + 2, yPos + 4)
    doc.text(result.dept.substring(0, 8), margin + 35, yPos + 4)
    
    const [nr, ng, nb] = hexToRgb(profileDescriptions[result.primaryNatural].color)
    doc.setTextColor(nr, ng, nb)
    doc.text(result.primaryNatural, margin + 50, yPos + 4)
    
    const [ar, ag, ab] = hexToRgb(profileDescriptions[result.primaryAdaptive].color)
    doc.setTextColor(ar, ag, ab)
    doc.text(result.primaryAdaptive, margin + 58, yPos + 4)
    
    doc.setTextColor(51, 65, 85)
    doc.text(`${result.natural.D}/${result.adaptive.D}`, margin + 65, yPos + 4)
    doc.text(`${result.natural.I}/${result.adaptive.I}`, margin + 72, yPos + 4)
    doc.text(`${result.natural.S}/${result.adaptive.S}`, margin + 79, yPos + 4)
    doc.text(`${result.natural.C}/${result.adaptive.C}`, margin + 86, yPos + 4)
    doc.text(result.date, margin + 93, yPos + 4)
    yPos += 5
  })

  if (allResults.length > 30) {
    yPos += 5
    checkNewPage(8)
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`... and ${allResults.length - 30} more results (see full data in JSON export)`, margin, yPos)
  }

  addPageNumber(currentPage, 10)
  currentPage++

  // ========== PAGE 6+: INSIGHTS ==========
  if (insights) {
    const collaboration = insights.departmentCollaboration

    // Department Compatibility / Collaboration (uses new analysis when available, falls back to basic compatibility)
    const compatibilityEntries =
      collaboration && collaboration.metadata?.available && collaboration.compatibilityMatrix?.length
        ? collaboration.compatibilityMatrix.map((entry) => ({
            dept1: entry.dept1,
            dept2: entry.dept2,
            score: entry.score,
            reasoning: entry.details.reasoning,
            naturalCompatibility: entry.details.naturalCompatibility,
            adaptiveCompatibility: entry.details.adaptiveCompatibility,
          }))
        : insights.compatibility.map((comp) => ({
            dept1: comp.dept1,
            dept2: comp.dept2,
            score: comp.score,
            reasoning: comp.reasoning,
          }))

    if (compatibilityEntries.length > 0) {
      checkNewPage(30)
      addHeader('Department Compatibility Overview')
      yPos += 5

      // If we have collaboration metadata, include a short summary
      if (collaboration && collaboration.metadata) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(51, 65, 85)
        const metaText = `Analyzed ${collaboration.metadata.departmentCount} departments across ${collaboration.metadata.totalPairs} department pairings.`
        const metaLines = doc.splitTextToSize(metaText, contentWidth)
        doc.text(metaLines, margin, yPos)
        yPos += metaLines.length * 5 + 6
      }

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 41, 59)
      doc.text('Top Department Pairings', margin, yPos)
      yPos += 8

      compatibilityEntries
        .slice()
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .forEach((comp) => {
          checkNewPage(28)
          doc.setFillColor(255, 255, 255)
          doc.roundedRect(margin, yPos, contentWidth, 24, 2, 2, 'F')
          doc.setDrawColor(200, 200, 200)
          doc.roundedRect(margin, yPos, contentWidth, 24, 2, 2, 'S')

          doc.setFontSize(11)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(30, 41, 59)
          doc.text(`${comp.dept1} ↔ ${comp.dept2}`, margin + 5, yPos + 8)
          
          const scoreColor = comp.score >= 80 ? [16, 185, 129] : comp.score >= 60 ? [245, 158, 11] : [239, 68, 68]
          doc.setFontSize(16)
          doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
          doc.text(`${comp.score}%`, margin + contentWidth - 20, yPos + 8, { align: 'right' })

          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100, 116, 139)
          if (typeof (comp as any).naturalCompatibility === 'number' && typeof (comp as any).adaptiveCompatibility === 'number') {
            doc.text(
              `Natural compatibility: ${(comp as any).naturalCompatibility}%   Adaptive compatibility: ${(comp as any).adaptiveCompatibility}%`,
              margin + 5,
              yPos + 15
            )
          }

          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(71, 85, 105)
          const reasoningLines = doc.splitTextToSize(comp.reasoning, contentWidth - 10)
          doc.text(reasoningLines, margin + 5, yPos + 19)
          yPos += 24 + reasoningLines.length * 3.5
        })

      addPageNumber(currentPage, 10)
      currentPage++
    }

    // Department Profile Comparisons (new collaboration analysis)
    if (
      collaboration &&
      collaboration.metadata?.available &&
      collaboration.profileComparisons &&
      collaboration.profileComparisons.length > 0
    ) {
      doc.addPage()
      currentPage++
      yPos = margin
      addHeader('Department Profile Comparisons')
      yPos += 3

      const comparisons = collaboration.profileComparisons.slice(0, 5)

      comparisons.forEach((comp) => {
        checkNewPage(40)
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(margin, yPos, contentWidth, 32, 2, 2, 'F')
        doc.setDrawColor(200, 200, 200)
        doc.roundedRect(margin, yPos, contentWidth, 32, 2, 2, 'S')

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 41, 59)
        doc.text(`${comp.dept1} vs ${comp.dept2}`, margin + 5, yPos + 7)

        // Natural primary types
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(71, 85, 105)
        doc.text(
          `Natural: ${comp.comparison.natural.primaryType1} vs ${comp.comparison.natural.primaryType2}`,
          margin + 5,
          yPos + 13
        )

        // Simple D/I/S/C line for natural and adaptive
        const nat = comp.comparison.natural
        const adp = comp.comparison.adaptive
        doc.text(
          `Natural scores  - ${comp.dept1}: D${nat.dept1Scores.D} I${nat.dept1Scores.I} S${nat.dept1Scores.S} C${nat.dept1Scores.C}`,
          margin + 5,
          yPos + 18
        )
        doc.text(
          `                 ${comp.dept2}: D${nat.dept2Scores.D} I${nat.dept2Scores.I} S${nat.dept2Scores.S} C${nat.dept2Scores.C}`,
          margin + 5,
          yPos + 23
        )
        doc.text(
          `Adaptive scores - ${comp.dept1}: D${adp.dept1Scores.D} I${adp.dept1Scores.I} S${adp.dept1Scores.S} C${adp.dept1Scores.C}`,
          margin + 5,
          yPos + 28
        )

        yPos += 34

        // Summary text below card
        checkNewPage(14)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(51, 65, 85)
        const summaryLines = doc.splitTextToSize(comp.comparison.summary, contentWidth)
        doc.text(summaryLines, margin, yPos)
        yPos += summaryLines.length * 5 + 6
      })

      addPageNumber(currentPage, 10)
    }

    // Collaboration Recommendations (new collaboration analysis)
    if (
      collaboration &&
      collaboration.metadata?.available &&
      collaboration.recommendations &&
      collaboration.recommendations.length > 0
    ) {
      doc.addPage()
      currentPage++
      yPos = margin
      addHeader('Collaboration Recommendations')
      yPos += 3

      const priorityRank: Record<'high' | 'medium' | 'low', number> = {
        high: 0,
        medium: 1,
        low: 2,
      }

      const recSets = collaboration.recommendations
        .slice()
        .sort((a, b) => {
          const aHigh = a.recommendations.filter((r) => r.priority === 'high').length
          const bHigh = b.recommendations.filter((r) => r.priority === 'high').length
          return bHigh - aHigh
        })
        .slice(0, 5)

      recSets.forEach((set) => {
        checkNewPage(45)
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(margin, yPos, contentWidth, 36, 2, 2, 'F')
        doc.setDrawColor(200, 200, 200)
        doc.roundedRect(margin, yPos, contentWidth, 36, 2, 2, 'S')

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 41, 59)
        doc.text(`${set.dept1} ↔ ${set.dept2}`, margin + 5, yPos + 8)

        let recY = yPos + 14
        set.recommendations
          .slice()
          .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
          .slice(0, 4)
          .forEach((rec) => {
            if (recY > yPos + 32) return
            const color =
              rec.priority === 'high' ? [220, 38, 38] : rec.priority === 'medium' ? [217, 119, 6] : [37, 99, 235]

            doc.setFontSize(8)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(color[0], color[1], color[2])
            doc.text(rec.priority.toUpperCase(), margin + 5, recY)

            doc.setFont('helvetica', 'normal')
            doc.setTextColor(51, 65, 85)
            const recLines = doc.splitTextToSize(`${rec.category}: ${rec.text}`, contentWidth - 40)
            doc.text(recLines, margin + 30, recY)
            recY += recLines.length * 4.5 + 3
          })

        yPos += 38
      })

      addPageNumber(currentPage, 10)
    }

    // Team Composition (legacy insights)
    if (insights.teamComposition.length > 0) {
      checkNewPage(30)
      addHeader('Team Composition Analysis')
      yPos += 5

      insights.teamComposition.forEach((comp) => {
        checkNewPage(40)
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, 'F')
        doc.setDrawColor(200, 200, 200)
        doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, 'S')

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 41, 59)
        doc.text(comp.department, margin + 5, yPos + 8)

        let lineY = yPos + 15
        if (comp.strengths.length > 0) {
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(5, 150, 105)
          doc.text('Strengths:', margin + 5, lineY)
          lineY += 6
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.setTextColor(51, 65, 85)
          comp.strengths.forEach((strength) => {
            doc.text(`• ${strength}`, margin + 10, lineY)
            lineY += 5
          })
        }

        if (comp.gaps.length > 0) {
          lineY += 2
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(234, 88, 12)
          doc.text('Potential Gaps:', margin + 5, lineY)
          lineY += 6
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.setTextColor(51, 65, 85)
          comp.gaps.forEach((gap) => {
            doc.text(`• ${gap}`, margin + 10, lineY)
            lineY += 5
          })
        }

        yPos += 40
      })

      addPageNumber(currentPage, 10)
      currentPage++
    }

    // Communication Insights (legacy insights)
    if (insights.communicationInsights.length > 0) {
      checkNewPage(30)
      addHeader('Communication Style Insights')
      yPos += 5

      // Team-wide communication style snapshot based on Natural styles
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 41, 59)
      doc.text('Team Communication Preferences (Natural Styles)', margin, yPos)
      yPos += 7

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(51, 65, 85)
      dashboardData.teamNaturalDist.forEach((item) => {
        const guide = communicationGuides[item.name as DISCType]
        const line = `${item.name} - ${profileDescriptions[item.name as DISCType].name} (${item.natural} people): ${guide.styleLabel}`
        const lines = doc.splitTextToSize(line, contentWidth)
        doc.text(lines, margin + 5, yPos)
        yPos += lines.length * 4.5 + 2
      })

      yPos += 5

      insights.communicationInsights.forEach((insight) => {
        checkNewPage(40)
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, 'F')
        doc.setDrawColor(200, 200, 200)
        doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, 'S')

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 41, 59)
        doc.text(`${insight.department} - ${insight.style}`, margin + 5, yPos + 8)

        let lineY = yPos + 15
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(51, 65, 85)
        insight.preferences.forEach((pref) => {
          doc.text(`• ${pref}`, margin + 5, lineY)
          lineY += 5
        })

        yPos += 35
      })

      addPageNumber(currentPage, 10)
      currentPage++
    }
  }

  // ========== FINAL PAGE: SUMMARY ==========
  checkNewPage(30)
  addHeader('Report Summary')

  yPos += 5
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.setFont('helvetica', 'normal')

  const summaryPoints = [
    `This report analyzed ${allResults.length} DISC assessments across ${departments.length} department${departments.length > 1 ? 's' : ''}.`,
    `${dashboardData.shifters.length} employees (${shiftPercentage}%) demonstrate profile shifts under stress.`,
    `The data provides insights into team composition, communication styles, and department compatibility.`,
    `Use this information to improve team collaboration, communication, and organizational effectiveness.`,
  ]

  summaryPoints.forEach((point) => {
    checkNewPage(8)
    doc.text(`• ${point}`, margin + 5, yPos)
    yPos += 7
  })

  yPos += 10
  checkNewPage(15)
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'italic')
  doc.text(
    'For detailed individual results and complete data, refer to the JSON export available in the dashboard.',
    margin,
    yPos,
    { maxWidth: contentWidth }
  )

  addPageNumber(currentPage, 10)

  // Save the PDF
  const fileName = `Team_Analytics_Dashboard_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
