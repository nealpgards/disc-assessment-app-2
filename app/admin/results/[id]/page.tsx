'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import IndividualReportView from '@/components/IndividualReportView'

interface Result {
  id?: number
  name: string
  email?: string
  dept: string
  teamCode?: string
  natural: {
    D: number
    I: number
    S: number
    C: number
  }
  adaptive: {
    D: number
    I: number
    S: number
    C: number
  }
  primaryNatural: 'D' | 'I' | 'S' | 'C'
  primaryAdaptive: 'D' | 'I' | 'S' | 'C'
  date: string
  drivingForces?: {
    scores: Record<string, number>
    primaryForces: Record<string, string>
  }
}

export default function AdminResultPage() {
  const router = useRouter()
  const params = useParams()
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check admin access via sessionStorage
    const teamCode = sessionStorage.getItem('adminTeamCode')
    if (!teamCode) {
      // Redirect to admin login if no team code found
      router.push('/admin')
      return
    }

    // Fetch result data
    const fetchResult = async () => {
      try {
        const id = params.id as string
        const response = await fetch(`/api/results/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Result not found')
          } else {
            setError('Failed to load result')
          }
          setLoading(false)
          return
        }

        const data = await response.json()
        setResult(data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching result:', err)
        setError('Failed to load result')
        setLoading(false)
      }
    }

    fetchResult()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center py-10">
        <div className="text-center">
          <p className="text-slate-600">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center py-10">
        <div className="max-w-md w-full px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Error</h1>
              <p className="text-sm text-slate-600 mb-4">{error || 'Result not found'}</p>
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <IndividualReportView result={result} />
}

