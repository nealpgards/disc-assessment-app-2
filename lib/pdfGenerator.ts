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

  addPageNumber(doc, currentPage, 7)
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

  addPageNumber(doc, currentPage, 7)
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

  addPageNumber(doc, currentPage, 7)
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

  addPageNumber(doc, currentPage, 7)
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

  addPageNumber(doc, currentPage, 7)
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

  addPageNumber(doc, currentPage, 7)
  currentPage++

  // ========== PAGE 7: UNDERSTANDING YOUR SCORES & NEXT STEPS ==========
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

  addPageNumber(doc, currentPage, 7)

  // Save the PDF
  const fileName = `DISC_Assessment_${result.name.replace(/\s+/g, '_')}_${result.date}.pdf`
  doc.save(fileName)
}
